import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin — Helena Noivas",
  description: "Painel administrativo Helena Noivas",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
