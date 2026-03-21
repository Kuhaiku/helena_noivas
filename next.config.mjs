/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Essencial para o Easypanel/Docker
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "anjodanoiva.com.br" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

module.exports = nextConfig;