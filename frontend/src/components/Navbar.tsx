import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Github, Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { GITHUB_URL } from '../config/links'

const links = [
  { to: '/blog', label: 'Blog' },
  { to: '/photos', label: 'Photos' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    // Floating bar spanning the window, with the same 12px gap at the top and sides.
    // The header itself lets clicks through so the gutters beside the bar stay usable.
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40">
      <div className="px-3">
        <div className="pointer-events-auto overflow-hidden rounded-card bg-coral shadow-lg shadow-neutral-900/10 dark:bg-azure dark:shadow-black/40">
          <nav className="flex h-14 items-center justify-between px-5" aria-label="Main navigation">
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
                    `rounded-inner px-3.5 py-2 text-sm font-medium transition-colors ${
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
                className="hidden h-9 w-9 items-center justify-center rounded-inner text-white/90 transition-colors hover:bg-white/20 hover:text-white sm:inline-flex"
              >
                <Github size={17} strokeWidth={1.75} />
              </a>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                className="inline-flex h-9 w-9 items-center justify-center rounded-inner text-white transition-colors hover:bg-white/20 md:hidden"
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>

          {open && (
            <div className="border-t border-white/20 p-3 md:hidden">
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-inner px-3 py-2.5 text-base font-medium ${
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
        </div>
      </div>
    </header>
  )
}
