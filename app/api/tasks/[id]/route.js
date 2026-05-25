import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// PUT /api/tasks/[id]
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    // Fetch existing task and project details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Access check: Requesters must be Admin or a project member
    const isMember = task.project.members.some((m) => m.userId === currentUser.id);
    if (currentUser.role !== "Admin" && !isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assignedToId } = body;

    // Determine if user is performing a full edit or just a status update
    const isOnlyStatusUpdate =
      status !== undefined &&
      title === undefined &&
      description === undefined &&
      priority === undefined &&
      dueDate === undefined &&
      assignedToId === undefined;

    if (isOnlyStatusUpdate) {
      // Any project member can update the status
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { status },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ success: true, task: updatedTask });
    }

    // Full edits are restricted to Admin, Project Owner, Task Creator, or Task Assignee
    const isOwner = task.project.ownerId === currentUser.id;
    const isCreator = task.createdById === currentUser.id;
    const isAssignee = task.assignedToId === currentUser.id;

    const canEditFull = currentUser.role === "Admin" || isOwner || isCreator || isAssignee;

    if (!canEditFull) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to edit this task's core details" },
        { status: 403 }
      );
    }

    // Validate assignee if being changed
    if (assignedToId) {
      const isAssigneeProjectMember = task.project.members.some(
        (m) => m.userId === assignedToId
      );
      if (!isAssigneeProjectMember) {
        return NextResponse.json(
          { error: "Assignee must be a member of this project" },
          { status: 400 }
        );
      }
    }

    // Perform update
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title.trim() : task.title,
        description: description !== undefined ? (description ? description.trim() : null) : task.description,
        status: status !== undefined ? status : task.status,
        priority: priority !== undefined ? priority : task.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        assignedToId: assignedToId !== undefined ? (assignedToId || null) : task.assignedToId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("PUT task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    // Fetch existing task and project details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // RBAC check: Only Admin, Project Owner, or Task Creator can delete a task
    const isOwner = task.project.ownerId === currentUser.id;
    const isCreator = task.createdById === currentUser.id;

    const canDelete = currentUser.role === "Admin" || isOwner || isCreator;

    if (!canDelete) {
      return NextResponse.json(
        { error: "Forbidden: Only Admins, Project Owners, or the Task Creator can delete this task" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
