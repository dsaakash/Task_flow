"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, Tag, AlertCircle } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task = null, // If editing, pass the task object
  projectMembers = [], // List of users belonging to this project
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setPriority(task.priority || "MEDIUM");
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
      );
      setAssignedToId(task.assignedToId || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate("");
      setAssignedToId("");
    }
    setError("");
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        assignedToId: assignedToId || null,
      };

      await onSubmit(taskData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save task");
    } finally {
      setSubmitting(false);
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
      <div className="glass-panel w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
          <h3 className="text-base font-bold text-white">
            {task ? "Edit Task Details" : "Create New Task"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Wireframe project landing page"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task context, notes or requirements..."
              rows={3}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium resize-none"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              >
                <option value="TODO">Queue (Todo)</option>
                <option value="IN_PROGRESS">Active (Working)</option>
                <option value="COMPLETED">Finished (Done)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Assignee
              </label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name} ({member.user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold bg-zinc-900/20 hover:bg-zinc-800/20 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : task ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
