package controllers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"shusteve/backend/models"
)

type postInput struct {
	Title         string `json:"title" binding:"required"`
	Slug          string `json:"slug"`
	Description   string `json:"description"`
	Content       string `json:"content"`
	CoverImageURL string `json:"coverImageUrl"`
	Category      string `json:"category"`
	Published     bool   `json:"published"`
}

// GET /api/posts — public, published posts only.
func (a *App) ListPosts(c *gin.Context) {
	var posts = []models.Post{}
	if err := a.DB.Where("published = ?", true).Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GET /api/posts/:slug — public, published post by slug.
func (a *App) GetPost(c *gin.Context) {
	slug := c.Param("slug")
	var post models.Post
	if err := a.DB.Where("slug = ? AND published = ?", slug, true).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// GET /api/admin/posts — all posts including drafts.
func (a *App) AdminListPosts(c *gin.Context) {
	var posts = []models.Post{}
	if err := a.DB.Order("created_at DESC").Find(&posts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// POST /api/admin/posts
func (a *App) AdminCreatePost(c *gin.Context) {
	var in postInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	base := slugify(in.Slug)
	if base == "" {
		base = slugify(in.Title)
	}

	post := models.Post{
		Title:         in.Title,
		Slug:          uniqueSlug(a.DB, base, 0),
		Description:   strings.TrimSpace(in.Description),
		Content:       in.Content,
		CoverImageURL: strings.TrimSpace(in.CoverImageURL),
		Category:      strings.TrimSpace(in.Category),
		Published:     in.Published,
	}
	if err := a.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create post"})
		return
	}
	c.JSON(http.StatusCreated, post)
}

// PUT /api/admin/posts/:id
func (a *App) AdminUpdatePost(c *gin.Context) {
	var post models.Post
	if err := a.DB.First(&post, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	var in postInput
	if err := c.ShouldBindJSON(&in); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	in.Title = strings.TrimSpace(in.Title)
	if in.Title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title is required"})
		return
	}

	post.Title = in.Title
	post.Description = strings.TrimSpace(in.Description)
	post.Content = in.Content
	post.CoverImageURL = strings.TrimSpace(in.CoverImageURL)
	post.Category = strings.TrimSpace(in.Category)
	post.Published = in.Published

	if newSlug := slugify(in.Slug); newSlug != "" && newSlug != post.Slug {
		post.Slug = uniqueSlug(a.DB, newSlug, post.ID)
	}

	if err := a.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post"})
		return
	}
	c.JSON(http.StatusOK, post)
}

// DELETE /api/admin/posts/:id
func (a *App) AdminDeletePost(c *gin.Context) {
	if err := a.DB.Delete(&models.Post{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete post"})
		return
	}
	c.Status(http.StatusNoContent)
}
