/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", 
  eslint: {
    // Ignora avisos do ESLint durante o deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora avisos do TypeScript durante o deploy
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "anjodanoiva.com.br" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;