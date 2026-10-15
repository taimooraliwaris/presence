import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  // Avoid Next picking a parent package-lock.json as workspace root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
