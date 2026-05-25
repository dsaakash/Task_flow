import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get("session")?.value;
    const currentUser = token ? await verifyToken(token) : null;

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based access control: Admin only
    if (currentUser.role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: Admins only can modify roles" },
        { status: 403 }
      );
    }

    // Await params if Next 15+ App Router
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;
    
    const { role } = await request.json();

    if (!role || (role !== "Admin" && role !== "Member")) {
      return NextResponse.json(
        { error: "Invalid role value. Must be 'Admin' or 'Member'" },
        { status: 400 }
      );
    }

    // Prevent Admin from demoting themselves (so they don't lock themselves out)
    if (targetUserId === currentUser.id && role !== "Admin") {
      return NextResponse.json(
        { error: "Forbidden: You cannot demote yourself from Admin status" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT user role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
