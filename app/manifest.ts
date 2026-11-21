import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kenstar Limited",
    short_name: "Kenstar",
    description: "Hardware & home showroom on Market Road, Embu.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f6f9",
    theme_color: "#0b2d52",
    icons: [
      { src: "/brand/favicon/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/favicon/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/favicon/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
