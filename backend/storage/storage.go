package storage

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Storage abstracts where uploaded files live so the backend can later be
// switched to Cloudflare R2, AWS S3 or another object store without touching
// the controllers.
type Storage interface {
	Save(file multipart.File, header *multipart.FileHeader) (url string, err error)
	Delete(url string) error
}

// LocalStorage stores files on the local filesystem under a directory and
// exposes them at the /uploads/* URL path.
type LocalStorage struct {
	dir string
}

func NewLocalStorage(dir string) (*LocalStorage, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create upload dir: %w", err)
	}
	return &LocalStorage{dir: dir}, nil
}

func (s *LocalStorage) Save(file multipart.File, header *multipart.FileHeader) (string, error) {
	ext := strings.ToLower(filepath.Ext(header.Filename))
	if ext == "" || len(ext) > 5 {
		ext = ".jpg"
	}
	name := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	dst, err := os.Create(filepath.Join(s.dir, name))
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}

	return "/uploads/" + name, nil
}

func (s *LocalStorage) Delete(url string) error {
	if url == "" || !strings.HasPrefix(url, "/uploads/") {
		return nil
	}
	name := filepath.Base(url)
	if name == "" || name == "." || name == string(filepath.Separator) {
		return nil
	}
	err := os.Remove(filepath.Join(s.dir, name))
	if os.IsNotExist(err) {
		return nil
	}
	return err
}
