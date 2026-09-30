import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Github, Menu, X, Youtube } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { GITHUB_URL, YOUTUBE_URL } from '../config/links'

const links = [
  { to: '/blog', label: 'Blog' },
  { to: '/photos', label: 'Photos' },
  { to: '/vlog', label: 'Vlog' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/20 bg-[#FF8F70] dark:bg-[#2E6BFF]">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="text-[17px] font-semibold tracking-tight text-white"
        >
          shuSteve
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 hover:text-white sm:inline-flex"
          >
            <Github size={17} strokeWidth={1.75} />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/20 hover:text-white sm:inline-flex"
          >
            <Youtube size={18} strokeWidth={1.75} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/20 bg-[#FF8F70] px-5 py-4 dark:bg-[#2E6BFF] md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-base font-medium ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/15'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
