const nextConfig = {
  reactStrictMode: true,
  distDir: ".runtime-next",
  transpilePackages: ["@hallederiz/ui", "@hallederiz/domain", "@hallederiz/sdk", "@hallederiz/types"]
};

export default nextConfig;
