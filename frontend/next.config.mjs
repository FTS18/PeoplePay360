/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for the production Docker stage (outputs a self-contained server.js)
  // output: "standalone",

  // In Docker, NEXT_PUBLIC_API_HOST=http://backend:8080 (service name).
  // Locally without Docker, falls back to localhost:8080.
  async rewrites() {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiHost}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
