import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0f1a]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-32 top-[-10rem] h-[26rem] w-[26rem] rounded-full bg-cyan-600/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-[-6rem] h-[18rem] w-[18rem] rounded-full bg-slate-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[25%] h-[22rem] w-[22rem] rounded-full bg-teal-700/20 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </section>
  );
}
