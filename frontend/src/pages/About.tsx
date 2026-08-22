import { Github, Mail, Youtube } from 'lucide-react'
import Container from '../components/Container'
import Reveal from '../components/Reveal'
import { EMAIL, GITHUB_URL, YOUTUBE_URL } from '../config/links'
import { usePageMeta } from '../hooks/usePageMeta'

const tech = [
  { group: 'Backend', items: ['Golang', 'Gin', 'GORM'] },
  { group: 'Database', items: ['MySQL'] },
  { group: 'Frontend', items: ['React', 'TypeScript', 'Tailwind CSS'] },
  { group: 'Other', items: ['Python', 'Docker', 'Git'] },
]

const interests = ['Programming', 'Computer Science', 'Photography', 'Video / Vlog', 'Technology', 'Reading']

export default function About() {
  usePageMeta('About', 'About Steve Wang — a CS student, developer and creator.')

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">About</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          Steve Wang
        </h1>
        <p className="mt-3 text-lg font-medium text-neutral-600 dark:text-neutral-300">UCL CS First Year Student</p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-10">
          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              About Me
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-neutral-600 dark:text-neutral-300">
              I'm a first-year Computer Science student at UCL. I enjoy building things with code,
              learning how systems work under the hood, and documenting what I discover along the way.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-neutral-500 dark:text-neutral-400">
              This website is my corner of the internet — a place for writing, photography, and video.
              (This is placeholder text; edit <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm dark:bg-neutral-800">src/pages/About.tsx</code> to make it yours.)
            </p>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Education
            </h2>
            <div className="mt-4 rounded-2xl border hairline bg-white p-6 dark:bg-neutral-900">
              <p className="font-medium text-neutral-900 dark:text-neutral-50">University College London (UCL)</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Computer Science · First Year</p>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Interests
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full border hairline px-3.5 py-1.5 text-sm text-neutral-600 dark:text-neutral-300"
                >
                  {i}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="space-y-10">
          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Tech Stack
            </h2>
            <div className="mt-4 space-y-5">
              {tech.map((t) => (
                <div key={t.group}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {t.group}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.items.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border hairline px-3 py-1 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Contact
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Want to say hi or collaborate? I'm easiest to reach by email.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                <Mail size={15} /> Email
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border hairline px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Youtube size={15} /> YouTube
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Container>
  )
}
