import "../styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}