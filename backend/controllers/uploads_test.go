package controllers

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"

	"shusteve/backend/config"
	"shusteve/backend/storage"
)

func newUploadTestApp(t *testing.T) (*App, string) {
	t.Helper()
	gin.SetMode(gin.TestMode)

	dir := t.TempDir()
	store, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("storage init: %v", err)
	}
	return &App{Storage: store, Config: &config.Config{MaxUploadMB: 10}}, dir
}

func multipartBody(t *testing.T, field, filename string, content []byte) (*bytes.Buffer, string) {
	t.Helper()
	body := &bytes.Buffer{}
	w := multipart.NewWriter(body)
	part, err := w.CreateFormFile(field, filename)
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		t.Fatalf("write part: %v", err)
	}
	if err := w.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}
	return body, w.FormDataContentType()
}

func pngBytes(t *testing.T) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 4, 4))
	img.Set(0, 0, color.RGBA{R: 255, G: 143, B: 112, A: 255}) // shuSteve orange
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("encode png: %v", err)
	}
	return buf.Bytes()
}

func serveUpload(app *App, body *bytes.Buffer, contentType string) *httptest.ResponseRecorder {
	r := gin.New()
	r.POST("/api/admin/uploads", app.AdminUploadImage)
	req := httptest.NewRequest(http.MethodPost, "/api/admin/uploads", body)
	req.Header.Set("Content-Type", contentType)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func uploadOne(t *testing.T, app *App, filename string) string {
	t.Helper()
	body, contentType := multipartBody(t, "file", filename, pngBytes(t))
	rec := serveUpload(app, body, contentType)
	if rec.Code != http.StatusCreated {
		t.Fatalf("upload %s: status = %d, body = %s", filename, rec.Code, rec.Body.String())
	}
	var out struct {
		URL string `json:"url"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode upload response: %v", err)
	}
	return out.URL
}

func serveDelete(app *App, target string) *httptest.ResponseRecorder {
	r := gin.New()
	r.DELETE("/api/admin/uploads", app.AdminDeleteUpload)
	payload, _ := json.Marshal(map[string]string{"url": target})

	// force=true skips the database reference check, which lets these tests run
	// without a MySQL instance.
	req := httptest.NewRequest(http.MethodDelete, "/api/admin/uploads?force=true", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	return rec
}

func TestAdminUploadImageSavesFileAndReturnsURL(t *testing.T) {
	app, dir := newUploadTestApp(t)

	url := uploadOne(t, app, "cover.png")
	if !strings.HasPrefix(url, "/uploads/") {
		t.Fatalf("url = %q, want a /uploads/... path", url)
	}
	if _, err := os.Stat(filepath.Join(dir, filepath.Base(url))); err != nil {
		t.Fatalf("uploaded file was not written to disk: %v", err)
	}
}

func TestAdminUploadImageRejectsNonImage(t *testing.T) {
	app, _ := newUploadTestApp(t)

	// A text file renamed to .png must still be rejected: the handler sniffs the
	// real content type instead of trusting the extension.
	body, contentType := multipartBody(t, "file", "evil.png", []byte("this is definitely not an image"))
	rec := serveUpload(app, body, contentType)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400; body = %s", rec.Code, rec.Body.String())
	}
}

func TestAdminUploadImageRequiresFile(t *testing.T) {
	app, _ := newUploadTestApp(t)

	body, contentType := multipartBody(t, "wrongfield", "cover.png", pngBytes(t))
	rec := serveUpload(app, body, contentType)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400; body = %s", rec.Code, rec.Body.String())
	}
}

func TestAdminDeleteUploadRemovesFile(t *testing.T) {
	app, dir := newUploadTestApp(t)

	url := uploadOne(t, app, "cover.png")
	rec := serveDelete(app, url)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("status = %d, want 204; body = %s", rec.Code, rec.Body.String())
	}
	if _, err := os.Stat(filepath.Join(dir, filepath.Base(url))); !os.IsNotExist(err) {
		t.Fatalf("file should be gone, stat err = %v", err)
	}
}

func TestAdminDeleteUploadRejectsForeignPath(t *testing.T) {
	app, _ := newUploadTestApp(t)

	rec := serveDelete(app, "/etc/passwd")
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400; body = %s", rec.Code, rec.Body.String())
	}
}

func TestDeleteCannotEscapeUploadDir(t *testing.T) {
	parent := t.TempDir()
	dir := filepath.Join(parent, "uploads")
	store, err := storage.NewLocalStorage(dir)
	if err != nil {
		t.Fatalf("storage init: %v", err)
	}

	outside := filepath.Join(parent, "secret.txt")
	if err := os.WriteFile(outside, []byte("keep me"), 0o644); err != nil {
		t.Fatalf("write outside file: %v", err)
	}

	// A crafted URL must not be able to reach a file outside the upload dir.
	if err := store.Delete("/uploads/../secret.txt"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, err := os.Stat(outside); err != nil {
		t.Fatalf("file outside the upload dir was affected: %v", err)
	}
}

func TestStorageListReturnsUploadedFiles(t *testing.T) {
	app, _ := newUploadTestApp(t)

	uploadOne(t, app, "a.png")
	uploadOne(t, app, "b.png")

	files, err := app.Storage.List()
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(files) != 2 {
		t.Fatalf("got %d files, want 2", len(files))
	}
	for _, f := range files {
		if !strings.HasPrefix(f.URL, "/uploads/") {
			t.Fatalf("bad url %q", f.URL)
		}
		if f.Size == 0 {
			t.Fatalf("size should not be 0 for %q", f.Name)
		}
		if f.ModifiedAt.IsZero() {
			t.Fatalf("modifiedAt should be set for %q", f.Name)
		}
	}
}

func TestUploadedURLPatternFindsMarkdownImages(t *testing.T) {
	content := "![a](/uploads/1759322845123456789.jpg)\n\nand ![b](/uploads/1759322845987654321.webp)"
	got := uploadURLPattern.FindAllString(content, -1)
	if len(got) != 2 {
		t.Fatalf("got %d matches, want 2: %v", len(got), got)
	}
	if got[0] != "/uploads/1759322845123456789.jpg" {
		t.Fatalf("unexpected first match %q", got[0])
	}
}
