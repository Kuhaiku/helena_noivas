"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/helena/header";
import { DressCard } from "@/components/helena/dress-card";
import { CartSidebar } from "@/components/helena/cart-sidebar";
import { OnboardingModal } from "@/components/helena/onboarding-modal";
import { useAdminStore } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import { Calendar, X } from "lucide-react";
import { siteConfig } from "@/lib/site-config"

export default function VitrinePage() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [weddingDate, setWeddingDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const {
    collections,
    setCollections,
    products,
    setProducts,
    categories,
    setCategories,
    orders,
    setOrders,
    storeConfig,
    setStoreConfig,
  } = useAdminStore();

  // ── VARIÁVEIS WHITE LABEL ──
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME || "Nossa Loja";
  const storeCity = process.env.NEXT_PUBLIC_STORE_LOCATION || "Cidade, Estado";
  const instagramHandle =
    process.env.NEXT_PUBLIC_STORE_INSTAGRAM || "@instagram";

  const nameParts = storeName.split(" ");
  const nameFirst = nameParts[0];
  const nameRest = nameParts.slice(1).join(" ");

  useEffect(() => {
    const seen = sessionStorage.getItem("helena-onboarding");
    if (!seen) {
      const timer = setTimeout(() => setOnboardingOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // ── Puxar Banco de Dados ──
  useEffect(() => {
    async function fetchVitrine() {
      try {
        const [resProd, resCat, resCol, resPed, resConf] = await Promise.all([
          fetch("/api/produtos"),
          fetch("/api/categorias"),
          fetch("/api/colecoes"),
          fetch("/api/pedidos"),
          fetch("/api/configuracoes"),
        ]);

        if (resProd.ok) setProducts(await resProd.json());
        if (resCat.ok) setCategories(await resCat.json());
        if (resCol.ok) setCollections(await resCol.json());
        if (resPed.ok) setOrders(await resPed.json());
        if (resConf.ok) setStoreConfig(await resConf.json());
      } catch (error) {
        console.error("Erro ao buscar vitrine:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVitrine();
  }, [setProducts, setCategories, setCollections, setOrders, setStoreConfig]);

  const handleOnboardingChoice = (hasDate: boolean, date?: string) => {
    sessionStorage.setItem("helena-onboarding", "done");
    if (hasDate && date) {
      setWeddingDate(date);
    }
    setOnboardingOpen(false);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    router.push("/checkout");
  };

  // ── LÓGICA INTELIGENTE DE DISPONIBILIDADE (CORRIGIDA) ──
  const unavailableCounts = new Map<string, number>();

  if (weddingDate && storeConfig) {
    const targetTime = new Date(weddingDate + "T12:00:00").getTime();

    orders.forEach((o) => {
      if (o.status !== "confirmado" && o.status !== "em_uso") return;
      if (!o.eventoDate) return;

      const eventTime = new Date(o.eventoDate + "T12:00:00").getTime();
      const diffDays = Math.round(
        (targetTime - eventTime) / (1000 * 60 * 60 * 24),
      );

      const windowBefore =
        storeConfig.windowBefore !== undefined
          ? Number(storeConfig.windowBefore)
          : 3;
      const windowAfter =
        storeConfig.windowAfter !== undefined
          ? Number(storeConfig.windowAfter)
          : 3;
      const isConflict = diffDays >= -windowBefore && diffDays <= windowAfter;

      if (isConflict) {
        o.items.forEach((item: any) => {
          const idStr = item.id.toString();
          const currentCount = unavailableCounts.get(idStr) || 0;
          unavailableCounts.set(idStr, currentCount + 1);
        });
      }
    });
  }

  const visibleDresses = products.filter((d) => {
    if (d.hidden) return false;
    if (d.stock === "manutencao") return false;

    const idStr = d.id.toString();
    const rentedCount = unavailableCounts.get(idStr) || 0;
    const stockQuantity = Number(d.quantity) || 1;

    return rentedCount < stockQuantity;
  });

  const filtered =
    activeCategory === "todos"
      ? visibleDresses
      : visibleDresses.filter((d) => d.category === activeCategory);

  const categoriasDinamicas = [{ slug: "todos", name: "Todos" }, ...categories];

  const activeCollection = collections.find((c) => c.active) ?? null;
  const seasonalProducts = activeCollection
    ? products.filter((p) => {
        const ids = activeCollection.productIds || [];
        const safeArray = Array.isArray(ids)
          ? ids
          : typeof ids === "string"
            ? JSON.parse(ids)
            : [];

        const idStr = p.id.toString();
        const rentedCount = unavailableCounts.get(idStr) || 0;
        const stockQuantity = Number(p.quantity) || 1;
        const hasStock = rentedCount < stockQuantity;

        return (
          Array.isArray(safeArray) &&
          safeArray.includes(p.id) &&
          !p.hidden &&
          p.stock !== "manutencao" &&
          hasStock
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />

      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center min-h-[480px] md:min-h-[560px]">
            <div className="py-16 md:py-20 flex flex-col items-start gap-6 order-2 md:order-1">
              <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary">
                Coleção Exclusiva
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.15] text-balance">
                Encontre o vestido dos seus sonhos
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                Escolha online, experimente pessoalmente. Nossa equipe de
                consultoras estará pronta para a receber.
              </p>
            </div>
            <div className="relative h-72 md:h-full md:min-h-[560px] order-1 md:order-2">
              <Image
                src={siteConfig.heroBgUrl}
                alt={`Coleção ${siteConfig.nomeLoja}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-secondary/20 md:bg-gradient-to-l md:from-transparent md:to-secondary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Destaque Sazonal ── */}
      {activeCollection && seasonalProducts.length > 0 && (
        <section className="w-full bg-secondary/60 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-sans tracking-[0.25em] uppercase text-primary mb-2">
                  Coleção em Destaque
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-[1.15] text-balance">
                  {activeCollection.name}
                </h2>
                {activeCollection.description && (
                  <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-lg">
                    {activeCollection.description}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground shrink-0">
                {seasonalProducts.length} peça
                {seasonalProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-none">
              {seasonalProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[240px] sm:w-[280px]"
                >
                  <DressCard dress={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Divisor ── */}
      <div className="flex items-center justify-center py-10">
        <div className="h-px w-16 bg-border" />
        <p className="mx-4 text-xs font-sans tracking-[0.3em] uppercase text-muted-foreground">
          Catálogo Completo
        </p>
        <div className="h-px w-16 bg-border" />
      </div>

      {/* ── Filtros (Botão de Data e Categorias) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-3 rounded-2xl border border-border shadow-sm">
          <button
            onClick={() => setOnboardingOpen(true)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-sans font-semibold tracking-wide transition-all duration-200 border shrink-0",
              weddingDate
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
            )}
          >
            <Calendar size={15} />
            {weddingDate
              ? `Casamento em: ${new Date(weddingDate + "T12:00:00").toLocaleDateString("pt-BR")}`
              : "Data do Casamento"}
          </button>

          <div className="hidden md:block w-px h-6 bg-border mx-2" />

          <div className="flex items-center gap-2 flex-wrap">
            {categoriasDinamicas.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-sans font-semibold tracking-wide transition-all duration-200 border",
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {weddingDate && (
          <div className="mt-4 flex items-center justify-between gap-4 text-xs font-medium text-primary bg-primary/10 px-5 py-3 rounded-xl border border-primary/20 w-full max-w-fit">
            <span className="leading-relaxed">
              Exibindo apenas peças disponíveis para o seu casamento no dia{" "}
              <strong>
                {new Date(weddingDate + "T12:00:00").toLocaleDateString(
                  "pt-BR",
                )}
              </strong>
              .
            </span>
            <button
              onClick={() => setWeddingDate(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-muted-foreground hover:text-red-600 shadow-sm border border-border transition-colors shrink-0"
            >
              <X size={14} /> Limpar
            </button>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="flex justify-center py-20 text-muted-foreground text-sm">
            A carregar o catálogo exclusivo...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((dress) => (
              <DressCard key={dress.id} dress={dress} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p className="font-serif text-xl text-foreground">
              {weddingDate
                ? "Nenhum vestido disponível para esta data"
                : "Nenhuma peça nesta categoria"}
            </p>
            <p className="text-sm text-muted-foreground">
              {weddingDate
                ? "Tente alterar a data do seu casamento ou limpar o filtro."
                : "Em breve novidades nesta linha."}
            </p>
            <button
              onClick={() => {
                setActiveCategory("todos");
                setWeddingDate(null);
              }}
              className="text-xs text-primary underline underline-offset-4 mt-2"
            >
              Ver todas as peças
            </button>
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer
        id="contato"
        className="border-t border-border bg-secondary/30 py-10 px-4"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-lg tracking-widest text-foreground uppercase">
            {nameFirst}
            <span className="text-primary font-light ml-1">{nameRest}</span>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed text-center md:text-right">
            {storeCity} &nbsp;·&nbsp; {instagramHandle}
          </p>
        </div>
      </footer>

      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <OnboardingModal
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onChoice={handleOnboardingChoice}
      />
    </div>
  );
}
