import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/lib/ReduxProvider";
import ThemeProvider from "@/lib/ThemeProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Fullstack Blog",
  description: "Modern Fullstack Blog Uygulaması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-theme="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <main style={{ minHeight: "100vh", paddingTop: "80px" }}>{children}</main>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
