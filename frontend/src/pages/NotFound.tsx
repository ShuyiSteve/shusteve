import { Link } from 'react-router-dom'
import Container from '../components/Container'

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-7xl font-medium text-neutral-900 dark:text-neutral-50">404</p>
      <p className="mt-4 text-neutral-500 dark:text-neutral-400">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
      >
        Back home
      </Link>
    </Container>
  )
}
