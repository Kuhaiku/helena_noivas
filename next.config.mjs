/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: true, // Adicione isto para ajudar no serviço de arquivos
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Adicione isto para evitar travas de lint no deploy
  },
  images: {
    unoptimized: true, // Tente ativar isso temporariamente para resolver o erro 400 das imagens
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "anjodanoiva.com.br" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;