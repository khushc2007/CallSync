import { Button } from "@/components/ui/button"
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react"
import Link from "next/link"
import Nav from "@/components/nav"

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#5B4B8A] via-[#7B5B8A] to-[#8B6B9A]">
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
          frameBorder="0"
          width="100%"
          height="100%"
          className="h-full w-full"
        />
      </div>

      <Nav />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-8 md:pt-12 pb-24 gap-12">
        <div className="max-w-2xl text-center md:text-left">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-200/90">
            VOICE AI · TRACK 3.3 · HACK'A'WAR GenAI × AWS
          </p>
          <h1 className="mb-4 text-4xl md:text-6xl font-bold leading-tight text-white">
            YOUR RECEPTIONIST.
            <br />
            <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">
              MINUS THE SALARY.
            </span>
          </h1>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-white/80">
            AI voice agent that books, reschedules, and reminds — 24/7, zero missed appointments.
            Patients call, speak naturally, and it is done.
          </p>

          <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/how-it-works">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-wide text-[#7B6BA8] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]">
                SEE HOW IT WORKS
              </Button>
            </Link>
            <Link href="/tech-stack">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-2 border-white bg-transparent px-8 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:border-red-400 hover:bg-white/10 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]">
                VIEW TECH STACK
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto md:mx-0">
            {[
              { val: "$150B", label: "Lost to no-shows yearly" },
              { val: "24/7", label: "Booking availability" },
              { val: "40%", label: "Fewer no-shows with reminders" },
            ].map((s) => (
              <div key={s.val} className="text-center md:text-left">
                <div className="text-xl md:text-2xl font-bold text-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">{s.val}</div>
                <div className="text-xs text-white/60 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-shrink-0 animate-pulse-scale">
          <div className="relative w-48 h-80 md:w-64 md:h-[420px]">
            <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/20 bg-white/5 backdrop-blur-sm shadow-[0_0_80px_rgba(239,68,68,0.4),0_0_160px_rgba(139,91,154,0.3)]" />
            <div className="absolute inset-3 rounded-[2rem] bg-gradient-to-b from-[#3B2B6A]/80 to-[#1a0f3a]/80 flex flex-col items-center justify-center gap-4 p-4">
              <div className="text-white/40 text-xs uppercase tracking-widest">Incoming Call</div>
              <div className="flex items-end gap-1 h-12">
                {[3,6,9,12,9,14,10,7,12,8,5,10,7,4,9].map((h, i) => (
                  <div key={i} className="w-1 bg-red-400 rounded-full opacity-80 animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <div className="text-white text-sm font-bold tracking-wider">CALLSYNC AI</div>
              <div className="text-white/50 text-xs">Voice Agent Active</div>
              <div className="mt-2 w-12 h-12 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                <div className="w-4 h-4 rounded-full bg-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 md:left-16 z-10 flex gap-6">
        <Twitter className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Linkedin className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Facebook className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        <Instagram className="h-5 w-5 cursor-pointer text-white transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
      </div>
    </div>
  )
}
