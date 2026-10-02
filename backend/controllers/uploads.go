package controllers

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"

	"shusteve/backend/models"
	"shusteve/backend/storage"
)

// uploadURLPattern matches the /uploads/... URLs this app hands out. It is used
// to find images referenced from inside a Markdown body.
var uploadURLPattern = regexp.MustCompile(`/uploads/[A-Za-z0-9._-]+`)

// POST /api/admin/uploads — upload a single image that belongs to a blog post
// (cover art or an inline picture).
//
// This deliberately does NOT create a Photo record: post images stay out of the
// public gallery. It reuses the same size + MIME validation as /api/admin/photos
// and the same Storage abstraction, so anything served under /uploads/* works
// with the exact same URL on localhost and in production.
func (a *App) AdminUploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	if err := validateImage(file, header, a.Config.MaxUploadMB*1024*1024); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	url, err := a.Storage.Save(file, header)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"url": url})
}

// GET /api/admin/uploads — every stored image, each flagged with whether a post,
// photo or vlog still points at it. Unused files are the leftovers you can
// safely delete.
func (a *App) AdminListUploads(c *gin.Context) {
	files, err := a.Storage.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list uploads"})
		return
	}

	used, err := a.collectUsedUploadURLs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check references"})
		return
	}

	type uploadRow struct {
		storage.File
		Used bool `json:"used"`
	}

	rows := make([]uploadRow, 0, len(files))
	usedCount := 0
	for _, f := range files {
		isUsed := used[f.URL]
		if isUsed {
			usedCount++
		}
		rows = append(rows, uploadRow{File: f, Used: isUsed})
	}

	c.JSON(http.StatusOK, gin.H{
		"files":       rows,
		"total":       len(rows),
		"usedCount":   usedCount,
		"unusedCount": len(rows) - usedCount,
	})
}

// DELETE /api/admin/uploads — remove one stored image.
//
// Body: {"url": "/uploads/xxx.jpg"}
//
// It refuses to delete a file that is still referenced by a post, photo or vlog
// (409) so a live page can never be broken by accident. Pass ?force=true to
// delete it anyway — the editor uses that when you replace a cover image.
func (a *App) AdminDeleteUpload(c *gin.Context) {
	var in struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url is required"})
		return
	}
	if !strings.HasPrefix(in.URL, "/uploads/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only /uploads/... paths can be deleted"})
		return
	}

	if c.Query("force") != "true" {
		used, err := a.collectUsedUploadURLs()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check references"})
			return
		}
		if used[in.URL] {
			c.JSON(http.StatusConflict, gin.H{
				"error": "this image is still used by a post or photo — remove it there first, or delete it from the editor",
			})
			return
		}
	}

	if err := a.Storage.Delete(in.URL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete file"})
		return
	}

	c.Status(http.StatusNoContent)
}

// collectUsedUploadURLs gathers every /uploads/... URL currently referenced by
// a post cover, a post body, a gallery photo or a vlog thumbnail.
func (a *App) collectUsedUploadURLs() (map[string]bool, error) {
	used := map[string]bool{}

	var posts []models.Post
	if err := a.DB.Select("cover_image_url", "content").Find(&posts).Error; err != nil {
		return nil, err
	}
	for _, p := range posts {
		if p.CoverImageURL != "" {
			used[p.CoverImageURL] = true
		}
		for _, match := range uploadURLPattern.FindAllString(p.Content, -1) {
			used[match] = true
		}
	}

	var photos []models.Photo
	if err := a.DB.Select("image_url").Find(&photos).Error; err != nil {
		return nil, err
	}
	for _, p := range photos {
		if p.ImageURL != "" {
			used[p.ImageURL] = true
		}
	}

	var vlogs []models.Vlog
	if err := a.DB.Select("thumbnail_url").Find(&vlogs).Error; err != nil {
		return nil, err
	}
	for _, v := range vlogs {
		if v.ThumbnailURL != "" {
			used[v.ThumbnailURL] = true
		}
	}

	return used, nil
}
