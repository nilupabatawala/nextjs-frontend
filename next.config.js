/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',	
  reactStrictMode: true,
  // experimental: { appDir: true },
  images: { domains: ["localhost", "towingminneapolis.us"] },
  swcMinify: true,
  productionBrowserSourceMaps: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

module.exports = nextConfig;
