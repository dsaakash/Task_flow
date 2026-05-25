/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js/Webpack NOT to bundle these native Node modules.
  // They must be loaded via require() at runtime, not inlined into the bundle.
  serverExternalPackages: [
    "better-sqlite3",
    "@prisma/adapter-better-sqlite3",
    "@prisma/client",
    "bcryptjs",
  ],
};

export default nextConfig;
