// @ts-check
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  
webpack: (config, { isServer }) => {
    if (!isServer) {
        config.resolve.fallback = {
            net: false,
            tls: false,
            fs: false,
        };
    }
    return config;
},
}
 
module.exports = nextConfig
