"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthContext";
import {
  FolderKanban,
  Plus,
  Users,
  Trash2,
  Calendar,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create Project states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data.projects);
    } catch (err) {
      setError(err.message || "Failed to fetch projects database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjName.trim(),
          description: newProjDesc.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setNewProjName("");
      setNewProjDesc("");
      setIsModalOpen(false);
      fetchProjects(); // Reload list
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.preventDefault(); // Stop click propagation to the link
    if (!confirm("Are you sure you want to delete this project? This will permanently wipe all tasks and members.")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete project");
      }
    } catch (err) {
      alert("Error deleting project");
    }
  };

  // Helper: calculate project progress percentage based on tasks
  const getProjectProgress = (tasks = []) => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completedCount / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Loading Projects...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      {/* Main projects container */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Project Workspaces
            </h1>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mt-1">
              Organize and allocate task scopes
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-fit flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Launch Workspace
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-200">No projects yet</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Launch a new project workspace to assign members, coordinate tasks, and track team progress!
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const progress = getProjectProgress(proj.tasks);
              const isOwnerOrAdmin =
                user && (user.role === "Admin" || proj.ownerId === user.id);

              return (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 flex flex-col group relative overflow-hidden"
                >
                  {/* Subtle hover gradient ring */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1 pr-4">
                      <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-400 transition-all truncate">
                        {proj.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">
                        By {proj.owner.name}
                      </p>
                    </div>

                    {isOwnerOrAdmin && (
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                        title="Delete Workspace"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-6 flex-1">
                    {proj.description || "No project description provided."}
                  </p>

                  {/* Stats Row */}
                  <div className="border-t border-zinc-900/60 pt-4 mt-auto space-y-3.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                        {proj.members.length} Members
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                        {proj.tasks.length} Tasks
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                        <span>Workspace Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/40">
                        <div
                          style={{ width: `${progress}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.25)] transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Launch Workspace Dialog Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Content Container */}
            <div className="glass-panel w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderOpen className="h-4.5 w-4.5 text-indigo-400" />
                  Launch Workspace
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4 transform rotate-45" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="e.g. Website Redesign"
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
                    required
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
                    Brief Description
                  </label>
                  <textarea
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    placeholder="Provide overview of deliverables and milestones..."
                    rows={3}
                    className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4.5 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold bg-zinc-900/20 hover:bg-zinc-800/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !newProjName.trim()}
                    className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Launching..." : "Launch Workspace"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
