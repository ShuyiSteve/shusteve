import { Github, Mail, Youtube } from 'lucide-react'
import Container from '../components/Container'
import Reveal from '../components/Reveal'
import { EMAIL, GITHUB_URL, YOUTUBE_URL } from '../config/links'
import { INTERESTS, PROFILE, STACK } from '../config/profile'
import { usePageMeta } from '../hooks/usePageMeta'

export default function About() {
  usePageMeta('About', `About ${PROFILE.name} — a ${PROFILE.school.course} student at ${PROFILE.school.short}.`)

  return (
    <Container className="py-14 sm:py-20">
      <header className="max-w-2xl">
        <p className="eyebrow">{PROFILE.realName}</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
          {PROFILE.name}
        </h1>
        <p className="mt-3 text-lg font-medium text-neutral-600 dark:text-neutral-300">
          {PROFILE.school.course} student at <span className="accent-text">{PROFILE.school.short}</span>, based in{' '}
          {PROFILE.location}
        </p>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-10">
          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              About Me
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-neutral-600 dark:text-neutral-300">{PROFILE.bio}</p>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Education
            </h2>
            <div className="card mt-4 p-6">
              <p className="font-medium text-neutral-900 dark:text-neutral-50">
                {PROFILE.school.name} ({PROFILE.school.short})
              </p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {PROFILE.school.course}, {PROFILE.school.year}
              </p>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50">
              Interests
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <span key={i} className="chip px-3.5 py-1.5">
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
              {STACK.map((t) => (
                <div key={t.group}>
                  <p className="eyebrow">
                    {t.group}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.items.map((item) => (
                      <span key={item} className="chip font-medium">
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
              <a href={`mailto:${EMAIL}`} className="btn-primary px-4">
                <Mail size={15} /> Email
              </a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-secondary px-4">
                <Github size={15} /> GitHub
              </a>
              <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" className="btn-secondary px-4">
                <Youtube size={15} /> YouTube
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </Container>
  )
}
