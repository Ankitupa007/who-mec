  import { Geist, Geist_Mono } from "next/font/google";
  import "./globals.css";
import Script from "next/script";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata = {
    title: "WHO Medical Eligibility Criteria Wheel",
    description: "Interactive WHO Medical Eligibility Criteria Wheel - Rotate and explore contraceptive guidance",
  };

  export default function RootLayout({ children }) {
    const GA_TRACKING_ID = process.env.GA_TRACKING_ID;
    return (
      <html lang="en">
        <head>
          <title>WHO Medical Eligibility Criteria Wheel</title>
          
          {/* <!-- Google tag (gtag.js) --> */}
          <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
        as="script"
        rel="preload"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>

        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    );
  }
