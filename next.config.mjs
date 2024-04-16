/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // When rerendering, the rng will be called again.
  // Could probably fix this some better way, but it's getting late and this works
  reactStrictMode: false
};

export default nextConfig;
