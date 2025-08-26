/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ fuerza la compilación
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
