import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminProvider } from '@/context/AdminContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import AdminMode from '@/components/AdminMode';
import CurrentVendorInfo from '@/components/CurrentVendorInfo';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy CRM",
  description: "CRM System",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 dark:bg-gray-900`}>
        <AdminProvider>
          <DatabaseProvider>
            <CurrentVendorInfo />
            {children}
          </DatabaseProvider>
        </AdminProvider>
      </body>
    </html>
  );
}