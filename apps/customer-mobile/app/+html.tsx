import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// expo-router's special root-document file for web static export. Fonts here
// come from the Google Fonts CDN instead of the bundled @expo-google-fonts
// asset files — those live under a path Metro names literally "node_modules"
// (mirroring the pnpm store), which Vercel's static deploy silently drops.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
