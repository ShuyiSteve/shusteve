import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/Container'
import Reveal from '../components/Reveal'
import { usePageMeta } from '../hooks/usePageMeta'

const stack = [
  { group: 'Backend', items: ['Golang', 'Gin', 'GORM'] },
  { group: 'Database', items: ['MySQL'] },
  { group: 'Frontend', items: ['React', 'TypeScript'] },
  { group: 'Other', items: ['Python'] },
]

export default function Home() {
  usePageMeta(undefined, 'Personal website of Steve Wang — CS student, developer and creator.')

  return (
    <>
      <section className="container-page py-16 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.85fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
            >
              shuSteve · Personal Site
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-5 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl lg:text-7xl"
            >
              Steve Wang
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-4 text-lg font-medium text-neutral-600 dark:text-neutral-300"
            >
              UCL CS First Year Student
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="mt-4 max-w-md text-base leading-relaxed text-neutral-500 dark:text-neutral-400"
            >
              Building things with code, exploring technology, and documenting the journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                Read the blog
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                About me
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto w-full max-w-md"
          >
            <div className="overflow-hidden rounded-[1.75rem] border hairline bg-white shadow-xl shadow-neutral-900/10 dark:bg-neutral-900 dark:shadow-black/40">
              <img
                src="/images/profile.jpg"
                alt="Portrait of Steve Wang"
                width={1200}
                height={1500}
                className="h-auto w-full object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
              Replace this placeholder with your portrait · see README
            </p>
          </motion.div>
        </div>
      </section>

      <section className="border-t hairline py-20 sm:py-24">
        <Container>
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              What I use
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
              Tech Stack
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((s, i) => (
              <Reveal key={s.group} delay={i * 0.06}>
                <div className="rounded-2xl border hairline bg-white p-6 dark:bg-neutral-900">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {s.group}
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {s.items.map((item) => (
                      <li
                        key={item}
                        className="inline-flex rounded-lg border hairline px-3 py-1 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
