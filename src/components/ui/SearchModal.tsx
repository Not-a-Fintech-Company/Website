// src/components/ui/SearchModal.tsx
import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Search, X } from 'lucide-preact';

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: { title: string };
    excerpt: string;
  }>;
}

interface PagefindAPI {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
}

declare global {
  interface Window {
    pagefind?: PagefindAPI;
  }
}

interface RenderedResult {
  id: string;
  url: string;
  title: string;
  excerpt: string;
}

// Pagefind returns excerpts containing <mark>...</mark> wrappers around matched
// terms. Render those safely as text nodes + <mark> elements — no raw HTML injection.
function renderExcerpt(excerpt: string): JSX.Element[] {
  const parts: JSX.Element[] = [];
  const pattern = /<mark>([\s\S]*?)<\/mark>/g;
  let lastIndex = 0;
  let key = 0;
  for (const match of excerpt.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(<span key={key++}>{excerpt.slice(lastIndex, start)}</span>);
    }
    parts.push(
      <mark key={key++} class="bg-accent/15 text-ink font-medium not-italic">
        {match[1]}
      </mark>
    );
    lastIndex = start + match[0].length;
  }
  if (lastIndex < excerpt.length) {
    parts.push(<span key={key++}>{excerpt.slice(lastIndex)}</span>);
  }
  return parts;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RenderedResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load pagefind on first open
  useEffect(() => {
    if (!open) return;
    if (window.pagefind) return;
    // @ts-expect-error dynamic import path served by Pagefind at build time
    import(/* @vite-ignore */ '/pagefind/pagefind.js').then((mod) => {
      window.pagefind = mod;
    });
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!query || !window.pagefind) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    window.pagefind.search(query).then(async (raw) => {
      const top = await Promise.all(
        raw.results.slice(0, 8).map(async (r) => {
          const d = await r.data();
          return { id: r.id, url: d.url, title: d.meta.title, excerpt: d.excerpt };
        })
      );
      if (!cancelled) {
        setResults(top);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);

    const btn = document.getElementById('search-button');
    const click = () => setOpen(true);
    btn?.addEventListener('click', click);

    return () => {
      window.removeEventListener('keydown', handler);
      btn?.removeEventListener('click', click);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 bg-ink/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        class="w-full max-w-2xl bg-surface border border-rule rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="flex items-center gap-3 px-4 py-3 border-b border-rule">
          <Search class="w-4 h-4 text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            placeholder="Search guides, models, docs…"
            class="flex-1 bg-transparent outline-none text-ink placeholder:text-muted text-base"
            aria-label="Search query"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            class="text-muted hover:text-ink"
            aria-label="Close search"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p class="px-4 py-6 text-sm text-muted">Searching…</p>
          )}
          {!loading && query && results.length === 0 && (
            <p class="px-4 py-6 text-sm text-muted">No results for "{query}".</p>
          )}
          {!loading && !query && (
            <p class="px-4 py-6 text-sm text-muted">
              Type to search. Press{' '}
              <kbd class="px-1.5 py-0.5 rounded border border-rule text-xs">Esc</kbd> to close.
            </p>
          )}
          {results.length > 0 && (
            <ul>
              {results.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.url}
                    class="block px-4 py-3 border-t border-rule hover:bg-surface-2 transition-colors"
                  >
                    <p class="text-ink font-medium">{r.title}</p>
                    <p class="text-sm text-muted mt-1 line-clamp-2">
                      {renderExcerpt(r.excerpt)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
