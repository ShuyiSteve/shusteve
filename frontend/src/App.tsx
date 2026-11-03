import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Login from './admin/Login'
import AdminImages from './admin/Images'
import AdminPhotos from './admin/Photos'
import PostEditor from './admin/PostEditor'
import AdminPosts from './admin/Posts'
import Layout from './components/Layout'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Photos from './pages/Photos'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/about" element={<About />} />
        {/* The vlog has been retired — send old links home instead of to a 404. */}
        <Route path="/vlog/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id/edit" element={<PostEditor />} />
        <Route path="photos" element={<AdminPhotos />} />
        <Route path="images" element={<AdminImages />} />
      </Route>
    </Routes>
  )
}
