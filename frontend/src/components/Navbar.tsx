import { useEffect, useState } from 'react'
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
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? 'border-b hairline bg-white/80 backdrop-blur-xl dark:bg-neutral-950/80'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main navigation">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="text-[17px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
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
                    ? 'text-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50'
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
            className="hidden h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:inline-flex"
          >
            <Github size={17} strokeWidth={1.75} />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:inline-flex"
          >
            <Youtube size={18} strokeWidth={1.75} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t hairline bg-white/95 px-5 py-4 backdrop-blur-xl dark:bg-neutral-950/95 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-base font-medium ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                      : 'text-neutral-600 dark:text-neutral-300'
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
