/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enable for better Fast Refresh
  experimental: {
    appDir: true,
    // Removed unsupported options for current Next.js version
    // optimizeCss: true, // Not supported in this version
    // optimizePackageImports: ['@heroicons/react', 'framer-motion', 'lodash'], // Not supported in this version
    // typedRoutes: true, // Not supported by Turbopack yet
  },
  // Fast Refresh configuration
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  // Webpack optimizations for Fast Refresh (only when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Only apply webpack optimizations when not using Turbopack
    if (dev && !isServer && !process.env.TURBOPACK) {
      // Optimize for Fast Refresh
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Enable source maps for better debugging
      config.devtool = 'eval-source-map';
    }
    
    // Performance optimizations for production
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Development server optimizations
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  images: {
    remotePatterns: [
      // Supabase Storage (allow any project ref)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.luxstay.com",
        port: "",
        pathname: "/**",
      },
      // Supabase storage and other remote image hosts used by listings
      {
        protocol: "https",
        hostname: "vlqkecqwfvkymszkqooo.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tndecor.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "d1hy6t2xeg0mdl.cloudfront.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bandon.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kientructrangkim.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.livspace-cdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "younghousehoalac.vercel.app",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.iproperty.com.my",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "spacet-release.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "uifaces.co",
        port: "",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Skip lint and type checks during production builds (speed up CI)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/home-2',
        destination: '/',
        permanent: true,
      },
      {
        source: '/listing-stay-detail',
        destination: '/phong-tro-detail',
        permanent: false,
      },
      {
        source: '/post',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/post/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
