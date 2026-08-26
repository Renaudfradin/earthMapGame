import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EarthMap Game",
  description:
    "Jeu éducatif interactif : trouve les pays et monuments sur un globe terrestre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
