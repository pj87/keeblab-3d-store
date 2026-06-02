import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeebLab | 3D Keyboard Store",
  description: "3D mechanical keyboard store with configurable boards, cart, checkout simulation, and admin catalog controls.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
