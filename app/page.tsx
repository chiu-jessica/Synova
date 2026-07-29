import Link from "next/link";
import { Atom, Upload, Brain, Users, ScanEye, ShieldCheck } from "lucide-react";

const features = [
  { icon: Brain, title: "Subtype classification", desc: "AI-assisted prediction of high-grade glioma subtype from a single MRI sequence." },
  { icon: ScanEye, title: "Grad-CAM interpretability", desc: "See which regions of the scan the model focused on for each prediction." },
  { icon: Users, title: "Similar patient lookup", desc: "Reference comparable past cases alongside the current scan." },
  { icon: Upload, title: "Fast upload flow", desc: "Drag in a scan and get a structured result in seconds." },
  { icon: ShieldCheck, title: "Built for clinical review", desc: "Every AI output is framed as a decision-support estimate, not a diagnosis." },
  { icon: Atom, title: "Interactive MRI viewer", desc: "Pan, zoom, and step through slices directly in the browser." },
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
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Atom className="text-teal" size={22} />
          <span className="font-medium text-lg">Synova</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-2 rounded-lg border border-gray-200">
            Log in
          </Link>
        </div>
      </header>

      <section className="px-8 py-20 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-medium mb-4">
          AI-assisted subtype classification for pediatric brain tumors
        </h1>
        <p className="text-gray-600 mb-8">
          Synova helps pediatric oncology teams review high-grade glioma
          subtype estimates, attention maps, and similar prior cases —
          alongside your own clinical judgment, not in place of it.
        </p>
        <Link href="/register" className="inline-block px-6 py-3 rounded-lg bg-teal text-white text-sm">
          Get started
        </Link>
      </section>

      <section className="px-8 py-16 bg-gray-50">
        <h2 className="text-xl font-medium text-center mb-10">How it works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-8 h-8 rounded-full bg-teal-light text-teal flex items-center justify-center mx-auto mb-3 text-sm font-medium">
                {i + 1}
              </div>
              <p className="font-medium text-sm mb-1">{s.title}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium text-center mb-10">Platform features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-gray-200 rounded-card p-5">
              <Icon className="text-teal mb-3" size={20} />
              <p className="font-medium text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-8 py-8 border-t border-gray-100 text-center text-xs text-gray-400">
        Synova · Demo environment — no real patient data.
      </footer>
    </div>
  );
}
