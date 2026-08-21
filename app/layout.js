import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: "Kumar Abhishek — CS Engineer (AI & Robotics)",
  description: "Third-year CS engineer building AI-powered products end-to-end. Dual-LLM interview systems, civic-tech geospatial platforms, 1,050+ LeetCode problems solved.",
  openGraph: {
    title: "Kumar Abhishek — CS Engineer (AI & Robotics)",
    description: "AI-powered products, robotics, and full-stack. VIT Chennai. Multiple hackathon podiums.",
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="grain">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
