import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    // Allow access from any device on your local network
    'http://192.168.1.*',
    // Or specify exact IPs if you prefer:
    // 'http://192.168.1.195',
  ],
};

export default nextConfig;
