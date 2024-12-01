import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ModelProvider } from "@/contexts/modelContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "sonner";
const roboto = Roboto({
  weight: ["400", "700"], // You can adjust weights as needed
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Playground",
  description: "Experiment with AI models and prompts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} overflow-hidden h-screen`}>
        <ErrorBoundary>
          <ModelProvider>
            <ClientLayout>{children}</ClientLayout>
          </ModelProvider>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
              border: "1px solid #27272a",
            },
            className: "dark",
          }}
        />
      </body>
    </html>
  );
}
