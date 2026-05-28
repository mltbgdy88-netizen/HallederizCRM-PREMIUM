import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const createNextConfig = (phase) => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    // Keep production build artifacts under .runtime-next while isolating dev cache
    // to avoid Windows file-lock contention between build/dev traces.
    distDir: isDevServer ? ".runtime-next-dev" : ".runtime-next",
    transpilePackages: ["@hallederiz/ui", "@hallederiz/domain", "@hallederiz/sdk", "@hallederiz/types"]
  };
};

export default createNextConfig;
