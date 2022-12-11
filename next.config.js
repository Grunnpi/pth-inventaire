/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  /** permettre affichage image de google drive */
  images: {
      domains: ['drive.google.com','lh3.googleusercontent.com']
    }
}

module.exports = nextConfig
