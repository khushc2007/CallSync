import Link from "next/link"
import Nav from "@/components/nav"

const stack = [
  { name: "Amazon Connect", tag: "Telephony", desc: "Handles all inbound and outbound phone calls. Provides the phone number callers dial.", why: "AWS-native PSTN — no third-party telephony needed.", color: "from-orange-500/20 to-red-500/20" },
  { name: "Amazon Lex", tag: "NLU", desc: "Natural language understanding. Identifies intent — book, reschedule, cancel — and extracts date, time, and service.", why: "Built-in slot filling removes 80% of conversation logic.", color: "from-blue-500/20 to-purple-500/20" },
  { name: "Amazon Bedrock", tag: "LLM", desc: "Claude model handles complex conversation turns that fall outside Lex's structured intents.", why: "Fallback intelligence for edge cases and free-form speech.", color: "from-purple-500/20 to-pink-500/20" },
  { name: "Amazon Polly", tag: "Text-to-Speech", desc: "Converts text responses to natural-sounding voice. Used for all spoken confirmations and reminders.", why: "Neural voices sound human — critical for caller trust.", color: "from-green-500/20 to-teal-500/20" },
  { name: "AWS Lambda", tag: "Compute", desc: "Serverless functions handling booking logic, calendar checks, and the outbound reminder scheduler.", why: "Scales to zero. No idle costs during off-hours.", color: "from-yellow-500/20 to-orange-500/20" },
  { name: "DynamoDB", tag: "Database", desc: "Stores all appointments. Queried by reminder Lambda to find upcoming appointments needing outbound calls.", why: "Sub-millisecond reads. Scales infinitely.", color: "from-blue-500/20 to-cyan-500/20" },
  { name: "EventBridge", tag: "Scheduler", desc: "Cron trigger that fires reminder Lambda every hour to check for upcoming appointments.", why: "Serverless cron — no EC2 or always-on process needed.", color: "from-red-500/20 to-pink-500/20" },
  { name: "Google Calendar API", tag: "Calendar", desc: "Source of truth for availability. Prevents double-booking. Stores confirmed appointments.", why: "Most clinics already use Google Calendar — zero migration.", color: "from-green-500/20 to-emerald-500/20" },
  { name: "React + Vite", tag: "Frontend", desc: "Dashboard for clinic staff to view all appointments, call logs, and reminder status in real-time.", why: "Fast dev, instant HMR, Vercel-deployable in minutes.", color: "from-cyan-500/20 to-blue-500/20" },
]

const archNodes = [
  { id: "caller", label: "CALLER", x: 10, y: 42, color: "border-white/30 text-white" },
  { id: "connect", label: "Amazon\nConnect", x: 28, y: 42, color: "border-orange-400/60 text-orange-300" },
  { id: "lex", label: "Amazon\nLex", x: 46, y: 42, color: "border-blue-400/60 text-blue-300" },
  { id: "lambda", label: "AWS\nLambda", x: 64, y: 42, color: "border-yellow-400/60 text-yellow-300" },
  { id: "dynamo", label: "DynamoDB", x: 82, y: 24, color: "border-blue-400/60 text-blue-300" },
  { id: "gcal", label: "Google\nCalendar", x: 82, y: 60, color: "border-green-400/60 text-green-300" },
  { id: "bedrock", label: "Amazon\nBedrock", x: 46, y: 72, color: "border-purple-400/60 text-purple-300" },
  { id: "polly", label: "Amazon\nPolly", x: 64, y: 72, color: "border-green-400/60 text-green-300" },
  { id: "eventbridge", label: "EventBridge\n(cron)", x: 28, y: 86, color: "border-red-400/60 text-red-300" },
]

export default function TechStack() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#5B4B8A] via-[#7B5B8A] to-[#8B6B9A]">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Nav />

        <div className="px-6 md:px-16 py-12 max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-red-300 text-sm uppercase tracking-widest mb-3">AWS-Native Stack</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">TECH STACK</h1>
            <p className="text-white/60 text-base max-w-xl mx-auto">Every service chosen deliberately. No bloat.</p>
          </div>

          {/* Architecture diagram */}
          <div className="mb-20">
            <h2 className="text-xl font-bold text-white text-center mb-8 tracking-wide">SYSTEM ARCHITECTURE</h2>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-10 overflow-x-auto">

              {/* Main flow - responsive */}
              <div className="min-w-[600px]">
                {/* Row 1: main call flow */}
                <div className="flex items-center justify-between mb-8">
                  {[
                    { label: "CALLER", color: "border-white/40 text-white bg-white/5" },
                    { label: "Amazon\nConnect", color: "border-orange-400/60 text-orange-300 bg-orange-500/10" },
                    { label: "Amazon\nLex", color: "border-blue-400/60 text-blue-300 bg-blue-500/10" },
                    { label: "AWS\nLambda", color: "border-yellow-400/60 text-yellow-300 bg-yellow-500/10" },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`flex-1 rounded-xl border px-3 py-3 text-center text-xs font-bold whitespace-pre-line leading-tight ${node.color} hover:scale-105 transition-all duration-300`}>
                        {node.label}
                      </div>
                      {i < 3 && <div className="text-red-400/70 font-bold text-base flex-shrink-0">→</div>}
                    </div>
                  ))}
                </div>

                {/* Branching from Lambda */}
                <div className="flex justify-end mb-6 pr-0">
                  <div className="w-1/2 flex justify-around">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-red-400/60 text-sm">↑</div>
                      <div className="rounded-xl border border-blue-400/60 bg-blue-500/10 px-3 py-3 text-center text-xs font-bold text-blue-300 leading-tight hover:scale-105 transition-all duration-300">
                        DynamoDB
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-red-400/60 text-sm">↓</div>
                      <div className="rounded-xl border border-green-400/60 bg-green-500/10 px-3 py-3 text-center text-xs font-bold text-green-300 leading-tight hover:scale-105 transition-all duration-300">
                        Google\nCalendar
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: AI + voice response */}
                <div className="flex items-center justify-end gap-3 mb-8">
                  <div className="rounded-xl border border-purple-400/60 bg-purple-500/10 px-3 py-3 text-center text-xs font-bold text-purple-300 leading-tight hover:scale-105 transition-all duration-300">
                    Amazon<br/>Bedrock
                  </div>
                  <div className="text-red-400/60 font-bold">→</div>
                  <div className="rounded-xl border border-green-400/60 bg-green-500/10 px-3 py-3 text-center text-xs font-bold text-green-300 leading-tight hover:scale-105 transition-all duration-300">
                    Amazon<br/>Polly
                  </div>
                  <div className="text-red-400/60 font-bold">→</div>
                  <div className="rounded-xl border border-white/40 bg-white/5 px-3 py-3 text-center text-xs font-bold text-white leading-tight hover:scale-105 transition-all duration-300">
                    CALLER<br/>(response)
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10 mb-6" />

                {/* Reminder loop */}
                <div className="flex items-center gap-3 justify-center">
                  <div className="text-white/40 text-xs uppercase tracking-widest">Reminder Loop:</div>
                  {[
                    { label: "EventBridge\n(cron)", color: "border-red-400/60 text-red-300 bg-red-500/10" },
                    { label: "AWS\nLambda", color: "border-yellow-400/60 text-yellow-300 bg-yellow-500/10" },
                    { label: "Amazon\nConnect", color: "border-orange-400/60 text-orange-300 bg-orange-500/10" },
                    { label: "CALLER\n(reminder)", color: "border-white/40 text-white bg-white/5" },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`rounded-xl border px-3 py-2 text-center text-xs font-bold whitespace-pre-line leading-tight ${node.color} hover:scale-105 transition-all duration-300`}>
                        {node.label}
                      </div>
                      {i < 3 && <div className="text-red-400/60 font-bold">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stack cards */}
          <div className="mb-20">
            <h2 className="text-xl font-bold text-white text-center mb-10 tracking-wide">SERVICE BREAKDOWN</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stack.map((s) => (
                <div
                  key={s.name}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-red-400/40 hover:shadow-[0_0_25px_rgba(239,68,68,0.12)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`inline-block px-2.5 py-1 rounded-lg bg-gradient-to-r ${s.color} border border-white/10 text-white/70 text-xs font-bold tracking-wide mb-3`}>
                    {s.tag}
                  </div>
                  <div className="text-white font-bold text-sm mb-2">{s.name}</div>
                  <div className="text-white/50 text-xs leading-relaxed mb-3">{s.desc}</div>
                  <div className="border-t border-white/10 pt-3">
                    <span className="text-red-300/70 text-xs">Why: </span>
                    <span className="text-white/40 text-xs">{s.why}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Differentiator */}
          <div className="mb-20">
            <div className="relative bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-400/30 rounded-2xl p-8 md:p-10 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-purple-500/5" />
              <div className="relative z-10">
                <div className="text-red-300 text-sm uppercase tracking-widest mb-3">The Feature Others Miss</div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  We don&apos;t just book.
                  <br />
                  <span className="text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">We follow up.</span>
                </h2>
                <p className="text-white/60 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
                  Most teams will build inbound booking only. CallSync AI adds proactive outbound reminder calls —
                  the system calls the customer, they do not have to do anything.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
                  {[
                    { val: "30–40%", label: "Reduction in no-shows" },
                    { val: "24hr", label: "Before appointment" },
                    { val: "100%", label: "Automated, zero staff" },
                  ].map((s) => (
                    <div key={s.val} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-red-300 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)] mb-1">{s.val}</div>
                      <div className="text-white/50 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-wide">THE TEAM</h2>
            <p className="text-white/50 text-sm text-center mb-10">Built for HACK&apos;A&apos;WAR GenAI × AWS · RIT Bengaluru</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: "Satvik", role: "Team Lead", emoji: "⚡" },
                { name: "Shriya", role: "AI & Backend", emoji: "🧠" },
                { name: "Rajat", role: "Hardware & Infra", emoji: "🔧" },
                { name: "Khush", role: "Frontend & Voice", emoji: "🎙️" },
              ].map((m) => (
                <div
                  key={m.name}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-red-400/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl mx-auto mb-4 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300">
                    {m.emoji}
                  </div>
                  <div className="text-white font-bold text-sm tracking-wide mb-1">{m.name}</div>
                  <div className="text-white/40 text-xs">{m.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/">
              <button className="px-8 py-3 rounded-full border-2 border-white/20 text-white text-sm font-bold tracking-wide hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300">
                ← BACK TO HOME
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
