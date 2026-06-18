/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Las páginas legales leen los .md de legal/ con fs. Incluimos esos archivos en el
  // bundle de sus rutas para que también funcionen en producción (serverless) si se
  // renderizaran en runtime. (Además se prerenderizan como estáticas: ver dynamic.)
  outputFileTracingIncludes: {
    "/terminos": ["./legal/**/*.md"],
    "/privacidad": ["./legal/**/*.md"],
    "/aviso-legal": ["./legal/**/*.md"],
  },
};

export default nextConfig;
