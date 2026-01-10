import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // ✅ Permitir Cloudinary
  },
};

export default nextConfig;
