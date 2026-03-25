export const siteConfig = {
  // Informações Base
  nomeLoja: process.env.NEXT_PUBLIC_STORE_NAME || "Nossa Loja",
  nomeCurto: process.env.NEXT_PUBLIC_STORE_SHORT_NAME || "LOJA",
  description: process.env.NEXT_PUBLIC_STORE_DESCRIPTION || "Catálogo exclusivo de vestidos de noiva. Escolha online e agende a sua prova presencial.",
  
  // Contato e Localização
  telefone: process.env.NEXT_PUBLIC_STORE_PHONE_DISPLAY || "(00) 00000-0000",
  whatsappMsg: `Olá! Gostaria de saber mais sobre o vestido...`,
  endereco: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Endereço não informado",
  instagram: process.env.NEXT_PUBLIC_STORE_INSTAGRAM || "@instagram",
  
  // Identidade Visual (Cores)
  corPrimaria: process.env.NEXT_PUBLIC_STORE_PRIMARY_COLOR || "#db2777", 
  
  // Assets Visuais (Cloudinary ou Links Externos)
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || "/images/placeholder-logo.png",
  placeholderUrl: process.env.NEXT_PUBLIC_PLACEHOLDER_URL || "/placeholder.jpg",
  heroBgUrl: process.env.NEXT_PUBLIC_HERO_BG_URL || "/images/hero-noiva.jpg",
  faviconUrl: process.env.NEXT_PUBLIC_FAVICON_URL || "/favicon.ico",
}