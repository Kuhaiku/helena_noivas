import type { Metadata } from "next"

const storeName = process.env.NEXT_PUBLIC_STORE_NAME

export const metadata: Metadata = {
  title: `Admin — ${storeName}`,
  description: `Painel administrativo ${storeName}`,
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}