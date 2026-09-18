import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "Soulrift Crusher";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { title: APP_NAME },
      { name: "google", content: "notranslate" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "mobile-web-app-capable", content: "yes" },
      {
        name: "description",
        content: "Soulrift Crusher is a free idle dungeon RPG. Tap to strike, hire heroes, harvest souls, craft gear, fight in the arena, and war across servers.",
      },
      { name: "copyright", content: "© 2026 Soulrift Crusher. All rights reserved." },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "Soulrift Crusher" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:title", content: "Soulrift Crusher — Idle dungeon RPG" },
      {
        property: "og:description",
        content: "Free idle dungeon hunt. Hire heroes, crush floors, craft gear, fight in the arena.",
      },
      { property: "og:url", content: "https://www.soulriftcrusher.com/" },
      { property: "og:image", content: "https://www.soulriftcrusher.com/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Soulrift Crusher — Idle dungeon RPG" },
      {
        name: "twitter:description",
        content: "Free idle dungeon hunt. Hire heroes, crush floors, craft gear.",
      },
      { name: "twitter:image", content: "https://www.soulriftcrusher.com/og.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://www.soulriftcrusher.com/" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Outfit:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: () => (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(location.hostname==='soulriftcrusher.com')location.replace('https://www.soulriftcrusher.com'+location.pathname+location.search+location.hash);if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js?v=9',{scope:'/'});window.addEventListener('error',function(e){var m=String(e&&e.message||'');if(m.indexOf('removeChild')<0&&m.indexOf('NotFoundError')<0)return;try{if(sessionStorage.getItem('soulrift.recover')==='1')return;sessionStorage.setItem('soulrift.recover','1');}catch(x){}location.reload();});try{if(sessionStorage.getItem('soulrift.recover')==='1')sessionStorage.removeItem('soulrift.recover');}catch(x){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoGame",
              name: "Soulrift Crusher",
              url: "https://www.soulriftcrusher.com/",
              description:
                "Free idle dungeon RPG. Hire heroes, crush floors, craft gear, fight in the arena, and war across servers.",
              genre: ["Idle", "RPG", "Action"],
              applicationCategory: "GameApplication",
              operatingSystem: "Web, Android, iOS",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />
      </head>
      <body className="notranslate" translate="no">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
