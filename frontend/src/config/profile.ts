// Single source of truth for the personal details shown on Home and About.
// Edit this file to update your info everywhere on the site.
import { OWNER_NAME } from './index'

export const PROFILE = {
  // `name` is the English name shown large; `realName` is the legal name.
  name: OWNER_NAME,
  realName: 'Shuyi Wang',
  role: 'Computer Science Student',
  school: {
    name: 'University College London',
    short: 'UCL',
    course: 'Computer Science',
    year: 'First Year',
  },
  location: 'London, UK',
  tagline: 'Building things with code, exploring technology, and documenting the journey.',
  bio: "I'm a first-year Computer Science student at UCL. I enjoy building things with code, learning how systems work under the hood, and documenting what I discover along the way.",
  portrait: '/images/profile.jpg',
}

export const STACK = [
  { group: 'Languages', items: ['C', 'C++', 'Java', 'Python', 'Golang', 'TypeScript'] },
  { group: 'Backend', items: ['Node.js', 'Gin', 'GORM'] },
  { group: 'Frontend', items: ['React', 'Tailwind CSS'] },
  { group: 'Data & AI', items: ['MySQL', 'SQLite', 'PyTorch'] },
  { group: 'Tools & Theory', items: ['Docker', 'Git', 'Discrete Math'] },
]

export const INTERESTS = ['Programming', 'Computer Science', 'Photography', 'Video', 'Technology', 'Reading']
