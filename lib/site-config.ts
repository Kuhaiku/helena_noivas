export const siteConfig = {
  nomeLoja: process.env.NEXT_PUBLIC_STORE_NAME || "Nossa Loja",
  nomeCurto: process.env.NEXT_PUBLIC_STORE_SHORT_NAME || "LOJA",
  telefone: process.env.NEXT_PUBLIC_STORE_PHONE_DISPLAY || "(00) 00000-0000",
  whatsappMsg: `Olá, ${process.env.NEXT_PUBLIC_STORE_NAME || "equipe"}! Gostaria de saber mais sobre o vestido...`,
  endereco: process.env.NEXT_PUBLIC_STORE_ADDRESS || "Endereço não informado",
  instagram: process.env.NEXT_PUBLIC_STORE_INSTAGRAM || "@instagram",
  corPrimaria: process.env.NEXT_PUBLIC_STORE_PRIMARY_COLOR || "#db2777", // Rosa pink padrão
}