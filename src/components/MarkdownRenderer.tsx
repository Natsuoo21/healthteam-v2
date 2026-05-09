import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl md:text-2xl font-display font-bold text-zinc-900 dark:text-white mb-4 md:mb-5 mt-6 md:mt-8 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-3 md:mb-4 mt-6 md:mt-8 first:mt-0 flex items-center gap-2">
      <span className="w-5 h-[2px] bg-health-500 rounded shrink-0" />{children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-xs font-black text-health-600 dark:text-health-400 mb-2 md:mb-3 mt-4 md:mt-6 first:mt-0 uppercase tracking-widest">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2 mt-4">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed mb-4 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="space-y-2 mb-4">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="space-y-2 mb-4 list-decimal pl-5 marker:text-health-500 marker:font-bold">{children}</ol>,
  li: ({ children, ordered }: { children?: React.ReactNode; ordered?: boolean }) => {
    if (ordered) {
      return (
        <li className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed pl-1">
          {children}
        </li>
      );
    }
    return (
      <li className="text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed flex gap-2.5">
        <span className="text-health-500 shrink-0 mt-0.5 font-bold">›</span>
        <span className="flex-1">{children}</span>
      </li>
    );
  },
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-zinc-900 dark:text-white">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-zinc-600 dark:text-zinc-300">{children}</em>,
  hr: () => <div className="my-6 md:my-8 flex items-center gap-4"><div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" /><div className="w-1.5 h-1.5 rounded-full bg-health-500/50" /><div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" /></div>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 border-health-500/40 pl-4 py-1 my-4 bg-health-50/50 dark:bg-health-500/5 rounded-r-xl text-sm text-zinc-700 dark:text-zinc-200 italic">{children}</blockquote>
  ),
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return <code className={`${className} block text-xs text-zinc-100`}>{children}</code>;
    }
    return <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono text-health-700 dark:text-health-300">{children}</code>;
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 mb-4 overflow-x-auto text-xs font-mono leading-relaxed border border-zinc-200 dark:border-zinc-700">{children}</pre>
  ),
  table: ({ children }: { children?: React.ReactNode }) => <div className="overflow-x-auto mb-4 rounded-xl border border-zinc-300 dark:border-zinc-600"><table className="w-full text-sm">{children}</table></div>,
  thead: ({ children }: { children?: React.ReactNode }) => <thead className="bg-zinc-100 dark:bg-zinc-800">{children}</thead>,
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => <tr className="even:bg-zinc-50 dark:even:bg-zinc-800/50">{children}</tr>,
  th: ({ children }: { children?: React.ReactNode }) => <th className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-600">{children}</th>,
  td: ({ children }: { children?: React.ReactNode }) => <td className="py-2.5 px-3 text-sm text-zinc-800 dark:text-zinc-100">{children}</td>,
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}
