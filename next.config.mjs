/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5005',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5005',
        pathname: '/api/uploads/**',
      },
        {
        protocol: 'http',
        hostname: 'localhost',
        port: '4003',
        pathname: '/api/uploads/**',
      },
    ],
  },
};

export default nextConfig;
