import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/projects/[id]
export async function GET(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Fetch project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Access check: Requesters must be Admin or a member of the project
    const isMember = project.members.some((m) => m.userId === currentUser.id);
    if (currentUser.role !== "Admin" && !isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this project" },
        { status: 403 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("GET project by ID error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { name, description } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Find project to verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // RBAC check: Only project owner or Admin can edit project settings
    if (currentUser.role !== "Admin" && project.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the project owner or Admin can edit settings" },
        { status: 403 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("PUT project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Find project to verify ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // RBAC check: Only project owner or Admin can delete projects
    if (currentUser.role !== "Admin" && project.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the project owner or Admin can delete this project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
