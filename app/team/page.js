"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthContext";
import {
  Users,
  ShieldCheck,
  User,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Mail,
  Calendar,
} from "lucide-react";

export default function Team() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message || "Failed to load team directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Toggle user role (Admin <-> Member)
  const handleToggleRole = async (targetUser) => {
    // Safety check: Cannot demote yourself
    if (targetUser.id === currentUser?.id) {
      alert("Safety Guard: You cannot demote yourself from Admin status.");
      return;
    }

    const newRole = targetUser.role === "Admin" ? "Member" : "Admin";
    if (
      !confirm(
        `Are you sure you want to change ${targetUser.name}'s role to ${newRole}?`
      )
    ) {
      return;
    }

    setSubmittingId(targetUser.id);
    setError("");

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update user role");
      }

      fetchUsers(); // Reload user database
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Loading Directory...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      {/* Main Team View Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Team Operations
            </h1>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mt-1">
              Elevate privileges and manage member permissions
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Directory Card List */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-zinc-900">
          <div className="px-6 py-4 border-b border-zinc-900/60 bg-zinc-900/15 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Company Members Directory ({users.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/40">
                  <th className="py-4 px-6">Name & Profile</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role Rank</th>
                  <th className="py-4 px-6">Joined On</th>
                  <th className="py-4 px-6 text-right">Role Configuration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/80">
                {users.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  const isCurrentAdmin = item.role === "Admin";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-900/15 transition-colors text-xs font-medium text-zinc-300"
                    >
                      {/* Name profile */}
                      <td className="py-4.5 px-6 flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-xl bg-zinc-900 border border-zinc-800/60 flex items-center justify-center font-bold text-zinc-400">
                          {item.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {item.name}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-[8px] font-extrabold uppercase">
                                You
                              </span>
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Email address */}
                      <td className="py-4.5 px-6 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-zinc-600" />
                          <span>{item.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-1.5">
                          {isCurrentAdmin ? (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                              <User className="h-3 w-3" />
                              Member
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Joined On */}
                      <td className="py-4.5 px-6 text-zinc-500 font-semibold uppercase text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                          <span>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      {/* Toggle Controls */}
                      <td className="py-4.5 px-6 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-zinc-600 font-bold uppercase">
                            Locked (Self)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleRole(item)}
                            disabled={submittingId === item.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                              isCurrentAdmin
                                ? "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400"
                                : "border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400"
                            }`}
                          >
                            {isCurrentAdmin ? (
                              <>
                                <ToggleRight className="h-4.5 w-4.5 text-amber-400" />
                                Demote to Member
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4.5 w-4.5 text-indigo-400" />
                                Promote to Admin
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
