import { Hero } from "@/components/Hero";
import { AboutAuraFit } from "@/components/AboutAuraFit";
import { Features } from "@/components/Features";
import { Pricing } from "@/components/Pricing";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AboutAuraFit />
      <Features />
      <Pricing />
      <CTA />
    </div>
  );
};

export default Index;