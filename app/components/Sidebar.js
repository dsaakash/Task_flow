"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: FolderKanban,
      adminOnly: false,
    },
    {
      name: "Team Members",
      href: "/team",
      icon: Users,
      adminOnly: true,
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || (user && user.role === "Admin")
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950/80 border-r border-zinc-800/60 backdrop-blur-xl text-zinc-300 w-64 p-5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <FolderKanban className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight">TaskFlow</span>
          <p className="text-[10px] text-zinc-500 tracking-wider uppercase font-medium">Task Manager</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500 shadow-md shadow-indigo-600/5"
                  : "hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Actions */}
      {user && (
        <div className="mt-auto border-t border-zinc-900 pt-5 px-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-200 truncate leading-none mb-1">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                {user.role === "Admin" ? (
                  <>
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500/90">Administrator</span>
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 text-zinc-500" />
                    <span>Team Member</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400/90 hover:bg-rose-500/5 hover:text-rose-400 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
            <FolderKanban className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">TaskFlow</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 bg-zinc-900/40"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Drawer Panel */}
          <div className="relative z-40 h-full">
            <SidebarContent />
          </div>
          {/* Backdrop Clickable Mask */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30"
          />
        </div>
      )}
    </>
  );
}
