package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"shusteve/backend/config"
	"shusteve/backend/controllers"
	"shusteve/backend/database"
	"shusteve/backend/routes"
	"shusteve/backend/storage"
)

func main() {
	cfg := config.Load()

	if cfg.GinMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	db := database.Connect(cfg)
	if err := database.Migrate(db); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	if err := database.SeedAdmin(db, cfg); err != nil {
		log.Fatalf("seed admin failed: %v", err)
	}
	if err := database.SeedSampleData(db, cfg); err != nil {
		log.Fatalf("seed sample data failed: %v", err)
	}

	store, err := storage.NewLocalStorage(cfg.UploadDir)
	if err != nil {
		log.Fatalf("storage init failed: %v", err)
	}

	app := &controllers.App{DB: db, Storage: store, Config: cfg}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())
	routes.Setup(r, app)

	log.Printf("shuSteve backend listening on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
