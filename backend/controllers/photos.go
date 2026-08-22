package controllers

import (
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"shusteve/backend/models"
)

var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

func validateImage(file multipart.File, header *multipart.FileHeader, maxBytes int64) error {
	if header.Size > maxBytes {
		return fmt.Errorf("file too large (max %d MB)", maxBytes/1024/1024)
	}
	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return fmt.Errorf("could not read file")
	}
	contentType := http.DetectContentType(buf[:n])
	if !allowedImageTypes[contentType] {
		return fmt.Errorf("unsupported file type: %s", contentType)
	}
	return nil
}

func parseDate(s string) *time.Time {
	s = strings.TrimSpace(s)
	if s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return nil
	}
	return &t
}

// GET /api/photos — public gallery.
func (a *App) ListPhotos(c *gin.Context) {
	var photos = []models.Photo{}
	if err := a.DB.Order("taken_at DESC, created_at DESC").Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load photos"})
		return
	}
	c.JSON(http.StatusOK, photos)
}

// GET /api/admin/photos
func (a *App) AdminListPhotos(c *gin.Context) {
	var photos = []models.Photo{}
	if err := a.DB.Order("created_at DESC").Find(&photos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load photos"})
		return
	}
	c.JSON(http.StatusOK, photos)
}

// POST /api/admin/photos — multipart upload.
func (a *App) AdminCreatePhoto(c *gin.Context) {
	file, header, err := c.Request.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "photo file is required"})
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

	photo := models.Photo{
		Title:       strings.TrimSpace(c.PostForm("title")),
		Description: strings.TrimSpace(c.PostForm("description")),
		ImageURL:    url,
		Location:    strings.TrimSpace(c.PostForm("location")),
		TakenAt:     parseDate(c.PostForm("takenAt")),
	}
	if err := a.DB.Create(&photo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save photo"})
		return
	}
	c.JSON(http.StatusCreated, photo)
}

// PUT /api/admin/photos/:id — update metadata, optionally replace the file.
func (a *App) AdminUpdatePhoto(c *gin.Context) {
	var photo models.Photo
	if err := a.DB.First(&photo, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "photo not found"})
		return
	}

	if file, header, ferr := c.Request.FormFile("photo"); ferr == nil {
		defer file.Close()
		if err := validateImage(file, header, a.Config.MaxUploadMB*1024*1024); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		newURL, err := a.Storage.Save(file, header)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}
		oldURL := photo.ImageURL
		photo.ImageURL = newURL
		_ = a.Storage.Delete(oldURL)
	} else if !errors.Is(ferr, http.ErrMissingFile) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file upload"})
		return
	}

	photo.Title = strings.TrimSpace(c.PostForm("title"))
	photo.Description = strings.TrimSpace(c.PostForm("description"))
	photo.Location = strings.TrimSpace(c.PostForm("location"))
	photo.TakenAt = parseDate(c.PostForm("takenAt"))

	if err := a.DB.Save(&photo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update photo"})
		return
	}
	c.JSON(http.StatusOK, photo)
}

// DELETE /api/admin/photos/:id
func (a *App) AdminDeletePhoto(c *gin.Context) {
	var photo models.Photo
	if err := a.DB.First(&photo, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "photo not found"})
		return
	}
	_ = a.Storage.Delete(photo.ImageURL)
	if err := a.DB.Delete(&models.Photo{}, photo.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete photo"})
		return
	}
	c.Status(http.StatusNoContent)
}
