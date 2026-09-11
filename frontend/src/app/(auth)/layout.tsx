import { BrandLogo } from "@/components/brand/brand-logo";
import { KnowledgeGraphBackground } from "@/components/visual/spotlight";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12">
      <KnowledgeGraphBackground />
      <div className="mb-8">
        <BrandLogo size="lg" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
