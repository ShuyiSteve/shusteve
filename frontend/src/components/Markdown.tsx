import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none break-words prose-table:block prose-table:overflow-x-auto dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-neutral-900 prose-a:underline prose-a:decoration-neutral-300 hover:prose-a:decoration-neutral-900 prose-img:rounded-card prose-pre:rounded-inner dark:prose-a:text-neutral-100 dark:prose-a:decoration-neutral-700">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
