import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep the Node SDK's optional transport dependencies out of Turbopack bundling.
  serverExternalPackages: ["qiniu"]
};

export default nextConfig;
