// Development configuration for Fast Refresh optimizations
module.exports = {
  // Fast Refresh settings
  fastRefresh: true,
  
  // Development server optimizations
  devServer: {
    port: 3000,
    host: 'localhost',
    hot: true,
    liveReload: true,
    // Enable polling for better file watching
    watchOptions: {
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /node_modules/,
    },
  },
  
  // Webpack optimizations for development
  webpack: {
    // Enable source maps for better debugging
    devtool: 'eval-source-map',
    // Optimize module resolution
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src'),
      },
    },
  },
  
  // TypeScript optimizations
  typescript: {
    // Enable incremental compilation
    incremental: true,
    // Skip type checking during development for faster builds
    skipLibCheck: true,
  },
};
