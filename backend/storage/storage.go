package storage

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// File describes one stored object, regardless of where it physically lives.
type File struct {
	Name       string    `json:"name"`
	URL        string    `json:"url"`
	Size       int64     `json:"size"`
	ModifiedAt time.Time `json:"modifiedAt"`
}

// Storage abstracts where uploaded files live so the backend can later be
// switched to Cloudflare R2, AWS S3 or another object store without touching
// the controllers.
type Storage interface {
	Save(file multipart.File, header *multipart.FileHeader) (url string, err error)
	Delete(url string) error
	List() ([]File, error)
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

// List returns every stored file, newest first. Hidden files (".gitkeep" and
// friends) and subdirectories are skipped.
func (s *LocalStorage) List() ([]File, error) {
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return nil, fmt.Errorf("read upload dir: %w", err)
	}

	files := make([]File, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		files = append(files, File{
			Name:       entry.Name(),
			URL:        "/uploads/" + entry.Name(),
			Size:       info.Size(),
			ModifiedAt: info.ModTime(),
		})
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].ModifiedAt.After(files[j].ModifiedAt)
	})

	return files, nil
}
