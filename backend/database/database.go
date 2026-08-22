package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"shusteve/backend/config"
	"shusteve/backend/models"
)

// Connect opens a MySQL connection with a short retry loop so it survives
// Docker Compose startup ordering (backend starting before MySQL is ready).
func Connect(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName,
	)

	logLevel := logger.Warn
	if cfg.GinMode == "debug" {
		logLevel = logger.Info
	}

	var db *gorm.DB
	var err error
	for attempt := 1; attempt <= 20; attempt++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logLevel),
		})
		if err == nil {
			break
		}
		log.Printf("Database not ready (attempt %d/20): %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.User{}, &models.Post{}, &models.Photo{}, &models.Vlog{})
}
