import { useState } from "react";
import {
  Search,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Power,
  LinkIcon,
  RefreshCw,
  Inbox,
} from "lucide-react";
import type { Link } from "@/types";
import { formatDate, truncateUrl } from "@/lib/utils";

interface LinksListProps {
  links: Link[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleActive: (id: string, currentActive: boolean) => void;
  onDeleteLink: (id: string) => void;
  onRefresh: () => void;
  buildShortUrl: (shortCode: string) => string;
}

export function LinksList({
  links,
  loading,
  searchQuery,
  onSearchChange,
  onToggleActive,
  onDeleteLink,
  onRefresh,
  buildShortUrl,
}: LinksListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCopy = (link: Link) => {
    navigator.clipboard.writeText(buildShortUrl(link.short_code));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-white">Your Links</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search links..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all"
            />
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/20 transition-all"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="mt-3 text-sm text-slate-400">Loading your links...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && links.length === 0 && !searchQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10">
            <Inbox className="h-7 w-7 text-slate-500" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-300">No links yet</p>
          <p className="mt-1 text-xs text-slate-500">Create your first short link above to get started.</p>
        </div>
      )}

      {/* No search results */}
      {!loading && links.length === 0 && searchQuery && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10">
            <Search className="h-7 w-7 text-slate-500" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-300">No matching links</p>
          <p className="mt-1 text-xs text-slate-500">Try a different search term.</p>
        </div>
      )}

      {/* Links list */}
      {!loading && links.length > 0 && (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Link info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <LinkIcon className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-500">Original:</span>
                  </div>
                  <a
                    href={link.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-slate-300 hover:text-cyan-300 transition-colors truncate"
                    title={link.original_url}
                  >
                    {truncateUrl(link.original_url, 60)}
                  </a>

                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <span className="text-xs text-slate-500">Short:</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      link.is_active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${link.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
                      {link.is_active ? "Active" : "Inactive"}
                    </span>
                    {link.custom_alias && (
                      <span className="text-xs text-blue-400/70">custom alias</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-cyan-300 truncate">
                      {buildShortUrl(link.short_code)}
                    </span>
                  </div>
                </div>

                {/* Stats & actions */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white tabular-nums">{link.click_count || 0}</p>
                    <p className="text-xs text-slate-500">clicks</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(link)}
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                      title="Copy short URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={buildShortUrl(link.short_code)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white hover:border-white/20 transition-all"
                      title="Open short URL"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => onToggleActive(link.id, link.is_active)}
                      className={`flex items-center justify-center rounded-lg border p-2 transition-all ${
                        link.is_active
                          ? "border-white/10 bg-white/[0.04] text-slate-400 hover:text-amber-400 hover:border-amber-400/30"
                          : "border-amber-400/30 bg-amber-500/10 text-amber-400 hover:text-amber-300"
                      }`}
                      title={link.is_active ? "Deactivate" : "Activate"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    {confirmDeleteId === link.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteLink(link.id);
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg bg-red-500/20 border border-red-500/30 px-2 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-all"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg bg-white/[0.04] border border-white/10 px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(link.id)}
                        className="flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-red-400 hover:border-red-400/30 transition-all"
                        title="Delete link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-slate-500">Created {formatDate(link.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
