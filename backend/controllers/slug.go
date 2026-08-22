package controllers

import (
	"fmt"
	"strings"

	"gorm.io/gorm"

	"shusteve/backend/models"
)

// slugify converts a title or user-provided slug into a URL-safe slug.
func slugify(input string) string {
	input = strings.ToLower(strings.TrimSpace(input))
	var b strings.Builder
	lastDash := false
	for _, r := range input {
		switch {
		case (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9'):
			b.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_' || r == '.' || r == '/':
			if !lastDash {
				b.WriteByte('-')
				lastDash = true
			}
		}
	}
	return strings.Trim(b.String(), "-")
}

// uniqueSlug ensures the slug does not collide with an existing post by
// appending a numeric suffix when necessary.
func uniqueSlug(db *gorm.DB, base string, excludeID uint) string {
	if base == "" {
		base = "post"
	}
	candidate := base
	for i := 2; ; i++ {
		var count int64
		q := db.Model(&models.Post{}).Where("slug = ?", candidate)
		if excludeID != 0 {
			q = q.Where("id <> ?", excludeID)
		}
		q.Count(&count)
		if count == 0 {
			return candidate
		}
		candidate = fmt.Sprintf("%s-%d", base, i)
	}
}
