import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";
import { MenuProvider } from "./context/MenuContext";
import { TablesProvider } from "./context/TablesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Restoran - Moderan sistem naručivanja",
  description: "Sistem za naručivanje hrane putem QR koda u restoranima",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <MenuProvider>
            <TablesProvider>
              <OrderProvider>
                {children}
              </OrderProvider>
            </TablesProvider>
          </MenuProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
