import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const createNextConfig = (phase) => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    distDir: isDevServer ? ".runtime-next-dev" : ".runtime-next",
    transpilePackages: ["@hallederiz/ui", "@hallederiz/domain", "@hallederiz/sdk", "@hallederiz/types"],
    async headers() {
      const securityHeaders = [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ];
      return [{ source: "/:path*", headers: securityHeaders }];
    }
  };
};

export default createNextConfig;
