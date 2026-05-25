"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthContext";
import { FolderKanban, ShieldCheck, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || "Invalid email or password");
      setLoading(false);
    }
  };

  // Pre-fill fields for easy evaluation
  const autofillDemoUser = (role) => {
    if (role === "Admin") {
      setEmail("admin@taskflow.com");
      setPassword("admin123");
    } else {
      setEmail("member@taskflow.com");
      setPassword("member123");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FolderKanban className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">TaskFlow</span>
          </Link>
          <p className="text-zinc-400 text-xs font-medium">
            Sign in to coordinate your team tasks
          </p>
        </div>

        {/* Card Panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-white text-center">
            Welcome Back
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          {/* Quick-Access Demo buttons (Extremely friendly feature!) */}
          <div className="space-y-2.5 pt-4 border-t border-zinc-900">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
              Quick Test Autofill
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => autofillDemoUser("Admin")}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                As Admin
              </button>
              <button
                type="button"
                onClick={() => autofillDemoUser("Member")}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                As Member
              </button>
            </div>
          </div>
        </div>

        {/* Footer Redirect */}
        <p className="text-center text-xs text-zinc-500 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
          >
            Create one here
          </Link>
        </p>
      </div>
    </div>
  );
}
