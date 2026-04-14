"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface ShortLink {
  id: number;
  code: string;
  url: string;
  createdAt: string;
}

type ModalMode = "add" | "edit";

function LinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncateUrl(url: string, max = 55) {
  if (url.length <= max) return url;
  return url.slice(0, max) + "…";
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: ModalMode;
  initial?: ShortLink;
  onClose: () => void;
  onSaved: () => void;
}

function Modal({ mode, initial, onClose, onSaved }: ModalProps) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimCode = code.trim();
    const trimUrl = url.trim();
    if (!trimCode || !trimUrl) {
      toast.error("Both fields are required");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "add" ? "/api/links" : `/api/links/${initial!.id}`;
      const method = mode === "add" ? "POST" : "PUT";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimCode, url: trimUrl }),
      });
      if (!res.ok) {
        const body = await res.json();
        toast.error(body.error ?? "Something went wrong");
        return;
      }
      toast.success(mode === "add" ? "Shortlink created" : "Shortlink updated");
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface-2 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-slate-100">
            {mode === "add" ? "New shortlink" : "Edit shortlink"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors rounded-md p-1 hover:bg-surface-3"
          >
            <XIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Short code
            </label>
            <div className="flex items-center rounded-lg border border-border bg-surface focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <span className="pl-3 pr-1 text-slate-500 font-mono text-sm select-none">h/</span>
              <input
                ref={codeRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="yt_metrics"
                className="flex-1 bg-transparent px-2 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-600 outline-none"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
              Target URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
            >
              {loading ? "Saving…" : mode === "add" ? "Create" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ mode: ModalMode; link?: ShortLink } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const filtered = links.filter(
    (l) =>
      l.code.toLowerCase().includes(query.toLowerCase()) ||
      l.url.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete(link: ShortLink) {
    if (!confirm(`Delete "h/${link.code}"?`)) return;
    setDeletingId(link.id);
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted h/${link.code}`);
        fetchLinks();
      } else {
        toast.error("Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function copyShortUrl(code: string) {
    navigator.clipboard.writeText(`h/${code}`);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <LinkIcon size={20} />
            <span className="font-semibold text-slate-100 tracking-tight">shorturl</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-surface-1 border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={() => setModal({ mode: "add" })}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            <PlusIcon />
            New link
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Stats bar */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-100">{links.length}</span>
          <span className="text-slate-500 text-sm">shortlink{links.length !== 1 ? "s" : ""}</span>
          {query && (
            <span className="text-slate-600 text-sm ml-1">
              · {filtered.length} matching &ldquo;{query}&rdquo;
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <LinkIcon size={28} />
              <p className="text-slate-500 text-sm">
                {query ? "No links match your search" : "No shortlinks yet — create one!"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-40">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target URL</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32 hidden sm:table-cell">Created</th>
                  <th className="w-28 px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((link) => (
                  <tr
                    key={link.id}
                    className="group hover:bg-surface-2 transition-colors"
                  >
                    {/* Code */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-indigo-400 font-medium">h/</span>
                        <span className="font-mono text-slate-200 font-medium">{link.code}</span>
                        <button
                          onClick={() => copyShortUrl(link.code)}
                          className="ml-1 text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy shortlink"
                        >
                          <CopyIcon />
                        </button>
                      </div>
                    </td>

                    {/* URL */}
                    <td className="px-5 py-3.5">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title={link.url}
                      >
                        {truncateUrl(link.url)}
                      </a>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-slate-600 hidden sm:table-cell">
                      {formatDate(link.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ mode: "edit", link })}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-surface-3 transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(link)}
                          disabled={deletingId === link.id}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer hint */}
        {links.length > 0 && (
          <p className="mt-4 text-center text-xs text-slate-700">
            Type <span className="font-mono text-slate-600">h/&lt;code&gt;</span> in your browser to use a shortlink
          </p>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <Modal
          mode={modal.mode}
          initial={modal.link}
          onClose={() => setModal(null)}
          onSaved={fetchLinks}
        />
      )}
    </div>
  );
}
