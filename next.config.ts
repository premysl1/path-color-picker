import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  basePath: process.env.GITHUB_ACTIONS ? '/path-color-picker' : '',
  images: { unoptimized: true },
  reactCompiler: true,
};

export default nextConfig;
