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
        "/ht/mes-formations",
        "/catalogue",
        "/ht/catalogue",
        "/profil",
        "/ht/profil",
        "/merci",
        "/ht/merci",
        "/connexion",
        "/ht/connexion",
        "/inscription",
        "/ht/inscription",
        "/mot-de-passe-oublie",
        "/ht/mot-de-passe-oublie",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
