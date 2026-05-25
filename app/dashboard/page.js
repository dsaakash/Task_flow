"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../components/AuthContext";
import MetricCard from "../components/MetricCard";
import { RadialProgressRing, TaskStatusBar } from "../components/CustomChart";
import {
  FolderKanban,
  ClipboardList,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [myTasks, setMyTasks] = useState([]);
  const [overdueTaskList, setOverdueTaskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch projects to count them
      const projRes = await fetch("/api/projects");
      if (!projRes.ok) throw new Error("Failed to load projects");
      const projData = await projRes.json();

      // 2. Fetch all tasks visible to this user
      const taskRes = await fetch("/api/tasks");
      if (!taskRes.ok) throw new Error("Failed to load tasks");
      const taskData = await taskRes.json();
      const allTasks = taskData.tasks;

      // Calculate aggregates
      const totalProjects = projData.projects.length;
      const totalTasks = allTasks.length;
      const inProgressTasks = allTasks.filter((t) => t.status === "IN_PROGRESS").length;
      const completedTasks = allTasks.filter((t) => t.status === "COMPLETED").length;
      
      const now = new Date();
      const overdueTasks = allTasks.filter((t) => {
        if (t.status === "COMPLETED") return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < now;
      });

      setStats({
        totalProjects,
        totalTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks: overdueTasks.length,
      });

      setOverdueTaskList(overdueTasks);

      // Filter tasks assigned to the logged-in user that are active (TODO or IN_PROGRESS)
      if (user) {
        const activeMyTasks = allTasks.filter(
          (t) => t.assignedToId === user.id && t.status !== "COMPLETED"
        );
        setMyTasks(activeMyTasks);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError(err.message || "Failed to fetch dashboard intelligence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Complete a task directly from the dashboard list (gorgeous micro-interaction!)
  const handleQuickComplete = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (res.ok) {
        // Refresh local dashboard data
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update task status");
      }
    } catch (err) {
      alert("Error completing task");
    }
  };

  const getCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return (stats.completedTasks / stats.totalTasks) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">
            Loading Intelligence...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar />

      {/* Main Dashboard Panel */}
      <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dashboard Intelligence
            </h1>
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mt-1">
              Welcome back, {user?.name}
            </p>
          </div>
          <Link
            href="/projects"
            className="w-fit flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-lg"
          >
            Launch Project
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Overview Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <MetricCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={FolderKanban}
            color="indigo"
          />
          <MetricCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={ClipboardList}
            color="violet"
          />
          <MetricCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={Activity}
            color="amber"
          />
          <MetricCard
            title="Completed"
            value={stats.completedTasks}
            icon={CheckCircle}
            color="emerald"
          />
          <MetricCard
            title="Overdue Tasks"
            value={stats.overdueTasks}
            icon={AlertTriangle}
            color="rose"
            trend={
              stats.overdueTasks > 0
                ? `${stats.overdueTasks} critical deadline`
                : null
            }
          />
        </div>

        {/* Dashboard Center Grid: Analytics & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Analytics Breakdowns */}
          <div className="glass-panel rounded-2xl p-6 space-y-6 lg:col-span-1">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3">
              Task Deliverables
            </h3>

            {/* Circular Progress & Segments */}
            <div className="flex flex-col items-center justify-center py-4 space-y-6">
              <RadialProgressRing
                percentage={getCompletionPercentage()}
                size={140}
                strokeWidth={11}
                color="#6366f1"
              />
              <div className="w-full">
                <TaskStatusBar
                  todo={stats.totalTasks - stats.inProgressTasks - stats.completedTasks}
                  inProgress={stats.inProgressTasks}
                  completed={stats.completedTasks}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Overdue & Personal tasks Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overdue Alerts Panel */}
            {overdueTaskList.length > 0 && (
              <div className="glass-panel rounded-2xl p-6 border-rose-500/20 bg-rose-500/3 animate-pulse-glow">
                <div className="flex items-center gap-2 text-rose-400 mb-4">
                  <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Critical Overdue Tasks ({overdueTaskList.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {overdueTaskList.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10"
                    >
                      <div>
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="text-xs font-bold text-zinc-100 hover:text-indigo-400 transition-all hover:underline"
                        >
                          {task.title}
                        </Link>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1 uppercase">
                          Project: {task.project.name} • Assigned:{" "}
                          {task.assignee?.name || "Unassigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase shrink-0">
                        <Clock className="h-3 w-3" />
                        Overdue
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Active Tasks Panel */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-3 mb-4">
                My Active Assignments ({myTasks.length})
              </h3>

              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-300">All caught up!</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      You have no active tasks currently assigned in your queue.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {myTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/40 transition-all group"
                    >
                      <div>
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="text-xs font-bold text-zinc-200 hover:text-indigo-400 hover:underline transition-all"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-zinc-500 mt-1 uppercase">
                          <span>Project: {task.project.name}</span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Complete Status button */}
                      <button
                        onClick={() => handleQuickComplete(task.id)}
                        className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-emerald-600/20 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/20 flex items-center justify-center text-zinc-500 transition-all cursor-pointer shadow-sm"
                        title="Mark Task Finished"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {myTasks.length > 4 && (
                    <p className="text-[10px] text-zinc-500 font-bold uppercase text-center mt-2">
                      + {myTasks.length - 4} more tasks on project boards
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
