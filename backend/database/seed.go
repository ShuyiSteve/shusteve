package database

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"shusteve/backend/config"
	"shusteve/backend/models"
)

// SeedAdmin creates the single admin account from environment variables on
// first boot. It never overwrites an existing account and never runs twice.
func SeedAdmin(db *gorm.DB, cfg *config.Config) error {
	var count int64
	if err := db.Model(&models.User{}).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Email:        cfg.AdminEmail,
		PasswordHash: string(hash),
	}
	if err := db.Create(&user).Error; err != nil {
		return err
	}
	log.Printf("Created initial admin account: %s", cfg.AdminEmail)
	return nil
}

// SeedSampleData inserts placeholder content on first boot so the site is not
// empty. It is idempotent and only runs when SEED_DATA=true.
func SeedSampleData(db *gorm.DB, cfg *config.Config) error {
	if !cfg.SeedData {
		return nil
	}

	var postCount int64
	if err := db.Model(&models.Post{}).Count(&postCount).Error; err != nil {
		return err
	}
	if postCount > 0 {
		return nil
	}

	now := time.Now()
	first := now.AddDate(0, 0, -6)
	second := now.AddDate(0, 0, -2)

	posts := []models.Post{
		{
			Title:         "Building My Personal Website From Scratch",
			Slug:          "building-my-personal-website",
			Description:   "How I designed and built this site with React, TypeScript, Go and MySQL — and everything I learned along the way.",
			Content:       "# Building My Personal Website\n\nI wanted a place to write, share photos and keep a vlog — so I built one.\n\n## The stack\n\n- **Frontend:** React, TypeScript, Vite, Tailwind CSS\n- **Backend:** Go, Gin, GORM\n- **Database:** MySQL\n\n## Why Go?\n\nI'm learning Go this year and wanted a real project to practice with. Gin and GORM keep things simple while staying fast.\n\n> This is placeholder content — replace it from the admin dashboard.\n",
			CoverImageURL: "https://picsum.photos/seed/shusteve-post-1/1600/900",
			Category:      "Projects",
			Published:     true,
			CreatedAt:     first,
			UpdatedAt:     first,
		},
		{
			Title:         "First Year of Computer Science at UCL",
			Slug:          "first-year-cs-ucl",
			Description:   "Notes from my first year — what I'm studying, what surprised me, and how I stay organised.",
			Content:       "# First Year at UCL\n\nUniversity is a different kind of challenge.\n\n## What I'm studying\n\n- Discrete mathematics\n- Algorithms and data structures\n- Programming in Python and Go\n\nI'll keep updating this space with real notes as the year goes on.\n",
			CoverImageURL: "https://picsum.photos/seed/shusteve-post-2/1600/900",
			Category:      "University",
			Published:     true,
			CreatedAt:     second,
			UpdatedAt:     second,
		},
	}

	if err := db.Create(&posts).Error; err != nil {
		return err
	}

	photos := []models.Photo{
		{Title: "Sample portrait", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-1/1200/1500", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 0)), CreatedAt: first, UpdatedAt: first},
		{Title: "Sample street", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-2/1200/900", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 2)), CreatedAt: first, UpdatedAt: first},
		{Title: "Sample campus", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-3/1200/800", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 5)), CreatedAt: first, UpdatedAt: first},
		{Title: "Sample skyline", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-4/1200/1200", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 8)), CreatedAt: second, UpdatedAt: second},
		{Title: "Sample detail", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-5/1200/1500", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 12)), CreatedAt: second, UpdatedAt: second},
		{Title: "Sample night", Description: "A placeholder photo.", ImageURL: "https://picsum.photos/seed/shusteve-6/1200/900", Location: "London, UK", TakenAt: timePtr(now.AddDate(0, -1, 15)), CreatedAt: second, UpdatedAt: second},
	}
	if err := db.Create(&photos).Error; err != nil {
		return err
	}

	vlogs := []models.Vlog{
		{Title: "Sample vlog — replace me", Description: "Placeholder entry. Replace the URL with your own YouTube video.", YouTubeURL: "https://www.youtube.com/watch?v=REPLACE_ME", ThumbnailURL: "https://picsum.photos/seed/shusteve-vlog-1/1280/720", PublishedAt: timePtr(now.AddDate(0, -1, 3)), CreatedAt: first, UpdatedAt: first},
		{Title: "Sample vlog — replace me", Description: "Placeholder entry. Replace the URL with your own YouTube video.", YouTubeURL: "https://www.youtube.com/watch?v=REPLACE_ME", ThumbnailURL: "https://picsum.photos/seed/shusteve-vlog-2/1280/720", PublishedAt: timePtr(now.AddDate(0, 0, -5)), CreatedAt: second, UpdatedAt: second},
	}
	if err := db.Create(&vlogs).Error; err != nil {
		return err
	}

	log.Println("Seeded placeholder content (posts, photos, vlogs)")
	return nil
}

func timePtr(t time.Time) *time.Time {
	return &t
}
