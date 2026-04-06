/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    // Allow server actions from localhost (dev) and any deployed domain
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        // Vercel preview & production domains are allowed automatically
        // Add your custom domain here when deploying, e.g.:
        // "anjir.yourdomain.com",
      ],
    },
  },
};

module.exports = nextConfig;
