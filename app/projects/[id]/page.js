"use client";

import { useEffect, useState, use } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/AuthContext";
import TaskModal from "../../components/TaskModal";
import MemberModal from "../../components/MemberModal";
import {
  FolderKanban,
  Users,
  Plus,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Settings,
  Trash2,
  Edit2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function ProjectBoard({ params }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals visibility
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [activeTaskForEdit, setActiveTaskForEdit] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Forbidden: You are not a member of this project workspace.");
        }
        throw new Error("Failed to load project details");
      }
      const data = await res.json();
      setProject(data.project);
    } catch (err) {
      setError(err.message || "Failed to fetch project intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjectDetails();
    }
  }, [user, projectId]);

  // Handle task submission (create or update)
  const handleTaskSubmit = async (taskData) => {
    const isEdit = !!activeTaskForEdit;
    const url = isEdit
      ? `/api/tasks/${activeTaskForEdit.id}`
      : "/api/tasks";
    const method = isEdit ? "PUT" : "POST";

    const payload = isEdit
      ? taskData
      : { ...taskData, projectId };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to save task.");
    }

    fetchProjectDetails(); // Reload board state
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to permanently delete this task?")) {
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjectDetails();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete task");
      }
    } catch (err) {
      alert("Error deleting task");
    }
  };

  // Handle member operations (add/remove)
  const handleAddMember = async (userId) => {
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to add member.");
    }

    fetchProjectDetails(); // Reload members list
  };

  const handleRemoveMember = async (userId) => {
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to remove member.");
    }

    fetchProjectDetails(); // Reload members list
  };

  // Direct status transition (dropdown selection)
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchProjectDetails();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update task status");
      }
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Loading Board...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
        <Sidebar />
        <main className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-200">Access Restricted</h3>
            <p className="text-xs text-zinc-500 max-w-sm">{error}</p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </main>
      </div>
    );
  }

  // Filter tasks into Columns
  const columns = {
    TODO: { title: "Queue (Todo)", color: "border-t-zinc-600 bg-zinc-600/3", tasks: [] },
    IN_PROGRESS: { title: "Working (Active)", color: "border-t-indigo-500 bg-indigo-500/3", tasks: [] },
    COMPLETED: { title: "Finished (Done)", color: "border-t-emerald-500 bg-emerald-500/3", tasks: [] },
  };

  if (project && project.tasks) {
    project.tasks.forEach((task) => {
      if (columns[task.status]) {
        columns[task.status].tasks.push(task);
      }
    });
  }

  const isOwnerOrAdmin =
    user && (user.role === "Admin" || project.ownerId === user.id);

  const getPriorityStyles = (p) => {
    switch (p) {
      case "HIGH":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "MEDIUM":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
      default:
        return "bg-zinc-800 border-zinc-700 text-zinc-400";
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      {/* Main Board View */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto flex flex-col h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5 shrink-0">
          <div className="space-y-1.5">
            <Link
              href="/projects"
              className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Workspaces
            </Link>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <FolderKanban className="h-5.5 w-5.5 text-indigo-400" />
              {project.name}
            </h1>
            <p className="text-xs text-zinc-400 font-medium max-w-xl">
              {project.description || "Coordinating board tasks and members."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
            >
              <Users className="h-4 w-4" />
              Members ({project.members.length})
            </button>
            <button
              onClick={() => {
                setActiveTaskForEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start min-h-0 overflow-y-auto">
          {Object.entries(columns).map(([colKey, col]) => (
            <div
              key={colKey}
              className={`glass-panel border-t-2 rounded-2xl p-4 flex flex-col h-full max-h-[75vh] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 border-b border-zinc-900/60 pb-2 shrink-0">
                <span className="text-xs font-black uppercase text-zinc-300 tracking-wider">
                  {col.title}
                </span>
                <span className="h-5 px-2 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                  {col.tasks.length}
                </span>
              </div>

              {/* Tasks Column List */}
              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 pb-4">
                {col.tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-zinc-900 bg-zinc-950/20 text-zinc-600">
                    <p className="text-[10px] font-bold uppercase tracking-wider">Empty Column</p>
                  </div>
                ) : (
                  col.tasks.map((task) => {
                    const isTaskOverdue =
                      task.status !== "COMPLETED" &&
                      task.dueDate &&
                      new Date(task.dueDate) < new Date();

                    const canFullEdit =
                      user &&
                      (user.role === "Admin" ||
                        project.ownerId === user.id ||
                        task.createdById === user.id ||
                        task.assignedToId === user.id);

                    return (
                      <div
                        key={task.id}
                        className="glass-panel-light rounded-xl p-4.5 hover:border-zinc-800 transition-all flex flex-col space-y-4 group relative"
                      >
                        {/* Title Row */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-zinc-100 tracking-tight leading-normal group-hover:text-indigo-400 transition-colors">
                            {task.title}
                          </h4>
                          {canFullEdit && (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => {
                                  setActiveTaskForEdit(task);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                                title="Edit Task"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {isOwnerOrAdmin && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Description (clamp) */}
                        {task.description && (
                          <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Meta Tags Row */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-900/60">
                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${getPriorityStyles(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                          {/* Assignee Badge */}
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                            {task.assignee?.name || "Unassigned"}
                          </div>

                          {/* Due Date Alerter */}
                          {task.dueDate && (
                            <div
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${
                                isTaskOverdue
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                  : "bg-zinc-900 border-zinc-800 text-zinc-500"
                              }`}
                            >
                              {isTaskOverdue ? (
                                <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                              ) : (
                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                              )}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Column Status Workflow Selector */}
                        <div className="pt-2 flex items-center justify-between border-t border-zinc-900/40">
                          <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                            Set Status
                          </label>
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                            className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold rounded-lg px-2 py-1 cursor-pointer transition-all outline-none"
                          >
                            <option value="TODO">Queue (Todo)</option>
                            <option value="IN_PROGRESS">Working</option>
                            <option value="COMPLETED">Finished</option>
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dialog Modals */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setActiveTaskForEdit(null);
          }}
          onSubmit={handleTaskSubmit}
          task={activeTaskForEdit}
          projectMembers={project.members}
        />

        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          project={project}
          currentUser={user}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      </main>
    </div>
  );
}
