/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      'www.tirangaaerospace.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'idmsbackend-production.up.railway.app',
        pathname: '/api/employees/download/**',
      },
    ],
  },
}

module.exports = nextConfig 