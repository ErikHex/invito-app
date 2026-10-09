import { Allura, Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";

const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script-allura",
});
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-display-fraunces" });
const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-text-work-sans" });

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${allura.variable} ${fraunces.variable} ${workSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
