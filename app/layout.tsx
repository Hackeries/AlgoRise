import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = { title: "RealGrind", description: "Real-time competitive programming platform" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
