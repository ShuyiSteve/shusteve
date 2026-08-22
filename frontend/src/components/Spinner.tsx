export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 py-16 text-neutral-500 dark:text-neutral-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
