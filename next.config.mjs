/** @type {import('next').NextConfig} */
const nextConfig = {
  // REMOVA A LINHA OUTPUT STANDALONE
  typescript: {
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

export default nextConfig;