import { Github, Mail, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EMAIL, GITHUB_URL, YOUTUBE_URL } from '../config/links'

export default function Footer() {
  return (
    <footer className="border-t hairline py-10">
      <div className="container-page flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          <Link to="/" className="font-semibold text-neutral-800 dark:text-neutral-100">
            shuSteve
          </Link>
          <span className="mx-2">·</span>
          <span>© {new Date().getFullYear()} Steve Wang</span>
        </div>

        <div className="flex items-center gap-1">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Github size={17} strokeWidth={1.75} />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Youtube size={18} strokeWidth={1.75} />
          </a>
          <a
            href={`mailto:${EMAIL}`}
            aria-label="Email"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <Mail size={17} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  )
}
