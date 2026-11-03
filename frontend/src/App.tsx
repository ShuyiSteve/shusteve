import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/Dashboard'
import Login from './admin/Login'
import AdminImages from './admin/Images'
import AdminPhotos from './admin/Photos'
import AdminVlogs from './admin/Vlogs'
import Layout from './components/Layout'
import About from './pages/About'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Photos from './pages/Photos'
import Vlog from './pages/Vlog'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/vlog" element={<Vlog />} />
        <Route path="/about" element={<About />} />
        {/* The blog has been retired — send old links home instead of to a 404. */}
        <Route path="/blog/*" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="photos" element={<AdminPhotos />} />
        <Route path="images" element={<AdminImages />} />
        <Route path="vlogs" element={<AdminVlogs />} />
      </Route>
    </Routes>
  )
}
