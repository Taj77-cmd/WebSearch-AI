import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return (
    <div className="terminal-markdown text-sm leading-relaxed overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks & inline code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            // If it's a code block (contains language or newlines)
            if (match || codeString.includes('\n')) {
              return <CodeBlock language={language} code={codeString} />;
            }

            // Inline code
            return (
              <code className="terminal-inline-code" {...props}>
                {children}
              </code>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div className="terminal-table-wrapper my-4">
                <table className="w-full">{children}</table>
              </div>
            );
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="terminal-link"
              >
                {children}
              </a>
            );
          },

          // Blockquotes
          blockquote({ children }) {
            return <blockquote className="terminal-blockquote">{children}</blockquote>;
          },

          // Lists
          ul({ children }) {
            return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-code-block my-3 rounded-lg border border-terminal-border bg-terminal-bg overflow-hidden">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-terminal-surface border-b border-terminal-border font-mono text-xs text-terminal-text-dim">
        <span className="uppercase text-[11px] font-semibold text-terminal-accent">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-surface-elevated transition-colors text-xs"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-terminal-success" />
              <span className="text-terminal-success text-[11px]">COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">COPY</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto font-mono text-xs sm:text-sm text-terminal-text leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
};
