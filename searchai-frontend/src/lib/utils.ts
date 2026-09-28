import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 1) + '…';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function parseMarkdownLinks(text: string): { title: string; url: string }[] {
  const links: { title: string; url: string }[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    links.push({ title: match[1].trim(), url: match[2].trim() });
  }

  return links;
}

export function extractSources(content: string): {
  cleanContent: string;
  sources: { title: string; url: string }[];
} {
  const sourceMarkers = ['Sources and references:', '📚 Sources'];
  let splitIndex = -1;
  let marker = '';

  for (const m of sourceMarkers) {
    const idx = content.indexOf(m);
    if (idx !== -1) {
      splitIndex = idx;
      marker = m;
      break;
    }
  }

  if (splitIndex === -1) {
    return { cleanContent: content.trim(), sources: [] };
  }

  const cleanContent = content.slice(0, splitIndex).trim();
  const sourcesSection = content.slice(splitIndex + marker.length).trim();
  const sources = parseMarkdownLinks(sourcesSection);

  return { cleanContent, sources };
}

export const DEFAULT_MODEL = 'gemini-2.0-flash-001';
export const AVAILABLE_MODELS = [
  { id: 'gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
] as const;

export const PROMPT_SUGGESTIONS = [
  'Explain how Rust achieves memory safety without garbage collection',
  'Compare React Server Components vs Client Components',
  'What are the latest developments in AI agent frameworks?',
  'Show me the current Bitcoin price and 24h change',
  'Find recent papers on transformer architecture improvements',
  'Summarize the top Hacker News discussions this week',
  'How does the ownership model work in Rust?',
  'What are the best practices for TypeScript strict mode?',
];