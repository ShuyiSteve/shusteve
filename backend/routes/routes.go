package routes

import (
	"github.com/gin-gonic/gin"

	"shusteve/backend/controllers"
	"shusteve/backend/middleware"
)

func Setup(r *gin.Engine, app *controllers.App) {
	r.Use(middleware.CORS(app.Config.AllowedOrigin))
	r.Use(gin.Recovery())

	// Serve uploaded files from local storage.
	r.Static("/uploads", app.Config.UploadDir)

	api := r.Group("/api")
	{
		api.GET("/health", app.Health)
		api.GET("/posts", app.ListPosts)
		api.GET("/posts/:slug", app.GetPost)
		api.GET("/photos", app.ListPhotos)
		api.GET("/vlogs", app.ListVlogs)

		auth := api.Group("/auth")
		{
			auth.POST("/login", app.Login)
			auth.POST("/logout", app.Logout)
			auth.GET("/me", middleware.AuthRequired(app.Config), app.Me)
		}

		admin := api.Group("/admin", middleware.AuthRequired(app.Config))
		{
			admin.GET("/stats", app.AdminStats)

			admin.GET("/posts", app.AdminListPosts)
			admin.POST("/posts", app.AdminCreatePost)
			admin.PUT("/posts/:id", app.AdminUpdatePost)
			admin.DELETE("/posts/:id", app.AdminDeletePost)

			admin.GET("/photos", app.AdminListPhotos)
			admin.POST("/photos", app.AdminCreatePhoto)
			admin.PUT("/photos/:id", app.AdminUpdatePhoto)
			admin.DELETE("/photos/:id", app.AdminDeletePhoto)

			admin.GET("/vlogs", app.AdminListVlogs)
			admin.POST("/vlogs", app.AdminCreateVlog)
			admin.PUT("/vlogs/:id", app.AdminUpdateVlog)
			admin.DELETE("/vlogs/:id", app.AdminDeleteVlog)
		}
	}
}
