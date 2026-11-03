import { MotionConfig, motion, type Variants } from 'framer-motion'
import {
  ArrowUpRight,
  Camera,
  Check,
  Copy,
  Github,
  GraduationCap,
  Mail,
  MapPin,
  PenLine,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { EMAIL, GITHUB_URL } from '../config/links'
import { INTERESTS, PROFILE, STACK } from '../config/profile'
import { usePageMeta } from '../hooks/usePageMeta'

// Everything on this page is above the fold, so cards animate in on load
// (staggered) rather than on scroll.
const grid: Variants = { show: { transition: { staggerChildren: 0.06 } } }
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
}

const explore = [
  { to: '/blog', label: 'Blog', hint: 'Notes & writing', icon: PenLine },
  { to: '/photos', label: 'Photos', hint: 'Travel & daily life', icon: Camera },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) — the mailto link still works.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copied' : 'Copy email address'}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-200"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </button>
  )
}

function Fact({
  icon: Icon,
  label,
  children,
  detail,
  action,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
  detail: string
  action?: ReactNode
}) {
  return (
    // Phones: icon on the left with the text stacked beside it (compact).
    // sm+: icon and label share the top row, value and detail sit underneath.
    <div className="card relative grid h-full grid-cols-[auto_1fr] content-start gap-x-3.5 px-4 py-3.5 sm:gap-x-2.5 sm:p-5">
      <span className="accent-tile row-span-3 h-9 w-9 sm:row-span-1 sm:h-8 sm:w-8">
        <Icon size={16} strokeWidth={1.9} />
      </span>
      <p className="eyebrow self-center pr-8">{label}</p>
      <div className="pr-6 text-[15px] font-semibold leading-snug [overflow-wrap:anywhere] text-neutral-900 dark:text-neutral-50 sm:col-span-2 sm:mt-3 sm:pr-0">
        {children}
      </div>
      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 sm:col-span-2">{detail}</p>
      {action && <div className="absolute right-3 top-3 sm:right-4 sm:top-4">{action}</div>}
    </div>
  )
}

export default function Home() {
  usePageMeta(
    undefined,
    `${PROFILE.name} (${PROFILE.realName}), ${PROFILE.school.course} student at ${PROFILE.school.short}, based in ${PROFILE.location}.`,
  )

  return (
    <MotionConfig reducedMotion="user">
      <section className="container-page pb-6 pt-4 sm:py-8">
        {/* lg: row-dense lets the Explore card slot in beside the facts even though it comes last in the DOM */}
        <motion.div
          variants={grid}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-flow-row-dense lg:grid-cols-12 lg:gap-5"
        >
          {/* Portrait — desktop only; on small screens it sits inside the intro card. Deliberately not a .card:
              no border or background, so the photo reaches the edge. Its column widths keep the intro shorter
              than the photo, so the row takes the photo's height and the whole picture shows. */}
          <motion.figure
            variants={item}
            className="relative hidden overflow-hidden rounded-card lg:col-span-5 lg:block xl:col-span-4"
          >
            <img
              src={PROFILE.portrait}
              alt={`${PROFILE.name} in front of Big Ben, London`}
              width={1240}
              height={1280}
              className="block h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
              <MapPin size={13} /> {PROFILE.location}
            </figcaption>
          </motion.figure>

          {/* Intro */}
          <motion.div
            variants={item}
            className="card relative overflow-hidden p-5 sm:p-8 md:col-span-2 lg:col-span-7 xl:col-span-8 xl:py-7"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-coral/25 blur-3xl dark:bg-azure/25"
            />
            <div className="relative">
              <div className="flex items-center gap-4">
                <img
                  src={PROFILE.portrait}
                  alt=""
                  width={54}
                  height={56}
                  className="h-14 w-auto rounded-inner lg:hidden"
                />
                <p className="text-[15px] font-medium text-neutral-600 dark:text-neutral-300">{PROFILE.realName}</p>
              </div>

              <h1 className="mt-3 font-serif text-[2.75rem] font-medium leading-[1.05] tracking-tight text-neutral-900 dark:text-neutral-50 sm:mt-4 sm:text-6xl">
                {PROFILE.name}
              </h1>
              <p className="mt-3 text-lg font-medium text-neutral-700 dark:text-neutral-200">
                {PROFILE.school.course} student at <span className="accent-text">{PROFILE.school.short}</span>
              </p>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
                {PROFILE.bio}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                <a href={`mailto:${EMAIL}`} className="btn-primary">
                  <Mail size={15} /> Email me
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                  <Github size={15} /> GitHub
                </a>
              </div>
            </div>
          </motion.div>

          {/* Key facts */}
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-3 md:col-span-2 lg:col-span-9 lg:gap-5">
            <Fact icon={GraduationCap} label="Education" detail={`${PROFILE.school.course}, ${PROFILE.school.year}`}>
              {PROFILE.school.name}
            </Fact>
            <Fact icon={MapPin} label="Based in" detail={`Studying at ${PROFILE.school.short}`}>
              {PROFILE.location}
            </Fact>
            <Fact icon={Mail} label="Email" detail="Best way to reach me" action={<CopyButton text={EMAIL} />}>
              <a href={`mailto:${EMAIL}`} className="hover:underline">
                {EMAIL}
              </a>
            </Fact>
          </motion.div>

          {/* Tech stack */}
          <motion.div variants={item} className="card p-6 md:col-span-2 lg:col-span-8">
            <p className="eyebrow">Tech stack</p>
            <dl className="mt-4 space-y-2.5">
              {STACK.map((s) => (
                <div key={s.group} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <dt className="w-28 shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{s.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {s.items.map((t) => (
                      <span key={t} className="chip px-2.5 py-0.5 font-medium">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Interests */}
          <motion.div variants={item} className="card p-6 lg:col-span-4">
            <p className="eyebrow">Interests</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <span key={i} className="chip">
                  {i}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Explore */}
          <motion.nav variants={item} aria-label="Explore" className="card flex flex-col justify-center p-2.5 lg:col-span-3">
            <ul>
              {explore.map((e) => (
                <li key={e.to}>
                  <Link
                    to={e.to}
                    className="group flex items-center gap-3 rounded-inner p-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/5"
                  >
                    <span className="accent-tile h-9 w-9">
                      <e.icon size={17} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                        {e.label}
                      </span>
                      <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{e.hint}</span>
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        </motion.div>
      </section>
    </MotionConfig>
  )
}
