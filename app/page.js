import Link from "next/link";
import {
  FolderKanban,
  ShieldAlert,
  BarChart3,
  Users2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background radial gradient spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none z-0" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="border-b border-zinc-900/60 backdrop-blur-md bg-zinc-950/30 sticky top-0 z-50 w-full shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4 px-6 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <FolderKanban className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">TaskFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-32 max-w-6xl mx-auto relative z-10 text-center space-y-16">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" />
            The Next-Generation Task Workspace
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Coordinate projects, track status,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              empower teams.
            </span>
          </h1>

          <p className="text-zinc-400 text-sm sm:text-lg leading-relaxed max-w-2xl mx-auto">
            TaskFlow is a premium, full-stack collaborative workspace. Create
            projects, assign tasks, manage permissions with role-based controls,
            and monitor deliverables with beautiful zero-dependency analytics.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-xs sm:max-w-none">
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all glow-btn"
          >
            Launch Free Workspace
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold bg-zinc-900/20 hover:bg-zinc-800/20 transition-all flex items-center justify-center"
          >
            Sign In with Demo Accounts
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full pt-16">
          <div className="glass-panel p-6 rounded-2xl text-left space-y-3 transition-transform hover:-translate-y-1">
            <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Project Workspaces</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Organize requirements into dedicated workspaces with custom members, tracking, and milestones.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left space-y-3 transition-transform hover:-translate-y-1">
            <div className="p-2.5 w-fit rounded-xl bg-violet-500/10 text-violet-400">
              <Users2 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Role-Based Control</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Enforce access layers with Admin and Member configurations. Restrict project settings and role elevations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left space-y-3 transition-transform hover:-translate-y-1">
            <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Advanced Analytics</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Monitor project milestones, workload metrics, and task progress using responsive, lightweight charts.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left space-y-3 transition-transform hover:-translate-y-1">
            <div className="p-2.5 w-fit rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Overdue Alerter</h4>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Never miss a due date. Instant flagging and notifications for tasks past their deadline in queue.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 p-6 text-center text-zinc-600 text-[10px] uppercase font-bold tracking-wider relative z-10 shrink-0">
        TaskFlow Full-Stack Portal © {new Date().getFullYear()} — Optimized for Render Deployment
      </footer>
    </div>
  );
}
