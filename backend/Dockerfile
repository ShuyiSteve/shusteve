# ---- Build stage ----
FROM golang:1.24-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o /shusteve-api ./cmd/api

# ---- Runtime stage ----
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=build /shusteve-api .
RUN mkdir -p /app/uploads
EXPOSE 8080
CMD ["./shusteve-api"]
