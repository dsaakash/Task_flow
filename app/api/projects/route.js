import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// GET /api/projects
export async function GET(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let projects = [];

    if (currentUser.role === "Admin") {
      // Admins see everything
      projects = await prisma.project.findMany({
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
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Members only see projects they belong to
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: {
              userId: currentUser.id,
            },
          },
        },
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
            select: { id: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create the project and automatically add the creator as a project member
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        ownerId: currentUser.id,
        members: {
          create: {
            userId: currentUser.id,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tasks: true,
      },
    });

    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
