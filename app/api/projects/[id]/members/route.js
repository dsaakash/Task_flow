import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// POST /api/projects/[id]/members (Add member)
export async function POST(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists and requester is owner or Admin
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (currentUser.role !== "Admin" && project.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the project owner or Admin can manage members" },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 409 }
      );
    }

    // Add membership
    const membership = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, member: membership.user });
  } catch (error) {
    console.error("POST project member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/members (Remove member)
export async function DELETE(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = resolvedParams.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Verify project exists and requester is owner or Admin
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (currentUser.role !== "Admin" && project.ownerId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the project owner or Admin can manage members" },
        { status: 403 }
      );
    }

    // Prevent removing the project owner
    if (project.ownerId === userId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot remove the project owner from the project" },
        { status: 400 }
      );
    }

    // Delete membership
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    // Clean up any tasks in this project assigned to this user (set assignee to null)
    await prisma.task.updateMany({
      where: {
        projectId,
        assignedToId: userId,
      },
      data: {
        assignedToId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed and tasks unassigned",
    });
  } catch (error) {
    console.error("DELETE project member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
