import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@delivery/firebase-config", "@delivery/shared-types"],
};

export default nextConfig;
