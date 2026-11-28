import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/mes-formations",
        "/profil",
        "/merci",
        "/connexion",
        "/inscription",
        "/mot-de-passe-oublie",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
