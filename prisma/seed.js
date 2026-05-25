const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");

const connectionUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database at:", connectionUrl);

  // 1. Clean existing records
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create passwords
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const memberPasswordHash = await bcrypt.hash("member123", 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@taskflow.com",
      passwordHash: adminPasswordHash,
      role: "Admin",
    },
  });

  const member = await prisma.user.create({
    data: {
      name: "John Member",
      email: "member@taskflow.com",
      passwordHash: memberPasswordHash,
      role: "Member",
    },
  });

  console.log("Seeded users:", { admin: admin.email, member: member.email });

  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Revamping the core company landing pages and developer dashboard with Tailwind CSS v4.",
      ownerId: admin.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mobile App Launch",
      description: "Coordinating the launch of our iOS and Android mobile clients.",
      ownerId: admin.id,
    },
  });

  console.log("Seeded projects:", [project1.name, project2.name]);

  // 5. Add members to projects
  await prisma.projectMember.create({
    data: {
      projectId: project1.id,
      userId: admin.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project1.id,
      userId: member.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project2.id,
      userId: admin.id,
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project2.id,
      userId: member.id,
    },
  });

  console.log("Seeded project memberships.");

  // 6. Seed Tasks for Project 1 (Website Redesign)
  await prisma.task.create({
    data: {
      title: "Design high-fidelity UI wireframes",
      description: "Create modern dark-themed Figma wireframes showing glassmorphism elements.",
      status: "COMPLETED",
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: member.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });

  await prisma.task.create({
    data: {
      title: "Setup Tailwind CSS v4 & Next.js skeleton",
      description: "Initialize a clean Next.js App Router framework with TailwindCSS 4 support.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      projectId: project1.id,
      assignedToId: member.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  });

  await prisma.task.create({
    data: {
      title: "Fix edge router redirect bugs",
      description: "Resolve pathing redirect feedback issues on the core JWT middleware checker.",
      status: "TODO",
      priority: "HIGH",
      projectId: project1.id,
      assignedToId: member.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (TODO + past due = OVERDUE)
    },
  });

  // Seed Tasks for Project 2 (Mobile App Launch)
  await prisma.task.create({
    data: {
      title: "App Store submission guidelines check",
      description: "Prepare App Store compliance sheet and metadata for submission.",
      status: "TODO",
      priority: "LOW",
      projectId: project2.id,
      assignedToId: admin.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    },
  });

  console.log("Seeded tasks.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
