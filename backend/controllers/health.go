package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *App) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}
