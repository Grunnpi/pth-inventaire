/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  /** permettre affichage image de google drive */
  images: {
      domains: ['drive.google.com','lh3.googleusercontent.com','localhost']
    },

  env: {
    imageForLocal: false, /**  pour load des images avec localhost - true:pour local / false:pour deployed */
  },
}

module.exports = nextConfig
