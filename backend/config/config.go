package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	GinMode       string
	DBHost        string
	DBPort        string
	DBUser        string
	DBPassword    string
	DBName        string
	JWTSecret     string
	TokenTTL      time.Duration
	AdminEmail    string
	AdminPassword string
	CookieSecure  bool
	AllowedOrigin string
	UploadDir     string
	MaxUploadMB   int64
	SeedData      bool
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v := os.Getenv(key); v != "" {
		b, err := strconv.ParseBool(v)
		if err == nil {
			return b
		}
	}
	return fallback
}

func getEnvInt64(key string, fallback int64) int64 {
	if v := os.Getenv(key); v != "" {
		n, err := strconv.ParseInt(v, 10, 64)
		if err == nil {
			return n
		}
	}
	return fallback
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	ttlHours := getEnvInt64("TOKEN_TTL_HOURS", 72)

	return &Config{
		Port:          getEnv("PORT", "8080"),
		GinMode:       getEnv("GIN_MODE", "debug"),
		DBHost:        getEnv("DB_HOST", "127.0.0.1"),
		DBPort:        getEnv("DB_PORT", "3306"),
		DBUser:        getEnv("DB_USER", "shusteve"),
		DBPassword:    getEnv("DB_PASSWORD", "shusteve_password"),
		DBName:        getEnv("DB_NAME", "shusteve"),
		JWTSecret:     getEnv("JWT_SECRET", "insecure-dev-secret-change-me"),
		TokenTTL:      time.Duration(ttlHours) * time.Hour,
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@shusteve.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "change_me"),
		CookieSecure:  getEnvBool("COOKIE_SECURE", false),
		AllowedOrigin: getEnv("ALLOWED_ORIGIN", "http://localhost:5173"),
		UploadDir:     getEnv("UPLOAD_DIR", "./uploads"),
		MaxUploadMB:   getEnvInt64("MAX_UPLOAD_MB", 10),
		SeedData:      getEnvBool("SEED_DATA", true),
	}
}
