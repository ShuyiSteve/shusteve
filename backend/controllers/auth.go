package controllers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"shusteve/backend/models"
)

type loginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// POST /api/auth/login
func (a *App) Login(c *gin.Context) {
	var in loginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	var user models.User
	if err := a.DB.Where("email = ?", strings.TrimSpace(in.Email)).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(in.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := a.generateToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("shusteve_token", token, int(a.Config.TokenTTL.Seconds()), "/", "", a.Config.CookieSecure, true)
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email})
}

// POST /api/auth/logout
func (a *App) Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("shusteve_token", "", -1, "/", "", a.Config.CookieSecure, true)
	c.Status(http.StatusNoContent)
}

// GET /api/auth/me — returns the current admin (protected).
func (a *App) Me(c *gin.Context) {
	userID := c.GetUint("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	var user models.User
	if err := a.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email})
}

func (a *App) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   float64(user.ID),
		"email": user.Email,
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(a.Config.TokenTTL).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.Config.JWTSecret))
}
