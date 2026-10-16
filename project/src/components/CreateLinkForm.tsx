import { useState } from "react";
import { Loader2, Check, AlertCircle, Copy, ExternalLink } from "lucide-react";
import type { CreateLinkResult } from "@/types";

interface CreateLinkFormProps {
  onCreate: (url: string, alias: string) => Promise<CreateLinkResult>;
  buildShortUrl: (shortCode: string) => string;
}

export function CreateLinkForm({ onCreate, buildShortUrl }: CreateLinkFormProps) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateLinkResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    setCopied(false);

    const res = await onCreate(url, alias);
    setResult(res);

    if (res.success) {
      setUrl("");
      setAlias("");
    }

    setSubmitting(false);
  };

  const handleCopy = () => {
    if (!result?.link) return;
    const shortUrl = buildShortUrl(result.link.short_code);
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm">
      <h2 className="text-base font-semibold text-white mb-4">Create a Short Link</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Destination URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 outline-none transition-all"
            disabled={submitting}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
            Custom Alias <span className="text-slate-500 normal-case">(optional)</span>
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-cyan-400/50 focus-within:ring-1 focus-within:ring-cyan-400/30 transition-all">
            <span className="pl-4 pr-1 text-sm text-slate-500 select-none">/</span>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="my-link"
              className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
              disabled={submitting}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">Letters, numbers, hyphens, and underscores only.</p>
        </div>

        <button
          type="submit"
          disabled={submitting || !url.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Shorten URL"
          )}
        </button>
      </form>

      {/* Success state */}
      {result?.success && result.link && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Link created successfully!</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2.5">
            <span className="flex-1 truncate text-sm text-cyan-300 font-mono">
              {buildShortUrl(result.link.short_code)}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
            <a
              href={buildShortUrl(result.link.short_code)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
        </div>
      )}

      {/* Error state */}
      {result && !result.success && result.error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span className="text-sm text-red-300">{result.error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
