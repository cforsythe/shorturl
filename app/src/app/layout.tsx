import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "shorturl",
  description: "Personal shortlink manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface min-h-screen text-slate-200 antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1c2333",
              border: "1px solid #2a3147",
              color: "#e2e8f0",
            },
          }}
        />
      </body>
    </html>
  );
}
