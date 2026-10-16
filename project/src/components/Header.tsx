import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Link<span className="text-cyan-400">Pulse</span>
              </h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
