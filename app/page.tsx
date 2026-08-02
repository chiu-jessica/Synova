import Link from "next/link";
import Image from "next/image";
import { Atom, Upload, Brain, Users, ScanEye, ShieldCheck } from "lucide-react";
import Logo from "@/components/Logo";

// Icon tints cycle through the four brand colours so the grid reads as one
// set rather than six identical tiles.
const features = [
  { icon: Brain, title: "Subtype classification", desc: "AI-assisted prediction of high-grade glioma subtype from a single MRI sequence.", tint: "bg-teal-light text-teal-deep" },
  { icon: ScanEye, title: "Grad-CAM interpretability", desc: "See which regions of the scan the model focused on for each prediction.", tint: "bg-orange-light text-orange-deep" },
  { icon: Users, title: "Similar patient lookup", desc: "Reference comparable past cases alongside the current scan.", tint: "bg-pink-light text-pink-deep" },
  { icon: Upload, title: "Fast upload flow", desc: "Drag in a scan and get a structured result in seconds.", tint: "bg-yellow-light text-yellow-deep" },
  { icon: ShieldCheck, title: "Built for clinical review", desc: "Every AI output is framed as a decision-support estimate, not a diagnosis.", tint: "bg-teal-light text-teal-deep" },
  { icon: Atom, title: "Interactive MRI viewer", desc: "Pan, zoom, and step through slices directly in the browser.", tint: "bg-orange-light text-orange-deep" },
];

const stepTint = [
  // Lightened from full strength, which was much heavier than the pink and
  // yellow badges beside it.
  "bg-orange/65 text-ink",
  "bg-pink text-ink",
  "bg-yellow text-ink",
  "bg-teal-dark text-white",
];

const steps = [
  { title: "Upload scan", desc: "Add a patient's MRI directly from your workstation." },
  { title: "AI analysis", desc: "The model returns a subtype estimate and attention map." },
  { title: "Review with judgment", desc: "Confirm findings against your own clinical review." },
  { title: "Compare cases", desc: "Check similar past patients for added context." },
];

export default function LandingPage() {
  return (
    <div>
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b-2 border-teal-light">
        <Logo size={30} showName />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-pill border-2 border-teal text-teal-deep font-medium hover:bg-teal-light"
          >
            Log in
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden h-[420px] sm:h-[460px] lg:h-[520px]">
        {/* Fixed-height band, so the 16:9 frame is cropped top and bottom
            rather than forcing a hero as tall as 56% of the window width.
            The blur keeps the photo reading as a backdrop behind the copy;
            scale-110 stops it from softening the edges into the page.
            Decorative, no alt text. */}
        <Image
          src="/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center blur-[3px] scale-110"
        />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          {/* The photo has dark patches (palms, headland) that text cannot sit
              on directly, so the copy rides on a translucent panel instead of
              washing out the whole image with a scrim. */}
          <div className="max-w-2xl mx-auto text-center rounded-card bg-white/[0.85] backdrop-blur-[2px] px-8 py-10 shadow-[0_8px_30px_rgba(28,28,28,0.10)]">
            <h1 className="text-4xl sm:text-5xl font-medium mb-4 tracking-tight">
              Faster Insights.{" "}
              <span className="text-teal-deep">Brighter Futures.</span>
            </h1>
            <p className="text-gray-700 mb-8">
              SYNOVA bridges the gap in pediatric neuro-oncology by providing
              AI-assisted brain tumor classification designed specifically for
              children.
            </p>
            <Link
              href="/register"
              className="inline-block px-7 py-3.5 rounded-pill bg-teal-dark text-white text-sm font-medium shadow-[0_4px_0_#046B6B] hover:translate-y-0.5 hover:shadow-[0_2px_0_#046B6B] transition-all"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      <section className="px-8 py-16 bg-white">
        <h2 className="text-xl font-medium text-center mb-10">How it works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-3 text-base font-medium ${stepTint[i]}`}
              >
                {i + 1}
              </div>
              <p className="font-medium text-sm mb-1">{s.title}</p>
              <p className="text-xs text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium text-center mb-10">Platform features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, tint }) => (
            <div
              key={title}
              className="bg-white rounded-card p-5 shadow-[0_1px_2px_rgba(28,28,28,0.06)] hover:-translate-y-0.5 transition-transform"
            >
              <div
                className={`w-10 h-10 rounded-pill flex items-center justify-center mb-3 ${tint}`}
              >
                <Icon size={20} />
              </div>
              <p className="font-medium text-sm mb-1">{title}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-8 py-8 bg-teal-light text-center text-xs text-teal-deep">
        SYNOVA · Demo environment — no real patient data.
      </footer>
    </div>
  );
}
