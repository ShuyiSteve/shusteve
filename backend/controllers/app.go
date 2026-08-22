package controllers

import (
	"gorm.io/gorm"

	"shusteve/backend/config"
	"shusteve/backend/storage"
)

// App holds the shared dependencies used by every controller.
type App struct {
	DB      *gorm.DB
	Storage storage.Storage
	Config  *config.Config
}
