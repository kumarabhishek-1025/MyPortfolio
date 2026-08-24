import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ChunkErrorRecovery from '@/components/ChunkErrorRecovery';

export const metadata = {
  title: "Kumar Abhishek — CS Engineer (AI & Robotics)",
  description: "Third-year CS engineer building AI-powered products end-to-end. Dual-LLM interview systems, 1,100+ LeetCode problems solved, 10.0/10.0 core CS CGPA at VIT Chennai.",
  openGraph: {
    title: "Kumar Abhishek — CS Engineer (AI & Robotics)",
    description: "AI-powered products, robotics, and full-stack. VIT Chennai. Multiple hackathon podiums.",
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-background text-foreground">
      <body className="grain min-h-screen bg-background text-foreground antialiased">
        <ChunkErrorRecovery />
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
