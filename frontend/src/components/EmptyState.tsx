export default function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed hairline px-6 py-16 text-center">
      <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">{title}</p>
      {hint && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{hint}</p>}
    </div>
  )
}
