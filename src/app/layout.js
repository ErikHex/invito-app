import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-text" });

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${workSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
