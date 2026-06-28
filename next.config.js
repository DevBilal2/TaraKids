/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Enable compression (Brotli/Gzip handled automatically by Next.js/Vercel)
  compress: true,

  // Shopify password-reset emails use /account/reset/... (lowercase). App route lives under /Account/... .
  async rewrites() {
    return [
      {
        source: "/account/reset/:id/:resetToken",
        destination: "/Account/reset/:id/:resetToken",
      },
    ];
  },

  // Note: swcMinify is enabled by default in Next.js 15, no need to specify
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"], // Prioritize AVIF for mobile
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Note: quality is set per Image component, not globally
    // We've set quality={85} in individual Image components for optimization
  },

  // Optimize JavaScript bundles
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
    optimizeCss: true, // Optimize CSS output (requires critters package)
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundles

  // Optimize CSS loading
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Aggressive code splitting and optimization to reduce TBT for mobile
  webpack: (config, { dev, isServer }) => {
    // Output modern JavaScript (ES2020+) to reduce legacy JS
    if (!isServer && !dev) {
      config.output.environment = {
        ...config.output.environment,
        arrowFunction: true,
        bigIntLiteral: true,
        const: true,
        destructuring: true,
        dynamicImport: true,
        forOf: true,
        module: true,
      };
    }
    
    // Exclude Swiper CSS from Tailwind processing to avoid selector errors
    // Swiper CSS is loaded via CDN link tag in Testimonials component
    if (!isServer) {
      // Find the CSS rule and exclude Swiper CSS
      const cssRule = config.module.rules.find(
        (rule) => rule.test && rule.test.toString().includes('css')
      );
      
      if (cssRule && cssRule.oneOf) {
        cssRule.oneOf.forEach((rule) => {
          if (rule.use && Array.isArray(rule.use)) {
            rule.exclude = [
              ...(rule.exclude || []),
              /node_modules[\\/]swiper[\\/].*\.css$/,
            ];
          }
        });
      }
    }
    
    if (!dev && !isServer) {
      // Split chunks more aggressively for mobile - smaller initial bundles
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 10, // Reduced to improve initial load performance
          minSize: 15000, // Smaller chunks for mobile
          maxSize: 244000, // Prevent too large chunks
          cacheGroups: {
            default: false,
            vendors: false,
            // React and React-DOM in separate chunk
            react: {
              name: 'react',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Next.js framework
            nextjs: {
              name: 'nextjs',
              test: /[\\/]node_modules[\\/]next[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            // Swiper in separate chunk (large library) - mobile only loads when needed
            swiper: {
              name: 'swiper',
              test: /[\\/]node_modules[\\/]swiper[\\/]/,
              chunks: 'async', // Only load when needed
              priority: 25,
            },
            // WhatsApp widget in separate chunk - mobile only loads when needed
            whatsapp: {
              name: 'whatsapp',
              test: /[\\/]node_modules[\\/]react-floating-whatsapp[\\/]/,
              chunks: 'async', // Only load when needed
              priority: 25,
            },
            // Lucide icons - split for mobile
            lucide: {
              name: 'lucide',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              chunks: 'async',
              priority: 24,
            },
            // Vendor chunk for other node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
          // Note: Content-Encoding is set automatically by Next.js based on client support
          // Don't set it manually as it causes transformAlgorithm errors
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
