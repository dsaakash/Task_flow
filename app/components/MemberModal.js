"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Trash2, ShieldCheck, User, AlertCircle } from "lucide-react";

export default function MemberModal({
  isOpen,
  onClose,
  project, // Project details, including ownerId and current members
  currentUser, // Current logged-in user profile
  onAddMember,
  onRemoveMember,
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllCompanyUsers();
      setSelectedUserId("");
      setError("");
    }
  }, [isOpen, project]);

  const fetchAllCompanyUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        // Filter out users who are already members of this project
        const currentMemberIds = project.members.map((m) => m.userId);
        const nonMembers = data.users.filter(
          (u) => !currentMemberIds.includes(u.id)
        );
        setAllUsers(nonMembers);
      } else {
        setError("Failed to load company users");
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOwnerOrAdmin =
    currentUser &&
    (currentUser.role === "Admin" || project.ownerId === currentUser.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setActioning(true);
    setError("");

    try {
      await onAddMember(selectedUserId);
      setSelectedUserId("");
      // Refresh list of non-members
      fetchAllCompanyUsers();
    } catch (err) {
      setError(err.message || "Failed to add member");
    } finally {
      setActioning(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Are you sure you want to remove this member from the project? This will also unassign their tasks.")) {
      return;
    }

    setActioning(true);
    setError("");

    try {
      await onRemoveMember(userId);
      // Refresh list of non-members
      fetchAllCompanyUsers();
    } catch (err) {
      setError(err.message || "Failed to remove member");
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Content */}
      <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white">Project Members</h3>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
              {project.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Member Form (Admin/Owner only) */}
          {isOwnerOrAdmin && (
            <form onSubmit={handleAdd} className="space-y-2 pb-4 border-b border-zinc-900">
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                Add Member to Project
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loading || allUsers.length === 0}
                  className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                >
                  <option value="">
                    {loading
                      ? "Loading users..."
                      : allUsers.length === 0
                      ? "No other team members to add"
                      : "Select team member..."}
                  </option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={actioning || !selectedUserId}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Current Members ({project.members.length})
            </label>
            <div className="space-y-2">
              {project.members.map((member) => {
                const isProjectOwner = project.ownerId === member.user.id;
                const canRemove =
                  isOwnerOrAdmin &&
                  !isProjectOwner &&
                  member.userId !== currentUser?.id;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {member.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-200">
                          {member.user.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-500 mt-0.5">
                          {isProjectOwner ? (
                            <>
                              <ShieldCheck className="h-2.5 w-2.5 text-indigo-400" />
                              <span className="text-indigo-400/90">Project Creator</span>
                            </>
                          ) : member.user.role === "Admin" ? (
                            <>
                              <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" />
                              <span className="text-emerald-400/80">Admin</span>
                            </>
                          ) : (
                            <>
                              <User className="h-2.5 w-2.5 text-zinc-500" />
                              <span>Member</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {canRemove && (
                      <button
                        onClick={() => handleRemove(member.userId)}
                        disabled={actioning}
                        className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Remove member from project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
