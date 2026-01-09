import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header.js";
import ThemeProvider from "@/components/ThemeProvider.js";
import Footer from "@/components/Footer.js";
import { AuthProvider } from "@/context/AuthContext.js";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "StackTrace | Practice DSA, Debug Logic, Master Coding",
  description:
    "StackTrace is a coding platform to practice data structures and algorithms, read structured editorials, run code against real test cases, and improve problem-solving skills with instant feedback.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ]
  }
};

export default function RootLayout({ children }) {

  return (

    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
