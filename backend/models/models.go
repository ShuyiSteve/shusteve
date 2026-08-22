package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Post struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Title         string    `gorm:"size:255;not null" json:"title"`
	Slug          string    `gorm:"uniqueIndex;size:255;not null" json:"slug"`
	Description   string    `gorm:"type:text" json:"description"`
	Content       string    `gorm:"type:longtext" json:"content"`
	CoverImageURL string    `gorm:"size:512" json:"coverImageUrl"`
	Category      string    `gorm:"size:100;index" json:"category"`
	Published     bool      `gorm:"default:false;index" json:"published"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type Photo struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string     `gorm:"size:255" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	ImageURL    string     `gorm:"size:512;not null" json:"imageUrl"`
	Location    string     `gorm:"size:255" json:"location"`
	TakenAt     *time.Time `json:"takenAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

type Vlog struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Title        string     `gorm:"size:255;not null" json:"title"`
	Description  string     `gorm:"type:text" json:"description"`
	YouTubeURL   string     `gorm:"size:512;not null" json:"youtubeUrl"`
	ThumbnailURL string     `gorm:"size:512" json:"thumbnailUrl"`
	PublishedAt  *time.Time `json:"publishedAt"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}
