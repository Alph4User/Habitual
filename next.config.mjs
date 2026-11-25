/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the app is fully client-side, so it can be served from
  // any static host (Firebase Hosting, Vercel, etc.). Output goes to ./out
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
