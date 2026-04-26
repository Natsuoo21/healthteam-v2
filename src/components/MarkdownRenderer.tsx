import ReactMarkdown from "react-markdown";

export const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50 mb-4 md:mb-5 mt-6 md:mt-8 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3 md:mb-4 mt-6 md:mt-8 first:mt-0 flex items-center gap-2">
      <span className="w-5 h-[2px] bg-health-500 rounded shrink-0" />{children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-xs font-black text-health-700 dark:text-health-400 mb-2 md:mb-3 mt-4 md:mt-6 first:mt-0 uppercase tracking-widest">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2 mt-4">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="space-y-2 mb-4">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex gap-2.5">
      <span className="text-health-500 shrink-0 mt-0.5 font-bold">›</span>
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-zinc-900 dark:text-zinc-100">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-zinc-500 dark:text-zinc-400">{children}</em>,
  hr: () => <div className="my-6 md:my-8 flex items-center gap-4"><div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" /><div className="w-1.5 h-1.5 rounded-full bg-health-500/50" /><div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" /></div>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-health-500/40 pl-4 py-1 my-4 bg-health-50/50 dark:bg-health-900/10 rounded-r-xl text-sm text-zinc-600 dark:text-zinc-400 italic">{children}</blockquote>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return <code className={`${className} block text-xs`}>{children}</code>;
    }
    return <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono text-health-700 dark:text-health-400">{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-4 mb-4 overflow-x-auto text-xs font-mono leading-relaxed border border-zinc-200 dark:border-zinc-800">{children}</pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => <div className="overflow-x-auto mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800"><table className="w-full text-sm">{children}</table></div>,
  th: ({ children }: { children?: React.ReactNode }) => <th className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wide text-zinc-500 bg-zinc-50 dark:bg-zinc-900">{children}</th>,
  td: ({ children }: { children?: React.ReactNode }) => <td className="py-2.5 px-3 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-900">{children}</td>,
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}
