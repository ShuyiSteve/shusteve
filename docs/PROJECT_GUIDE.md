# shuSteve 项目完全详解

> 这份文档是给你自己看的学习 + 维护手册。
> 目标：读完它，你能说清楚"我的网站是怎么跑起来的"，并且能自己改、自己修、自己部署。
>
> 生成时间：2026-10-02 ｜ 对应代码版本：`a3c7606`（main 分支）

---

## 目录

1. [30 秒速览](#1-30-秒速览)
2. [项目是干什么的](#2-项目是干什么的)
3. [整体架构](#3-整体架构)
4. [目录结构详解](#4-目录结构详解)
5. [后端详解](#5-后端详解)
6. [前端详解](#6-前端详解)
7. [数据库与数据模型](#7-数据库与数据模型)
8. [API 接口全清单](#8-api-接口全清单)
9. [一次请求的完整旅程](#9-一次请求的完整旅程)
10. [认证与安全机制](#10-认证与安全机制)
11. [Docker 与部署](#11-docker-与部署)
12. [基础知识词典](#12-基础知识词典)
13. [日常操作手册](#13-日常操作手册)
14. [⚠️ 风险清单与修复建议](#14-️-风险清单与修复建议)
15. [学习路线建议](#15-学习路线建议)

---

## 1. 30 秒速览

| 问题         | 答案                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| 这是什么？   | 你的个人网站：Portfolio + 博客 + 相册 + Vlog 聚合                             |
| 在哪里？     | `/Users/stevewang/Desktop/shuSteve`                                           |
| 代码托管     | https://github.com/ShuyiSteve/shusteve （**公开仓库**）                       |
| 前端         | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion                   |
| 后端         | Go 1.24 + Gin（Web 框架）+ GORM（ORM）                                        |
| 数据库       | MySQL 8.4                                                                     |
| 登录方式     | bcrypt 密码哈希 + JWT 放在 HttpOnly Cookie 里                                 |
| 部署方式     | Docker Compose + Nginx（本机开发和线上都用）                                  |
| 现在能干什么 | 发博客（Markdown）、传照片、登记 YouTube 视频，全在 `/admin` 后台点点鼠标完成 |
| 总代码量     | 前端约 2500 行，后端约 1200 行（不含依赖库）                                  |

**一句话总结**：这是一个"自己写的 WordPress"——一个前端展示 + 后台管理的内容管理系统（CMS），只不过内容类型固定为博客/照片/Vlog 三种。

---

## 2. 项目是干什么的

### 2.1 对访客（公开页面）

| 页面     | 路径          | 内容                                         |
| -------- | ------------- | -------------------------------------------- |
| 首页     | `/`           | 自我介绍、头像、技术栈                       |
| 博客列表 | `/blog`       | 所有已发布的文章卡片，带分类、封面、阅读时长 |
| 博客详情 | `/blog/:slug` | Markdown 渲染的完整文章                      |
| 相册     | `/photos`     | 瀑布流布局，点击可全屏看大图（Lightbox）     |
| Vlog     | `/vlog`       | YouTube 视频卡片，点击跳转到 YouTube         |
| 关于     | `/about`      | 教育背景、兴趣、技术栈、联系方式             |
| 404      | 其它任意路径  | 找不到页面时的提示页                         |

### 2.2 对你自己（后台，必须登录）

| 页面       | 路径                                        | 能做什么                                      |
| ---------- | ------------------------------------------- | --------------------------------------------- |
| 登录       | `/admin/login`                              | 邮箱 + 密码登录                               |
| 仪表盘     | `/admin`                                    | 看文章/照片/视频数量统计                      |
| 文章管理   | `/admin/posts`                              | 列表、新建、编辑、删除                        |
| 文章编辑器 | `/admin/posts/new`、`/admin/posts/:id/edit` | 写 Markdown，实时预览，可存草稿               |
| 照片管理   | `/admin/photos`                             | 上传图片 + 填写标题/地点/拍摄日期，可替换图片 |
| Vlog 管理  | `/admin/vlogs`                              | 录入 YouTube 链接，自动抓取封面               |

**关键设计**：你**永远不需要手动碰 MySQL**。所有内容操作都有图形界面。

---

## 3. 整体架构

### 3.1 架构图

```
                        互联网 / 你的浏览器
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Nginx（反向代理）   │
                    │  · 静态文件：React 页面│
                    │  · /api/*  → 后端      │
                    │  · /uploads/* → 后端   │
                    │  · HTTPS 加密         │
                    └──────────┬───────────┘
                               │
                     ┌─────────┴──────────┐
                     │                    │
              /api/* │                    │ /uploads/*
                     ▼                    ▼
            ┌──────────────────────────────────┐
            │   Go 后端（Gin 框架）               │
            │  · 路由 + 中间件（CORS / JWT 鉴权）   │
            │  · 控制器（业务逻辑）                 │
            │  · GORM（操作数据库的库）             │
            │  · Storage（文件存储抽象）            │
            └───────────────┬──────────────────┘
                            │ SQL
                            ▼
                    ┌───────────────┐
                    │  MySQL 8.4    │
                    │  users        │
                    │  posts        │
                    │  photos       │
                    │  vlogs        │
                    └───────────────┘
```

### 3.2 两条数据流

**访客读内容（公开，只读）：**

```
浏览器 → React 页面 → fetch("/api/posts") → Nginx → Go → GORM → MySQL
                                          ← JSON ←
```

**你写内容（后台，需要登录）：**

```
浏览器 → 后台表单 → POST/PUT/DELETE → Nginx → Go 中间件校验 JWT
       → 控制器 → GORM → MySQL
```

### 3.3 为什么要有 Nginx 这一层？

初学者最容易困惑的点。前端和后端其实是两个独立的程序（两个端口），浏览器不能同时访问两个端口还不报跨域错误。Nginx 做的事就是**把它们拼成"一个网站"**：

- `/api/xxx` → 转发给后端 8080 端口
- `/uploads/xxx` → 转发给后端
- 其它路径 → 直接返回 React 打包好的静态文件

对浏览器来说，所有请求都是访问同一个域名，所以就没有跨域（CORS）问题了。这个技术叫**反向代理**。

---

## 4. 目录结构详解

```
shuSteve/
├── README.md                      项目说明（你已有的，偏"使用手册"）
├── docs/PROJECT_GUIDE.md          本文档（偏"原理讲解"）
├── .env / .env.example            根环境变量（Docker Compose 用）
├── .gitignore                     告诉 Git 哪些文件不要提交
├── docker-compose.yml             本地完整栈（含前端容器）
├── docker-compose.prod.yml        线上服务（只有后端 + 数据库）
│
├── certs/                         ⚠️ TLS 证书（origin.key 是私钥，见第 14 节）
│   ├── origin.crt                 Cloudflare 源站证书（公钥）
│   └── origin.key                 ⚠️ 私钥，绝不该进 Git
│
├── deploy/
│   ├── nginx.conf                 线上服务器上 Nginx 的配置
│   └── README.md                  部署资产说明
│
├── backend/                       ★ Go 后端
│   ├── Dockerfile                 两阶段构建：编译 → 塞进极小的运行镜像
│   ├── go.mod / go.sum            依赖清单（类似 package.json）
│   ├── .env / .env.example        后端环境变量
│   ├── cmd/api/main.go            程序入口（main 函数）
│   ├── config/config.go           读取环境变量 → Config 结构体
│   ├── database/
│   │   ├── database.go            连 MySQL、连接池、自动建表
│   │   └── seed.go                首次启动时创建管理员 + 示例内容
│   ├── models/models.go           4 张表的数据结构定义
│   ├── controllers/               HTTP 处理函数（业务逻辑）
│   │   ├── app.go                 共享依赖（DB / Storage / Config）
│   │   ├── health.go              健康检查
│   │   ├── auth.go                登录 / 登出 / 当前用户
│   │   ├── posts.go               博客增删改查
│   │   ├── photos.go              照片上传 / 元数据 / 删除
│   │   ├── vlogs.go               Vlog 增删改查
│   │   ├── stats.go               后台统计数字
│   │   └── slug.go                URL 短标识生成（中文标题也能处理）
│   ├── middleware/auth.go         CORS + JWT 鉴权中间件
│   ├── routes/routes.go           所有路由的统一注册处
│   ├── storage/storage.go         文件存储接口 + 本地实现
│   └── uploads/                   本地存储的上传文件（.gitkeep 占位）
│
└── frontend/                      ★ React 前端
    ├── Dockerfile                 构建 React → 塞进 Nginx 镜像
    ├── nginx.conf                 容器内 Nginx 配置（含 443 证书）
    ├── package.json               依赖 + 脚本
    ├── vite.config.ts             Vite 配置（含开发代理）
    ├── tailwind.config.js         设计系统：颜色/字体/暗色模式
    ├── tsconfig.json              TypeScript 编译器配置
    ├── index.html                 唯一的 HTML 外壳 + favicon 切换脚本
    ├── public/images/             头像、图标、OG 分享图
    └── src/
        ├── main.tsx              前端入口：挂载 React + 套三层 Provider
        ├── App.tsx               路由表：哪个 URL 显示哪个页面
        ├── index.css             Tailwind 指令 + 自定义组件类
        ├── pages/                公开页面（Home/Blog/BlogPost/Photos/Vlog/About/404）
        ├── admin/                后台页面（Login/Dashboard/Posts/PostEditor/Photos/Vlogs）
        ├── components/           可复用 UI（导航栏、页脚、卡片、灯箱…）
        ├── api/                  与后端通信的函数（client + 各资源）
        ├── hooks/                自定义 React Hook（认证/主题/取数/SEO/阅读时长）
        ├── config/               站点级常量与社交链接
        └── types/                前后端共享的数据类型定义（TS interface）
```

---

## 5. 后端详解

### 5.1 启动流程（`cmd/api/main.go`）

程序启动时按顺序做这 8 件事，任何一步失败就 `log.Fatalf` 直接退出：

1. **读取配置** `config.Load()` —— 从环境变量 / `.env` 读取所有设置
2. **设置 Gin 模式** —— `release` 或 `debug`
3. **连接数据库** `database.Connect()` —— 最多重试 20 次，每次间隔 2 秒
4. **自动建表** `database.Migrate()` —— GORM 的 AutoMigrate 会根据结构体建表
5. **创建管理员** `database.SeedAdmin()` —— 只在 users 表为空时执行一次
6. **灌入示例数据** `database.SeedSampleData()` —— 只在 posts 表为空且 `SEED_DATA=true` 时执行
7. **初始化存储** `storage.NewLocalStorage()` —— 确保 uploads 目录存在
8. **启动 HTTP 服务器** —— 监听 `:8080`

> 💡 **为什么数据库连接要重试？**
> Docker 里 MySQL 和后端是同时启动的，MySQL 初始化要几十秒。如果后端一上来就连接失败然后退出，容器会不停重启。重试循环解决了这个"启动顺序"问题。

### 5.2 配置（`config/config.go`）

用 `getEnv(key, fallback)` 这种模式：环境变量有值就用，没有就用默认值。这是 Go 里最常见的配置写法，不需要任何框架。

关键配置项：

| 环境变量                              | 默认值                  | 含义                             |
| ------------------------------------- | ----------------------- | -------------------------------- |
| `PORT`                                | `8080`                  | 后端监听端口                     |
| `GIN_MODE`                            | `debug`                 | `release` 时关闭调试输出         |
| `DB_HOST` / `DB_PORT`                 | `127.0.0.1` / `3306`    | 数据库地址                       |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `shusteve` 等           | 数据库账号                       |
| `JWT_SECRET`                          | 不安全默认值            | **签发登录令牌的密钥，必须保密** |
| `TOKEN_TTL_HOURS`                     | `72`                    | 登录有效期（小时）               |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`      | 默认值                  | 首次启动创建的管理员             |
| `COOKIE_SECURE`                       | `false`                 | 生产 HTTPS 必须设 `true`         |
| `ALLOWED_ORIGIN`                      | `http://localhost:5173` | 允许跨域的前端地址               |
| `UPLOAD_DIR`                          | `./uploads`             | 上传文件存放目录                 |
| `MAX_UPLOAD_MB`                       | `10`                    | 单张图片大小上限                 |
| `SEED_DATA`                           | `true`                  | 是否灌示例内容                   |

### 5.3 数据库连接（`database/database.go`）

**DSN（数据源名称）**就是把连接信息拼成一行字符串：

```go
shusteve:密码@tcp(mysql:3306)/shusteve?charset=utf8mb4&parseTime=True&loc=Local
```

- `charset=utf8mb4` —— 支持 emoji 和中文
- `parseTime=True` —— 让 MySQL 的 datetime 自动变成 Go 的 `time.Time`
- `loc=Local` —— 时区按本地算

**连接池**（性能关键）：

```go
sqlDB.SetMaxIdleConns(10)      // 最多保留 10 个空闲连接
sqlDB.SetMaxOpenConns(50)      // 最多同时 50 个连接
sqlDB.SetConnMaxLifetime(time.Hour)  // 连接最多活 1 小时就换新
```

没有连接池的话，每个请求都新建 TCP 连接，数据库会被拖死。

### 5.4 路由注册（`routes/routes.go`）

所有 URL 集中在这里，分三组：

```go
/api/health          公开：健康检查
/api/posts           公开：文章列表
/api/posts/:slug     公开：单篇文章
/api/photos          公开：照片列表
/api/vlogs           公开：视频列表

/api/auth/login      公开：登录
/api/auth/logout     公开：登出
/api/auth/me         需登录：当前用户

/api/admin/*         全部需登录：增删改查 + 统计
```

`middleware.AuthRequired(config)` 挂在 admin 组上，意味着这一组下面所有路由自动受保护——这是 Gin 的**路由组（Group）**机制，比每个路由单独加鉴权更不容易出错。

### 5.5 中间件（`middleware/auth.go`）

中间件 = "请求到达业务代码之前先过的一道关卡"。

**CORS 中间件**：浏览器默认禁止 A 网站用 JS 请求 B 网站的接口（同源策略）。这个中间件告诉浏览器："我允许来自 `ALLOWED_ORIGIN` 的请求，并且允许带 Cookie。"

**JWT 鉴权中间件**的完整逻辑：

```
1. 先从 Cookie 里找 shusteve_token
2. 找不到？再看 Authorization: Bearer xxx 请求头
3. 都没有 → 返回 401 Unauthorized
4. 有 → 用 JWT_SECRET 验签，检查有没有过期
5. 验签失败/过期 → 401
6. 成功 → 从 token 里取出用户 ID，塞进 context，放行
```

注意它**检查了签名算法**（必须是 HMAC），这是一个重要的安全细节——防止"算法混淆攻击"。

### 5.6 存储抽象（`storage/storage.go`）

```go
type Storage interface {
    Save(file, header) (url string, err error)
    Delete(url string) error
}
```

目前只有一个实现 `LocalStorage`：把文件存到磁盘，文件名用纳秒时间戳（`1727845123456789012.jpg`）避免重名，然后返回 `/uploads/xxx.jpg`。

**为什么要写成接口？** 因为以后照片多了，本地磁盘不够用，你会想换成 Cloudflare R2 或 AWS S3。到时候只要写一个新实现，在 `main.go` 里换一行，控制器代码完全不用动。这叫**依赖倒置**，是工程上很值钱的设计习惯。

### 5.7 控制器逐个说明

| 文件        | 职责               | 值得注意的点                                                            |
| ----------- | ------------------ | ----------------------------------------------------------------------- |
| `auth.go`   | 登录/登出/当前用户 | 登录失败时不区分"邮箱不存在"和"密码错误"，防止攻击者枚举邮箱            |
| `posts.go`  | 文章 CRUD          | 公开接口只返回 `published = true`；后台接口返回草稿                     |
| `photos.go` | 图片上传           | `http.DetectContentType` 嗅探真实文件类型，防止把 .exe 改名成 .jpg 上传 |
| `vlogs.go`  | 视频 CRUD          | 校验 URL 必须是 http/https                                              |
| `slug.go`   | 生成 URL 短标识    | 只保留小写字母数字，其它转成 `-`；冲突时自动加 `-2`、`-3`               |
| `stats.go`  | 后台统计           | 3 个 `COUNT(*)` 查询                                                    |

**照片上传的完整安全检查**（`validateImage`）：

1. 文件大小是否超过 `MAX_UPLOAD_MB`
2. 读前 512 字节，用 `http.DetectContentType` 判断**真实内容类型**
3. 只允许 `image/jpeg`、`image/png`、`image/webp`、`image/gif`
4. 判断完把文件指针 `Seek(0)` 归零，否则后面复制文件会复制到空内容

---

## 6. 前端详解

### 6.1 入口与"Provider 套娃"（`main.tsx`）

```tsx
<BrowserRouter>       ← 负责 URL 路由
  <ThemeProvider>     ← 负责深色/浅色模式
    <AuthProvider>    ← 负责"当前登录的是谁"
      <App />
```

**Context（上下文）** 是 React 的全局状态方案。这三层 Provider 提供的值，任何子组件都能用 `useTheme()` / `useAuth()` 直接取，不需要一层层传递 props（那叫 "prop drilling"，很烦）。

### 6.2 路由表（`App.tsx`）

两种布局：

- `<Layout>`：公开页面，带导航栏和页脚
- `<AdminLayout>`：后台页面，带侧边栏，未登录会自动跳转到 `/admin/login`

```tsx
<Route path="/blog/:slug" element={<BlogPost />} />
```

`:slug` 是动态参数，`/blog/building-my-personal-website` 里 `slug` 的值就是 `building-my-personal-website`，组件里用 `useParams()` 取。

### 6.3 API 层（`src/api/`）

**`client.ts` 是唯一直接调用 `fetch` 的地方**，其它文件都包一层：

```ts
export async function apiFetch<T>(path, options) {
  // 1. 自动设置 Content-Type: application/json（上传文件时除外）
  // 2. credentials: 'include' ← 关键！让请求带上 Cookie
  // 3. 204 无内容直接返回 undefined
  // 4. 解析 JSON，失败也不崩
  // 5. 状态码非 2xx 统一抛 ApiError
}
```

这层抽象的好处：错误处理、Cookie 携带、JSON 解析只写一次；以后要加请求重试、加 token 刷新，只改一个文件。

`posts.ts` / `photos.ts` / `vlogs.ts` 是公开接口，`admin.ts` 是后台接口，`auth.ts` 是登录相关。

### 6.4 数据获取（`hooks/useFetch.ts`）

一个 30 行的小 Hook，却解决了标准问题：

```ts
const { data, loading, error, reload } = useFetch<Post[]>("/api/posts");
```

它返回四件东西，覆盖了"加载中 / 出错 / 成功 / 手动刷新"四种状态。

> 📌 注意：这里用 `useEffect(..., [path])` 依赖 path，所以 path 变了会自动重新请求。但 **React 18 的 StrictMode 在开发环境会故意执行两次 effect**，所以你会看到开发时接口被调用两次——这是正常的，生产环境不会。

### 6.5 深色模式（`hooks/useTheme.tsx` + `index.html`）

**给初学者的重点：深色模式不是 React 实现的，是 Tailwind 的 `dark:` 前缀 + html 上的 `dark` class。**

```html
<html class="dark">
  ← 有这个 class，所有 dark: 样式生效
</html>
```

优先级：`localStorage` 里用户的选择 → 系统的 `prefers-color-scheme`。

`index.html` 里那段内联 `<script>` 是关键优化：它在 React 加载**之前**就同步执行，读取主题并设置 class 和 favicon。否则页面会先白闪一下再变暗（叫 FOUC，Flash of Unstyled Content）。里面还用了 `MutationObserver` 监听 class 变化，这样你点切换按钮时，浏览器标签页图标也会跟着换。

### 6.6 样式系统（Tailwind CSS）

Tailwind 的思路是"不写 CSS 文件，直接在 HTML 里用工具类"：

```tsx
className =
  "rounded-2xl border border-neutral-200 bg-white p-6 dark:bg-neutral-900";
```

`tailwind.config.js` 里定义了这个项目的设计令牌：

| 令牌            | 值                 | 用途                   |
| --------------- | ------------------ | ---------------------- |
| `paper.light`   | `#FFF5F0`          | 浅色模式背景（暖白）   |
| `paper.dark`    | `#0A0E1E`          | 深色模式背景（深蓝黑） |
| `max-w-content` | `1120px`           | 内容区最大宽度         |
| `font-sans`     | Inter              | 正文字体               |
| `font-serif`    | New York / Georgia | 标题字体（杂志感）     |

`index.css` 里用 `@layer components` 抽出了几个复用类：`.container-page`（居中+最大宽度）、`.hairline`（浅淡分隔线）、`.card-hover`（悬停上浮）、`.masonry`（CSS 多栏瀑布流）。

**导航栏配色**：浅色模式 `#FF8F70`（橙粉），深色模式 `#2E6BFF`（蓝），这正好和你的图标配色体系一致。

### 6.7 动画（Framer Motion）

首页的入场动画：

```tsx
<motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
```

`initial` 是初始状态（透明+下移 16px），`animate` 是目标状态。配合 `delay` 做出元素依次出现的层次感。

### 6.8 后台管理

- `Login.tsx`：表单 → 调 `/api/auth/login` → 成功后 `refresh()` 更新全局登录态 → 跳转 `/admin`
- `AdminLayout.tsx`：`useAuth()` 拿到 `user`，`loading` 时显示 Spinner，`!user` 时 `<Navigate to="/admin/login" />`
- `PostEditor.tsx`：受控表单 + 实时 Markdown 预览 + 编辑/新建复用同一个组件（靠 `useParams` 有没有 `id` 判断）
- `Photos.tsx`：`FormData` 上传，用 `URL.createObjectURL` 做本地预览，组件卸载时 `revokeObjectURL` 释放内存
- `Vlogs.tsx`：只需要填 YouTube 链接，前端有正则从链接里提取视频 ID 拼封面图

---

## 7. 数据库与数据模型

### 7.1 四张表

**`users`（管理员账号，只有 1 条）**
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uint | 主键 |
| email | varchar(255) | 唯一索引 |
| password_hash | varchar(255) | bcrypt 哈希，`json:"-"` 表示永远不会返回给前端 |
| created_at / updated_at | datetime | GORM 自动维护 |

**`posts`（博客文章）**
| 字段 | 说明 |
|---|---|
| title | 标题 |
| slug | URL 短标识，唯一索引 |
| description | 摘要 |
| content | 正文（Markdown，longtext） |
| cover_image_url | 封面图 |
| category | 分类（有索引，方便筛选） |
| published | 是否发布（有索引，公开列表按它过滤） |

**`photos`（照片）**
| 字段 | 说明 |
|---|---|
| image_url | 图片地址（本地 `/uploads/x.jpg` 或外链） |
| title / description | 说明文字 |
| location | 拍摄地点 |
| taken_at | 拍摄日期（**指针类型 `*time.Time`，可以为空**） |

**`vlogs`（视频）**
| 字段 | 说明 |
|---|---|
| youtube_url | YouTube 链接 |
| thumbnail_url | 封面图（为空时前端自动从链接生成） |
| published_at | 发布日期（可空） |

### 7.2 什么是 ORM？

ORM = Object-Relational Mapping（对象关系映射）。没有它你要写：

```sql
SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC;
```

有了 GORM 你写：

```go
a.DB.Where("published = ?", true).Order("created_at DESC").Find(&posts)
```

它把 Go 结构体 ↔ 数据库表自动对应起来。**`?` 是参数占位符，能防止 SQL 注入**——永远不要用字符串拼接 SQL。

### 7.3 什么是迁移（Migration）？

`AutoMigrate` 会检查结构体定义，自动创建缺失的表/列。好处是方便，坏处是**它不会删除或修改已有列**——所以改字段类型、重命名要小心。生产环境更严谨的做法是用版本化的 migration 工具（如 golang-migrate）。

---

## 8. API 接口全清单

### 公开接口

| 方法 | 路径               | 说明                       | 返回             |
| ---- | ------------------ | -------------------------- | ---------------- |
| GET  | `/api/health`      | 健康检查                   | `{status, time}` |
| GET  | `/api/posts`       | 已发布文章列表             | `Post[]`         |
| GET  | `/api/posts/:slug` | 单篇文章                   | `Post` / 404     |
| GET  | `/api/photos`      | 照片列表（按拍摄日期倒序） | `Photo[]`        |
| GET  | `/api/vlogs`       | 视频列表                   | `Vlog[]`         |

### 认证接口

| 方法 | 路径               | 说明                    |
| ---- | ------------------ | ----------------------- |
| POST | `/api/auth/login`  | 登录，成功后 Set-Cookie |
| POST | `/api/auth/logout` | 登出，Cookie 置空       |
| GET  | `/api/auth/me`     | 当前登录用户（需登录）  |

### 后台接口（全部需登录）

| 方法       | 路径                    | 说明                     |
| ---------- | ----------------------- | ------------------------ |
| GET        | `/api/admin/stats`      | 统计数量                 |
| GET/POST   | `/api/admin/posts`      | 列表 / 新建              |
| PUT/DELETE | `/api/admin/posts/:id`  | 更新 / 删除              |
| GET/POST   | `/api/admin/photos`     | 列表 / 上传（multipart） |
| PUT/DELETE | `/api/admin/photos/:id` | 更新（可换图）/ 删除     |
| GET/POST   | `/api/admin/vlogs`      | 列表 / 新建              |
| PUT/DELETE | `/api/admin/vlogs/:id`  | 更新 / 删除              |

### HTTP 状态码备忘

| 码  | 含义         | 在本项目中的场景            |
| --- | ------------ | --------------------------- |
| 200 | OK           | 查询/更新成功               |
| 201 | Created      | 新建成功                    |
| 204 | No Content   | 删除/登出成功（没有响应体） |
| 400 | Bad Request  | 表单字段缺失、文件类型不对  |
| 401 | Unauthorized | 没登录 / token 过期         |
| 404 | Not Found    | 文章不存在                  |
| 500 | Server Error | 数据库出错                  |

---

## 9. 一次请求的完整旅程

### 场景 A：访客打开博客列表

```
1. 浏览器访问 https://shusteve.com/blog
2. Nginx 找不到 /blog 这个文件 → try_files 回退到 /index.html（SPA 路由技巧）
3. 浏览器下载 React 打包后的 JS/CSS
4. React Router 匹配到 /blog → 渲染 <Blog /> 组件
5. Blog 组件调用 useFetch('/api/posts')
6. 浏览器发 GET https://shusteve.com/api/posts
7. Nginx 匹配 ^~ /api/ → 转发到 127.0.0.1:8080
8. Go 收到请求 → CORS 中间件 → 路由匹配 → ListPosts 控制器
9. GORM 生成 SQL：SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC
10. MySQL 返回数据 → Go 转成 JSON → 返回 200
11. React 拿到数组 → map 渲染成文章卡片
```

### 场景 B：你登录后台

```
1. 访问 /admin/login，输入邮箱密码，点提交
2. POST /api/auth/login  {email, password}
3. Go 查询 users 表，用 bcrypt.CompareHashAndPassword 比对密码
4. 成功 → 生成 JWT（含 sub=用户ID, exp=3天后）→ 用 JWT_SECRET 签名
5. 通过 Set-Cookie 下发 shusteve_token（HttpOnly, SameSite=Lax）
6. 前端调 refresh() → GET /api/auth/me（浏览器自动带上 Cookie）
7. 中间件验签成功 → 返回用户信息 → 存进 AuthContext
8. <AdminLayout> 检测到 user 存在 → 显示后台界面

★ 之后所有 /api/admin/* 请求，中间件都会重复第 7 步的验签。
★ HttpOnly 意味着 JS 读不到这个 Cookie，所以 XSS 攻击也偷不走 token。
```

---

## 10. 认证与安全机制

### 10.1 密码为什么要哈希？

数据库里存的**不是**你的密码，而是 bcrypt 哈希值。哈希是单向的，无法反推。

- 为什么不用 MD5/SHA256？因为太快了，攻击者一秒能试几十亿次。bcrypt 故意设计得很慢（可调 cost），暴力破解成本极高。
- 为什么同样的密码每次哈希结果不同？因为 bcrypt 会自动加随机"盐"（salt），防止彩虹表攻击。

### 10.2 JWT 是什么？

JSON Web Token，格式是 `头部.载荷.签名` 三段 Base64：

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImV4cCI6MTc5MTIzNDU2N30.签名字符串
```

- **载荷**里存了 `sub`（用户 ID）、`exp`（过期时间）等，但**载荷是明文可读的**（只是 Base64 编码，不是加密）——所以绝不能往里放密码。
- **签名**用 `JWT_SECRET` 生成。服务器验签时重新算一遍，对不上就拒绝。所以别人改不了 token 内容，除非他知道你的密钥。
- **这就是为什么 JWT_SECRET 泄露等于网站被接管**：攻击者可以自己签一个"我是管理员"的 token。

### 10.3 Cookie 的防护参数

```go
c.SetCookie("shusteve_token", token, 秒数, "/", "", secure, true)
//                                                          ↑     ↑
//                                                     Secure  HttpOnly
```

| 参数           | 作用                            |
| -------------- | ------------------------------- |
| `HttpOnly`     | JS 无法读取，防 XSS 偷 token    |
| `Secure`       | 只在 HTTPS 下发送（生产必须开） |
| `SameSite=Lax` | 防 CSRF：跨站请求不发送 Cookie  |

### 10.4 项目已做的安全措施（做得不错的地方）

✅ 密码 bcrypt 哈希
✅ JWT + HttpOnly Cookie（不是存 localStorage，好）
✅ 中间件校验签名算法，防算法混淆
✅ 登录失败信息统一，防邮箱枚举
✅ 上传文件嗅探真实 MIME 类型
✅ 上传文件大小限制
✅ slug 白名单式生成（只保留字母数字）
✅ GORM 参数化查询，无 SQL 注入
✅ CORS 指定具体来源，不用 `*`
✅ 生产环境后端只绑定 `127.0.0.1`，不直接暴露
✅ 密钥走环境变量，`.env` 已被 gitignore

---

## 11. Docker 与部署

### 11.1 Docker 基础概念

| 概念               | 类比         | 说明                                 |
| ------------------ | ------------ | ------------------------------------ |
| **镜像 Image**     | 光盘         | 只读模板，含操作系统+程序            |
| **容器 Container** | 运行中的程序 | 镜像的实例，可启停                   |
| **Dockerfile**     | 刻录说明     | 怎么造这个镜像                       |
| **Volume**         | 外接硬盘     | 数据存在容器外，容器删了数据还在     |
| **Compose**        | 一键编排     | 用 yaml 描述"要跑哪几个容器、怎么连" |

### 11.2 两阶段构建（`backend/Dockerfile`）

```dockerfile
FROM golang:1.24-alpine AS build   ← 阶段1：~300MB，有编译器
RUN go build -o /shusteve-api ./cmd/api

FROM alpine:3.20                   ← 阶段2：~10MB，只有运行时
COPY --from=build /shusteve-api .
```

好处：最终镜像里**没有 Go 编译器、没有源码**，又小又安全。Go 编译成静态二进制（`CGO_ENABLED=0`），不依赖系统库。

### 11.3 本地开发栈（`docker-compose.yml`）

三个服务：

| 服务       | 端口映射                | 说明                            |
| ---------- | ----------------------- | ------------------------------- |
| `mysql`    | `127.0.0.1:3307 → 3306` | 用 3307 避免和你本机 MySQL 冲突 |
| `backend`  | `127.0.0.1:8080 → 8080` | 依赖 mysql 健康后才启动         |
| `frontend` | `80 → 80`，`443 → 443`  | Nginx 提供页面 + 反代           |

两个 Volume：`mysql_data`（数据库）、`uploads_data`（照片）。

```bash
docker compose up -d --build     # 启动
docker compose logs -f backend   # 看日志
docker compose down              # 停止（数据保留）
docker compose down -v           # 停止并删数据（慎用！）
```

> ⚠️ 注意：本地 compose 里 `FRONTEND_PORT` 默认是 3000，但 ports 映射写的是 `${FRONTEND_PORT:-80}:80`。如果你在 `.env` 里设了 `FRONTEND_PORT=3000`，就访问 `http://localhost:3000`；没设就是 80 端口。README 里写的是 3000，保持一致即可。

### 11.4 生产架构（和本地不一样！）

线上**不用**前端容器，而是：

```
互联网 → 宿主机 Nginx（80/443）
           ├── /var/www/shusteve/  ← npm run build 产物复制到这里
           └── /api, /uploads → 127.0.0.1:8080 → Docker 里的 Go 后端
                                                      ↓
                                              Docker 里的 MySQL
```

为什么？因为让宿主机 Nginx 直接管 TLS 证书（certbot 自动续期）比在容器里搞证书简单得多。

**部署步骤概要**（详细版见 README）：

1. 买域名，解析 A 记录到服务器 IP
2. 服务器装 Docker，clone 仓库到 `/opt/shusteve`
3. 配好 `.env`（强密码 + 强 JWT_SECRET）
4. `docker compose -f docker-compose.prod.yml up -d --build`
5. 前端 `npm ci && npm run build`，把 `dist/*` 复制到 `/var/www/shusteve`
6. 装 Nginx，把 `deploy/nginx.conf` 放到 `sites-available`，改 `server_name` 为你的域名
7. `certbot --nginx -d shusteve.com -d www.shusteve.com` 自动配 HTTPS

### 11.5 备份（必须做）

```bash
# 数据库
docker compose exec -T mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" shusteve' > backup-$(date +%F).sql

# 照片
tar -czf uploads-backup-$(date +%F).tar.gz -C backend uploads
```

配个 cron 每天凌晨 3 点跑，并定期把备份拉到本地/云盘。**只存在服务器上的备份等于没有备份。**

---

## 12. 基础知识词典

按你会在项目里遇到的顺序排列：

| 术语                              | 一句话解释                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------- |
| **前端 / 后端**                   | 前端在浏览器里跑（界面），后端在服务器上跑（数据和逻辑）                     |
| **SPA**                           | 单页应用。只有 1 个 HTML，切换页面靠 JS 换内容，不刷新                       |
| **React**                         | 用组件搭界面的 JS 库。组件 = 返回 HTML 的函数                                |
| **JSX / TSX**                     | 在 JS/TS 里直接写 HTML 标签的语法                                            |
| **Props**                         | 父组件传给子组件的数据（只读）                                               |
| **State**                         | 组件内部会变化的数据，变了会自动重新渲染                                     |
| **Hook**                          | 以 `use` 开头的函数，让函数组件拥有状态/副作用能力                           |
| **Context**                       | React 的全局状态共享方案                                                     |
| **TypeScript**                    | 给 JS 加类型检查，编译期就能发现错误                                         |
| **Vite**                          | 前端构建工具。开发时秒级热更新，打包时压缩成静态文件                         |
| **Tailwind**                      | 原子化 CSS 框架，用类名堆样式                                                |
| **Go / Golang**                   | Google 的编程语言，语法简单、并发强、编译成单个二进制                        |
| **Gin**                           | Go 的 Web 框架，负责路由和 HTTP 处理                                         |
| **GORM**                          | Go 的 ORM，用 Go 代码操作数据库                                              |
| **API**                           | 程序之间约定的接口。这里指后端暴露的 URL                                     |
| **REST**                          | 一种 API 风格：用 URL 表示资源，用 HTTP 方法表示动作                         |
| **JSON**                          | 数据交换格式，`{"key": "value"}`                                             |
| **HTTP 方法**                     | GET 读 / POST 建 / PUT 改 / DELETE 删                                        |
| **状态码**                        | 200 成功、201 已创建、401 未登录、404 找不到、500 服务器错误                 |
| **MySQL**                         | 关系型数据库，数据存在表里，表之间可以有关系                                 |
| **SQL**                           | 操作关系数据库的语言                                                         |
| **主键 / 索引**                   | 主键唯一标识一行；索引让查询更快（像书的目录）                               |
| **ORM**                           | 对象关系映射，用编程语言的对象操作数据库表                                   |
| **迁移 Migration**                | 数据库结构的版本管理                                                         |
| **环境变量**                      | 从操作系统传入程序的配置，用来避免把密码写进代码                             |
| **JWT**                           | 一种签名过的登录凭证，服务器不用存 session 就能验证身份                      |
| **Cookie**                        | 浏览器自动随请求发送的小段数据，常用来存登录态                               |
| **HttpOnly / Secure / SameSite**  | Cookie 的三个安全开关                                                        |
| **CORS**                          | 跨域资源共享。浏览器的同源策略限制跨站请求，CORS 是白名单                    |
| **反向代理**                      | 站在服务器前面转发请求的程序（这里是 Nginx）                                 |
| **Nginx**                         | 高性能 Web 服务器，兼做反向代理、静态文件服务、TLS 终结                      |
| **TLS / HTTPS**                   | 加密的 HTTP，防止内容被窃听篡改                                              |
| **Docker**                        | 把程序+依赖打包成容器的技术，解决"我电脑上能跑"                              |
| **Docker Compose**                | 用 yaml 一次编排多个容器                                                     |
| **Volume**                        | 容器外的持久化存储                                                           |
| **CDN**                           | 内容分发网络，把静态资源缓存到离用户近的节点                                 |
| **DNS**                           | 域名 → IP 的翻译系统                                                         |
| **A 记录 / CNAME**                | DNS 记录类型：A 指向 IP，CNAME 指向另一个域名                                |
| **Let's Encrypt / certbot**       | 免费 TLS 证书 + 自动申请续期工具                                             |
| **Cloudflare Origin Certificate** | Cloudflare 签发的源站证书（你现在用的，15 年有效期，但只对 Cloudflare 有效） |

---

## 13. 日常操作手册

### 发一篇博客

1. 访问 `/admin` 登录
2. 侧边栏 → Blog Posts → New Post
3. 填标题、分类、摘要、封面图 URL、正文（Markdown）
4. `slug` 留空会自动从标题生成
5. `Published` 不勾选 = 存草稿（前台看不到）
6. 点 Preview 可实时看渲染效果，保存

### 上传照片

1. `/admin/photos` → 选择文件 → 填标题/地点/拍摄日期 → 上传
2. 图片存在 Docker volume `uploads_data` 里（本地开发是 `backend/uploads/`）
3. 要替换图片：点编辑，重新选文件，旧文件会被自动删除

### 添加视频

1. `/admin/vlogs` → 粘贴 YouTube 链接（封面自动生成）→ 保存
2. 视频本身不占你服务器空间，一直在 YouTube

### 改导航栏/页脚社交链接

编辑 `frontend/.env`（或根 `.env` 的 `VITE_*` 变量），然后**重新构建**（`npm run build` 或 `docker compose up -d --build frontend`）。因为这些变量在构建时就被写死进 JS 了。

### 改配色

- 主题色令牌：`frontend/tailwind.config.js` 里的 `paper` 颜色
- 导航栏颜色：`frontend/src/components/Navbar.tsx` 里的 `bg-[#FF8F70] dark:bg-[#2E6BFF]`
- 图标：`frontend/public/images/` + `frontend/index.html`

### 本地跑起来

```bash
cd /Users/stevewang/Desktop/shuSteve
docker compose up -d --build
# 打开 http://localhost:3000
```

不用 Docker 的话：

```bash
# 终端 1
cd backend && go run ./cmd/api
# 终端 2
cd frontend && npm install && npm run dev   # → http://localhost:5173
```

### 部署更新

```bash
ssh root@你的服务器
cd /opt/shusteve
git pull
docker compose -f docker-compose.prod.yml up -d --build
cd frontend && npm ci && npm run build
cp -r dist/* /var/www/shusteve/
systemctl reload nginx
```

---

## 14. ⚠️ 风险清单与修复建议

### 🔴 P0：Cloudflare 源站私钥已泄露到公开仓库

**事实**：`certs/origin.key` 是一个真实的 Cloudflare Origin CA 私钥（1705 字节，`-----BEGIN PRIVATE KEY-----` 开头，有效期到 2041 年），它在提交 `cd45dda adding certs` 中被提交，而 GitHub 仓库 `ShuyiSteve/shusteve` **经匿名 API 验证是公开的**（HTTP 200）。

**危害**：Cloudflare Origin Certificate 只对"Cloudflare ↔ 你的源站"这一段有效，攻击者不能直接拿它冒充 shusteve.com 骗浏览器。但任何能到达你源站 IP 的人，都可以用这把私钥解密/中间人劫持 Cloudflare 到源站的流量，或者搭一个假源站。

**必须做的三件事**：

1. **立刻吊销并重新签发**：Cloudflare Dashboard → SSL/TLS → Origin Server → 删除现有证书 → Create Certificate → 重新签发（CN/域名保持一致）→ 替换服务器上的 `origin.crt` / `origin.key`。
2. **从 Git 历史里彻底删除**。改 `.gitignore` 只是让**未来**不再跟踪，历史里还在，任何人 clone 都能翻出来。需要重写历史：

```bash
# 1. 先把文件移出仓库并加入 .gitignore
echo "certs/" >> .gitignore          # 或者只忽略 certs/*.key
git rm --cached certs/origin.key certs/origin.crt

# 2. 用 git-filter-repo 重写全部历史（推荐，需先 brew install git-filter-repo）
git filter-repo --path certs/origin.key --path certs/origin.crt --invert-paths

# 3. 强制推送（会让所有人的本地副本失效，个人项目影响不大）
git remote add origin https://github.com/ShuyiSteve/shusteve.git   # filter-repo 会移除 remote
git push --force --all
git push --force --tags
```

3. **部署环境改为只从宿主机路径挂载证书**，不进仓库。生产上用 certbot 的 `/etc/letsencrypt/live/...`，本地开发根本不需要真实证书。

> 附：如果这仓库在你不知情时曾被 fork 过，重写历史也无法收回，所以**第 1 步（吊销重签）必须做**，第 2 步只是止血。

### 🟠 P1：示例密钥可能被误用为生产密钥

`backend/.env.example` 和 `.env.example` 里的 `JWT_SECRET` 是真实格式的字符串，且 `docker-compose.yml` 的默认值是 `change_me`。如果线上 `.env` 忘了改，任何人都能用公开的示例值伪造管理员 token。

**修复**：生产 `.env` 必须用 `openssl rand -base64 48` 生成全新的 JWT_SECRET，并确保 `JWT_SECRET` 与仓库里出现过的任何值都不同。既然 `c9d15af` 提交过 "change the JWT_SECRET"，建议直接再换一次。

### 🟠 P1：JWT 没有"撤销"能力

JWT 一旦签发，在 72 小时内始终有效，即使你改了密码。如果 token 泄露，只能等它过期。

**改进方向**：把 TTL 降到 24 小时；或在 users 表加一个 `token_version`，签发时写进 claims，改密码时自增，中间件比对版本。

### 🟡 P2：登录接口没有限流

`/api/auth/login` 可以被无限次尝试，存在暴力破解风险。

**修复**：加一个基于 IP 的限流中间件（如 `github.com/ulule/limiter`），比如每 IP 每分钟 5 次。

### 🟡 P2：上传目录没有磁盘配额

照片只删记录时删文件，但如果 volume 写满，后端会开始报错。

**修复**：监控磁盘；或按第 5.6 节的说明迁移到 Cloudflare R2（代码已预留接口）。

### 🟡 P2：前端 `dist/` 曾被提交？

`.gitignore` 里有 `frontend/dist/`，但目录实际存在于工作区。确认一下是否被跟踪：

```bash
git ls-files frontend/dist | head
```

如果输出为空就没事（只是本地构建产物）。

### ✅ 已完成得不错的地方

bcrypt、HttpOnly Cookie、算法校验、MIME 嗅探、CORS 白名单、生产只绑 127.0.0.1、密钥走环境变量、存储层抽象——这些在个人项目里已经超出平均水平了。

---

## 15. 学习路线建议

按依赖顺序，一个个吃透，不要跳：

1. **HTTP 基础** —— 请求/响应、方法、状态码、Header、Cookie。这是理解一切的前提。
2. **Go 基础语法** —— 变量、函数、结构体、接口、错误处理、`goroutine`。重点理解**接口**，它解释了 `Storage` 为什么要那样写。
3. **Gin + 路由** —— 中间件、路由组、`c.JSON`、`c.ShouldBindJSON`。看懂 `routes.go` 和任一控制器就够。
4. **GORM + SQL** —— 表、主键、索引、JOIN、`Where/Order/Find`。手动写几条 SQL 试试。
5. **React 基础** —— 组件、props、state、`useEffect`、列表渲染、条件渲染。然后看 `pages/Blog.tsx`。
6. **React 进阶** —— Context、自定义 Hook、`react-router`。看 `hooks/` 和 `App.tsx`。
7. **TypeScript** —— 泛型（`apiFetch<T>`）、联合类型、`interface`。看 `types/index.ts`。
8. **Tailwind** —— 直接看官方文档的类名速查，边改样式边学最快。
9. **认证体系** —— 密码哈希 → Cookie → JWT → CORS。这是本项目最"专业"的一块。
10. **Docker + Nginx + DNS + TLS** —— 部署链路。建议自己在云服务器上从零走一遍，会记住一辈子。

**推荐的动手练习**（由易到难）：

1. 给博客加一个"按分类筛选"的按钮
2. 给文章加一个 `tags` 字段（模型 → 迁移 → API → 前端）
3. 给后台加"草稿数量"统计
4. 把照片存储换成 Cloudflare R2（实现 `Storage` 接口）
5. 加一层 Redis 缓存，让 `/api/posts` 不再每次都查库

---

_本文档由 Codex 根据 `a3c7606` 版本源码逐文件阅读后生成。如代码有较大改动，请同步更新。_
