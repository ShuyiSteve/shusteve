package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"shusteve/backend/models"
)

// GET /api/admin/stats
func (a *App) AdminStats(c *gin.Context) {
	var posts, photos, vlogs int64
	a.DB.Model(&models.Post{}).Count(&posts)
	a.DB.Model(&models.Photo{}).Count(&photos)
	a.DB.Model(&models.Vlog{}).Count(&vlogs)
	c.JSON(http.StatusOK, gin.H{"posts": posts, "photos": photos, "vlogs": vlogs})
}
