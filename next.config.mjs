import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Allow Turbopack to use the OS certificate store when fetching Google Fonts
    // (fixes TLS handshake failures that manifest as missing @vercel/turbopack-next font modules).
    turbopackUseSystemTlsCerts: true,
  },
  turbopack: {
    // Explicitly set the project root to avoid lockfile auto-detection warnings.
    root: __dirname,
  },
}

export default nextConfig
