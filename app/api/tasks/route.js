import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/tasks (Retrieves tasks, supporting query filters)
export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const assignedToId = searchParams.get("assignedToId");

    let whereClause = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (assignedToId) {
      whereClause.assignedToId = assignedToId;
    }

    // Access check: If not Admin, ensure user is a member of projects being searched
    if (currentUser.role !== "Admin") {
      if (projectId) {
        // Ensure user belongs to this specific project
        const membership = await prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId,
              userId: currentUser.id,
            },
          },
        });
        if (!membership) {
          return NextResponse.json(
            { error: "Forbidden: You are not a member of this project" },
            { status: 403 }
          );
        }
      } else {
        // Querying generally: restrict tasks to projects where they are a member
        whereClause.project = {
          members: {
            some: {
              userId: currentUser.id,
            },
          },
        };
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks (Create a task)
export async function POST(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedToId,
    } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Access check: Requesters must be Admin or a project member
    const isMember = project.members.some((m) => m.userId === currentUser.id);
    if (currentUser.role !== "Admin" && !isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project" },
        { status: 403 }
      );
    }

    // Validate assignee membership if assigned
    if (assignedToId) {
      const isAssigneeMember = project.members.some(
        (m) => m.userId === assignedToId
      );
      if (!isAssigneeMember) {
        return NextResponse.json(
          { error: "Assignee must be a member of the project" },
          { status: 400 }
        );
      }
    }

    // Create task
    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId: assignedToId || null,
        createdById: currentUser.id,
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

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("POST task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
