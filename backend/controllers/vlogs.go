package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"shusteve/backend/models"
)

type vlogInput struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description"`
	YouTubeURL   string `json:"youtubeUrl" binding:"required"`
	ThumbnailURL string `json:"thumbnailUrl"`
	PublishedAt  string `json:"publishedAt"`
}

func validHTTPURL(s string) bool {
	return strings.HasPrefix(s, "http://") || strings.HasPrefix(s, "https://")
}

// GET /api/vlogs — public.
func (a *App) ListVlogs(c *gin.Context) {
	var vlogs = []models.Vlog{}
	if err := a.DB.Order("published_at DESC, created_at DESC").Find(&vlogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load vlogs"})
		return
	}
	c.JSON(http.StatusOK, vlogs)
}

// GET /api/admin/vlogs
func (a *App) AdminListVlogs(c *gin.Context) {
	var vlogs = []models.Vlog{}
	if err := a.DB.Order("created_at DESC").Find(&vlogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load vlogs"})
		return
	}
	c.JSON(http.StatusOK, vlogs)
}

// POST /api/admin/vlogs
func (a *App) AdminCreateVlog(c *gin.Context) {
	var in vlogInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	in.YouTubeURL = strings.TrimSpace(in.YouTubeURL)
	if in.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	if !validHTTPURL(in.YouTubeURL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "youtubeUrl must be a valid http(s) URL"})
		return
	}

	vlog := models.Vlog{
		Title:        in.Title,
		Description:  strings.TrimSpace(in.Description),
		YouTubeURL:   in.YouTubeURL,
		ThumbnailURL: strings.TrimSpace(in.ThumbnailURL),
		PublishedAt:  parseDate(in.PublishedAt),
	}
	if err := a.DB.Create(&vlog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save vlog"})
		return
	}
	c.JSON(http.StatusCreated, vlog)
}

// PUT /api/admin/vlogs/:id
func (a *App) AdminUpdateVlog(c *gin.Context) {
	var vlog models.Vlog
	if err := a.DB.First(&vlog, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "vlog not found"})
		return
	}

	var in vlogInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	in.YouTubeURL = strings.TrimSpace(in.YouTubeURL)
	if in.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}
	if !validHTTPURL(in.YouTubeURL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "youtubeUrl must be a valid http(s) URL"})
		return
	}

	vlog.Title = in.Title
	vlog.Description = strings.TrimSpace(in.Description)
	vlog.YouTubeURL = in.YouTubeURL
	vlog.ThumbnailURL = strings.TrimSpace(in.ThumbnailURL)
	vlog.PublishedAt = parseDate(in.PublishedAt)

	if err := a.DB.Save(&vlog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update vlog"})
		return
	}
	c.JSON(http.StatusOK, vlog)
}

// DELETE /api/admin/vlogs/:id
func (a *App) AdminDeleteVlog(c *gin.Context) {
	if err := a.DB.Delete(&models.Vlog{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete vlog"})
		return
	}
	c.Status(http.StatusNoContent)
}
