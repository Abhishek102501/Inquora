import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KnowledgeGraphBackground } from "@/components/visual/spotlight";
import { GradientText } from "@/components/visual/gradient-text";
import { RevealText, FadeUpText } from "@/components/visual/reveal-text";
import { FadeIn } from "@/components/visual/fade-in";
import { HeroVisual } from "@/components/landing/hero-visual";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { ScrollIndicator } from "@/components/landing/scroll-indicator";
import { WorkspacePreview } from "@/components/landing/workspace-preview";
import { PipelineSection } from "@/components/landing/pipeline-section";
import { WhyInqora } from "@/components/landing/why-inqora";
import { AnswerDemo } from "@/components/landing/answer-demo";
import { KnowledgeNetwork } from "@/components/visual/knowledge-network";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteNavbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <KnowledgeGraphBackground />
          <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col px-4 pt-6 md:px-8 md:pt-10">
            <div className="grid flex-1 grid-cols-1 items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <div>
                <FadeUpText>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-intel/25 bg-intel/8 px-3 py-1 font-mono text-xs uppercase tracking-[0.1em] text-intel">
                    AI document intelligence
                  </span>
                </FadeUpText>

                <h1 className="mt-5 font-serif leading-[0.95] tracking-tight">
                  <RevealText as="span" className="block text-6xl font-bold sm:text-7xl lg:text-[5rem]">
                    INQORA
                  </RevealText>
                  <span className="mt-4 flex flex-col gap-0.5 text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
                    <RevealText as="span" className="block" delay={0.22}>
                      ASK.
                    </RevealText>
                    <RevealText as="span" className="block" delay={0.3}>
                      RETRIEVE.
                    </RevealText>
                    <GradientText as="span" className="block">
                      <RevealText as="span" delay={0.38}>
                        UNDERSTAND.
                      </RevealText>
                    </GradientText>
                  </span>
                </h1>

                <FadeUpText delay={0.55}>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                    Converse with your documents like you&apos;ve already read every page.
                  </p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.08em] text-signal">
                    Grounded answers. Verifiable sources.
                  </p>
                </FadeUpText>

                <FadeUpText delay={0.68}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button
                      size="lg"
                      className="group bg-signal text-signal-foreground shadow-sm hover:bg-signal/90 hover:shadow-md"
                      asChild
                    >
                      <Link href="/dashboard">
                        Get started{" "}
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/documents/upload">
                        <Upload className="size-4" /> Upload a PDF
                      </Link>
                    </Button>
                  </div>
                </FadeUpText>
              </div>

              <HeroVisual />
            </div>

            <ScrollIndicator targetId="product" />
          </div>
        </section>

        {/* PRODUCT FIRST */}
        <section id="product" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <FadeIn className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">The product</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              This is the actual workspace.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not a mockup — the same conversation, document sidebar, and source panel you&apos;ll
              use every day.
            </p>
          </FadeIn>
          <div className="mt-10">
            <WorkspacePreview />
          </div>
        </section>

        <PipelineSection />

        <WhyInqora />

        <AnswerDemo />

        {/* KNOWLEDGE NETWORK */}
        <section className="border-t border-border bg-muted/20 py-20 md:py-28">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
            <FadeIn className="mx-auto max-w-xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Under the hood
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                A semantic knowledge network
              </h2>
              <p className="mt-3 text-muted-foreground">
                Every document is broken into chunks, embedded, and connected — so retrieval finds
                meaning, not just keywords.
              </p>
            </FadeIn>
            <div className="mt-14">
              <KnowledgeNetwork />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <FadeIn>
            <div className="relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-[0.04]" />
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-signal">
                Ready when you are
              </p>
              <h2 className="max-w-2xl font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Your documents, one intelligent workspace.
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                This preview runs entirely on sample documents and conversations — nothing to
                configure.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="group bg-signal text-signal-foreground shadow-sm hover:bg-signal/90 hover:shadow-md"
                  asChild
                >
                  <Link href="/dashboard">
                    Open workspace{" "}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/documents/upload">
                    <Upload className="size-4" /> Upload a document
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>&copy; 2026 Inqora. Frontend preview — no data leaves your browser.</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/documents" className="hover:text-foreground">Documents</Link>
            <Link href="/settings" className="hover:text-foreground">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
