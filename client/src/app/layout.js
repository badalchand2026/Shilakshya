
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export const metadata = {
  title: {
    default: "Shilakshya Griha Nirman | Building Your Dreams",
    template: "%s | Shilakshya Griha Nirman",
  },

  description:
    "Shilakshya Griha Nirman provides professional construction, architectural design, renovation, and complete building solutions in Nepal.",

  keywords: [
    "Shilakshya Griha Nirman",
    "Construction Company Nepal",
    "House Construction Nepal",
    "Architectural Design",
    "Building Construction",
  ],

  authors: [
    {
      name: "Shilakshya Griha Nirman Pvt. Ltd.",
    },
  ],

  applicationName: "Shilakshya Griha Nirman",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
