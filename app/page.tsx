"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

type SimStep =
  | { type: "bot"; text: string }
  | { type: "choices"; options: { label: string; next: string }[] }
  | { type: "input"; placeholder: string; next: string }
  | { type: "end" }

const sim: Record<string, SimStep[]> = {
  start: [
    { type: "bot", text: "Hello, this is CallSync AI. Would you like to book, reschedule, or cancel an appointment?" },
    { type: "choices", options: [{ label: "Book", next: "book1" }, { label: "Reschedule", next: "reschedule" }, { label: "Cancel", next: "cancel" }] },
  ],
  book1: [
    { type: "bot", text: "I can help you with that. What date works best for you?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "book2" }, { label: "This Week", next: "book2" }, { label: "Next Week", next: "book2" }] },
  ],
  book2: [
    { type: "bot", text: "I have two slots open — 2:00 PM and 4:00 PM. Which works better?" },
    { type: "choices", options: [{ label: "2:00 PM", next: "book3" }, { label: "4:00 PM", next: "book3" }] },
  ],
  book3: [
    { type: "bot", text: "Could I take your full name to confirm the booking?" },
    { type: "input", placeholder: "Your name...", next: "book4" },
  ],
  book4: [
    { type: "bot", text: "Done — your appointment is confirmed. You'll receive an automated reminder call 24 hours in advance." },
    { type: "end" },
  ],
  reschedule: [
    { type: "bot", text: "I have your existing appointment on file. What date would you prefer to move it to?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "reschedule2" }, { label: "Next Week", next: "reschedule2" }] },
  ],
  reschedule2: [
    { type: "bot", text: "Your appointment has been rescheduled. A confirmation and updated reminder will follow automatically." },
    { type: "end" },
  ],
  cancel: [
    { type: "bot", text: "I can see your upcoming appointment. Do you want to proceed with the cancellation?" },
    { type: "choices", options: [{ label: "Yes, cancel it", next: "cancel2" }, { label: "Keep it", next: "start" }] },
  ],
  cancel2: [
    { type: "bot", text: "Cancellation confirmed. The slot has been freed up. We hope to hear from you again soon." },
    { type: "end" },
  ],
}

type Message = { from: "bot" | "user"; text: string }

const sections = ["Overview", "How It Works", "Architecture", "Team"]

const callSteps = [
  { icon: "📞", title: "Caller Dials In", desc: "The patient calls your clinic's dedicated number — no app, no web form. Just a phone call, the way it's always worked. CallSync answers instantly, around the clock." },
  { icon: "🎙️", title: "Speech Understood", desc: "Amazon Lex, backed by Amazon Bedrock, parses natural speech in real time. Whether the caller says 'Tuesday morning' or 'sometime next week', the intent is captured accurately." },
  { icon: "📋", title: "Details Collected", desc: "The AI guides the caller through a structured conversation, collecting date, time, service type, full name, and contact number. Each detail is confirmed before proceeding." },
  { icon: "📅", title: "Availability Verified", desc: "AWS Lambda queries Google Calendar live to check slot availability. Conflicts are detected and alternatives offered on the spot. Double-bookings are structurally impossible." },
  { icon: "✅", title: "Appointment Locked", desc: "The booking is written simultaneously to DynamoDB and Google Calendar. The caller hears a clear voice confirmation via Amazon Polly, with every detail read back." },
  { icon: "🔔", title: "Reminder Dispatched", desc: "EventBridge triggers a Lambda every hour, scanning for appointments within the next 24-hour window. Each one receives an automated outbound reminder call — no staff action required." },
]

const stack = [
  { name: "Amazon Connect", tag: "Telephony", desc: "Handles all inbound and outbound PSTN calls. Provides the dedicated phone number, routes calls, and connects callers to the Lex NLU engine.", why: "AWS-native telephony — no third-party dependencies.", color: "from-orange-500/20 to-red-500/20", border: "border-orange-400/40", text: "text-orange-300" },
  { name: "Amazon Lex", tag: "NLU Engine", desc: "Classifies intent and extracts structured slot values — date, time, service type, name, and contact number — from free-form speech.", why: "Built-in slot filling eliminates 80% of custom conversation logic.", color: "from-blue-500/20 to-purple-500/20", border: "border-blue-400/40", text: "text-blue-300" },
  { name: "Amazon Bedrock", tag: "LLM Fallback", desc: "Handles edge cases outside Lex's intent framework — ambiguous requests, multi-intent utterances, and complex rescheduling that requires genuine reasoning.", why: "Safety net for calls with unusual or compound requests.", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-400/40", text: "text-purple-300" },
  { name: "Amazon Polly", tag: "Voice Synthesis", desc: "Converts all system responses into natural-sounding speech. Used for booking confirmations, prompts, error handling, and all outbound reminder scripts.", why: "Neural TTS voices are indistinguishable from human speech — critical for caller trust.", color: "from-green-500/20 to-teal-500/20", border: "border-green-400/40", text: "text-green-300" },
  { name: "AWS Lambda", tag: "Business Logic", desc: "Stateless functions handle calendar checks, booking writes, conflict detection, DynamoDB operations, and the outbound reminder scheduling loop.", why: "Scales to zero between calls. Zero idle infrastructure cost.", color: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-400/40", text: "text-yellow-300" },
  { name: "DynamoDB", tag: "Database", desc: "Stores the full appointment record: caller name, phone number, date, time, service type, booking status, and reminder delivery state.", why: "Sub-millisecond read latency with no operational overhead.", color: "from-blue-500/20 to-cyan-500/20", border: "border-cyan-400/40", text: "text-cyan-300" },
  { name: "EventBridge", tag: "Scheduler", desc: "Serverless cron trigger that fires the reminder Lambda every hour. Scans DynamoDB for upcoming appointments that haven't yet received a reminder.", why: "Fully managed scheduling — no EC2, no always-on process.", color: "from-red-500/20 to-pink-500/20", border: "border-red-400/40", text: "text-red-300" },
  { name: "Google Calendar API", tag: "Availability Layer", desc: "Authoritative source of truth for slot availability. All bookings write directly to Google Calendar, making CallSync compatible with any Google Workspace setup.", why: "Prevents double-bookings at the infrastructure level.", color: "from-green-500/20 to-emerald-500/20", border: "border-green-400/40", text: "text-green-300" },
  { name: "React + Vite", tag: "Staff Dashboard", desc: "Real-time interface for clinic staff — upcoming appointments, live call logs, reminder delivery status, and cancellation history.", why: "Instant HMR in development, one-command Vercel deployment.", color: "from-cyan-500/20 to-blue-500/20", border: "border-blue-400/40", text: "text-blue-300" },
]

const team = [
  { name: "Satvik", role: "Team Lead", detail: "Product vision, system architecture, and technical direction", emoji: "⚡" },
  { name: "Shriya", role: "AI & Backend", detail: "Amazon Lex intent design, Bedrock integration, Lambda logic", emoji: "🧠" },
  { name: "Rajat", role: "Infrastructure", detail: "AWS Connect, DynamoDB schema, EventBridge, and IAM", emoji: "🔧" },
  { name: "Khush", role: "Frontend & Voice", detail: "React dashboard, Polly voice tuning, end-to-end demo", emoji: "🎙️" },
]

export default function Home() {
  const [active, setActive] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [simKey, setSimKey] = useState("start")
  const [inputVal, setInputVal] = useState("")
  const [started, setStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [dotAnim, setDotAnim] = useState(-1)

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(i)
            setDotAnim(i)
            setTimeout(() => setDotAnim(-1), 600)
          }
        },
        { threshold: 0.4 }
      )
      obs.observe(ref)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function scrollTo(i: number) {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" })
  }

  function startSim() {
    setStarted(true)
    setSimKey("start")
    const firstBot = sim["start"][0] as { type: "bot"; text: string }
    setMessages([{ from: "bot", text: firstBot.text }])
  }

  function handleChoice(label: string, next: string) {
    const newMsgs: Message[] = [...messages, { from: "user", text: label }]
    const nextSteps = sim[next]
    if (nextSteps?.[0]) newMsgs.push({ from: "bot", text: (nextSteps[0] as { type: "bot"; text: string }).text })
    setMessages(newMsgs)
    setSimKey(next)
  }

  function handleInput(next: string) {
    if (!inputVal.trim()) return
    const newMsgs: Message[] = [...messages, { from: "user", text: inputVal }]
    const nextSteps = sim[next]
    if (nextSteps?.[0]) newMsgs.push({ from: "bot", text: (nextSteps[0] as { type: "bot"; text: string }).text })
    setMessages(newMsgs)
    setSimKey(next)
    setInputVal("")
  }

  const currentSteps = sim[simKey] || []
  const actionStep = currentSteps[1] as SimStep | undefined

  return (
    <div className="relative">

      {/* ── Side nav — desktop only, right edge ── */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-[18px]">
        {sections.map((s, i) => (
          <button
            key={s}
            onClick={() => scrollTo(i)}
            className="group relative flex items-center justify-end gap-2 focus:outline-none"
          >
            <span className="absolute right-8 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-white/10">
              {s}
            </span>
            <div
              className="rounded-full transition-all duration-500"
              style={{
                width: active === i ? "12px" : "7px",
                height: active === i ? "12px" : "7px",
                background: active === i ? "rgb(252,165,165)" : "rgba(255,255,255,0.2)",
                boxShadow: active === i ? "0 0 14px 3px rgba(239,68,68,0.85)" : "none",
                animation: dotAnim === i ? "navDotPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
              }}
            />
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[0] = el }}
        className="relative min-h-screen overflow-hidden bg-[#0b0717]"
      >
        {/* Spline background */}
        <div className="absolute inset-0 z-0">
          <iframe
            src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="h-full w-full"
          />
        </div>
        {/* Bottom fade to match other sections */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0b0717] to-transparent z-1 pointer-events-none" />

        {/* Nav bar */}
        <nav className="relative z-10 px-6 md:px-16 py-7 flex items-center justify-between">
          <span className="text-white font-bold tracking-widest text-sm">CALLSYNC AI</span>
          <ul className="hidden md:flex gap-10 text-[11px] font-bold tracking-[0.15em] text-white/60">
            {sections.map((s, i) => (
              <li
                key={s}
                onClick={() => scrollTo(i)}
                className={`cursor-pointer transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${
                  active === i ? "text-red-300" : ""
                }`}
              >
                {s.toUpperCase()}
              </li>
            ))}
          </ul>
        </nav>

        {/* Hero body */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-6 md:pt-10 pb-20 gap-10 min-h-[calc(100vh-80px)]">
          {/* Copy */}
          <div className="max-w-xl w-full">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300/75">
              VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS
            </p>
            <h1 className="mb-6 text-4xl md:text-6xl font-bold leading-[1.06] text-white">
              YOUR RECEPTIONIST.
              <br />
              MINUS THE SALARY.
              <br />
              <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                WITH CALLSYNC AI.
              </span>
            </h1>
            <p className="mb-10 max-w-lg text-sm md:text-[15px] leading-relaxed text-white/65">
              An AI voice agent that handles appointment booking, rescheduling, and cancellations over a natural phone call — no app, no web form, no hold music. Available 24/7, with proactive reminder calls that cut no-shows by up to 40%.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                onClick={() => scrollTo(1)}
                size="lg"
                className="rounded-full bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-[#12083a] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                SEE HOW IT WORKS
              </Button>
              <Button
                onClick={() => scrollTo(3)}
                size="lg"
                variant="outline"
                className="rounded-full border border-white/25 bg-transparent px-8 text-[11px] font-bold uppercase tracking-widest text-white/75 transition-all duration-300 hover:border-red-400/50 hover:text-red-300 hover:bg-white/5"
              >
                MEET THE TEAM
              </Button>
            </div>

            {/* Metric strip */}
            <div className="flex flex-wrap gap-8">
              {[
                { val: "< 2 min", label: "Average booking time" },
                { val: "24 / 7", label: "Always on, no downtime" },
                { val: "−40%", label: "No-show reduction" },
              ].map((m) => (
                <div key={m.val} className="flex flex-col">
                  <span className="text-red-300 font-bold text-lg leading-none drop-shadow-[0_0_12px_rgba(239,68,68,0.45)]">
                    {m.val}
                  </span>
                  <span className="text-white/35 text-xs tracking-wide mt-1">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone image */}
          <div className="relative flex-shrink-0 animate-pulse-scale">
            <div className="relative h-[420px] w-[320px] md:h-[680px] md:w-[510px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png"
                alt="CallSync AI Voice Agent"
                fill
                className="object-contain"
                style={{
                  filter: "drop-shadow(0 0 50px rgba(239,68,68,0.65)) drop-shadow(0 0 100px rgba(239,68,68,0.35))",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ════════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[1] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden"
      >
        {/* Consistent ambient glow — same dark base across all sections */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-violet-700/6 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-700/6 rounded-full blur-[130px]" />
          <div className="absolute inset-0 opacity-60 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em] mb-3">The Problem We Solve</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">HOW IT WORKS</h2>
            <p className="text-white/45 text-sm md:text-base max-w-2xl leading-relaxed">
              Scheduling friction is a silent cost centre. Front desks spend 40% of their time on calls a well-designed AI can handle completely — while delivering a more consistent experience than most humans on a Monday morning.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              { val: "$150B", label: "Lost annually to no-shows in US healthcare", sub: "Source: MGMA" },
              { val: "40%", label: "Of front-desk time absorbed by repetitive scheduling calls", sub: "Recoverable immediately" },
              { val: "30–40%", label: "Reduction in no-shows with automated voice reminders", sub: "Industry benchmark" },
            ].map((s) => (
              <div
                key={s.val}
                className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 hover:border-red-400/25 transition-all duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.35)] mb-2">
                  {s.val}
                </div>
                <div className="text-white/55 text-xs leading-relaxed mb-1">{s.label}</div>
                <div className="text-white/22 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Call flow steps */}
          <div className="text-[10px] font-bold text-white/30 mb-7 tracking-[0.2em] uppercase">
            End-to-End Call Flow
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {callSteps.map((step, i) => (
              <div
                key={i}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-red-400/25 hover:bg-white/[0.045] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-lg group-hover:border-red-400/25 transition-all duration-300">
                    {step.icon}
                  </div>
                  <div className="text-red-400/45 text-[10px] font-bold tracking-[0.18em]">STEP {i + 1}</div>
                </div>
                <div className="text-white font-bold text-sm mb-2">{step.title}</div>
                <div className="text-white/38 text-xs leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>

          {/* Live demo */}
          <div className="text-[10px] font-bold text-white/30 mb-3 tracking-[0.2em] uppercase">
            Live Conversation Demo
          </div>
          <p className="text-white/35 text-xs mb-10">
            Walk through a real booking flow exactly as a caller would. In production, speech replaces button presses.
          </p>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-5">
                <div className="text-white/25 text-[10px] uppercase tracking-widest mb-3">What this demonstrates</div>
                <div className="text-white/55 text-sm leading-relaxed mb-4">
                  This simulator mirrors the exact flow a caller experiences. In production, Amazon Lex processes the caller&apos;s words and Amazon Polly reads responses aloud over the phone line — no UI involved.
                </div>
                <div className="space-y-2">
                  {[
                    "Natural language — phrased any way the caller prefers",
                    "Multi-turn context — prior answers retained throughout",
                    "Slot validation — every detail confirmed before booking",
                    "Automated follow-up — reminder call 24 hours before",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/38">
                      <div className="w-1 h-1 rounded-full bg-red-400/60 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="w-full md:w-72 flex-shrink-0 mx-auto md:mx-0">
              <div className="bg-[#0d0820] rounded-[2.5rem] border-2 border-white/12 shadow-[0_0_60px_rgba(120,68,255,0.1)] overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <div className="text-white/30 text-xs">9:41</div>
                  <div className="w-20 h-5 bg-black rounded-full" />
                  <div className="text-white/30 text-xs">●●●</div>
                </div>
                <div className="text-center pb-3 border-b border-white/[0.06]">
                  <div className="text-white/35 text-[10px] uppercase tracking-widest">CallSync AI</div>
                  <div className="text-green-400/80 text-[10px] mt-1">● Connected</div>
                </div>
                <div className="h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  {!started && (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-white/22 text-xs text-center px-4">
                        Press start to experience the booking flow
                      </p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          m.from === "bot"
                            ? "bg-white/[0.06] text-white/75 rounded-tl-sm"
                            : "bg-red-500/18 text-white/75 rounded-tr-sm border border-red-400/22"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-4 pb-6 pt-3 border-t border-white/[0.06] min-h-[80px] flex items-center">
                  {!started ? (
                    <button
                      onClick={startSim}
                      className="w-full py-2 rounded-full bg-red-500/12 border border-red-400/30 text-red-300 text-[11px] font-bold tracking-widest hover:bg-red-500/22 transition-all duration-300"
                    >
                      START DEMO CALL
                    </button>
                  ) : actionStep?.type === "choices" ? (
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      {(actionStep as { type: "choices"; options: { label: string; next: string }[] }).options.map(
                        (opt) => (
                          <button
                            key={opt.label}
                            onClick={() => handleChoice(opt.label, opt.next)}
                            className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/12 text-white/65 text-xs hover:border-red-400/45 hover:text-red-300 transition-all duration-300"
                          >
                            {opt.label}
                          </button>
                        )
                      )}
                    </div>
                  ) : actionStep?.type === "input" ? (
                    <div className="flex gap-2 w-full">
                      <input
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)
                        }
                        placeholder={(actionStep as { type: "input"; placeholder: string; next: string }).placeholder}
                        className="flex-1 bg-white/[0.04] border border-white/12 rounded-full px-3 py-1.5 text-white/75 text-xs placeholder:text-white/22 outline-none focus:border-red-400/45"
                      />
                      <button
                        onClick={() =>
                          handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)
                        }
                        className="w-8 h-8 rounded-full bg-red-500/22 border border-red-400/30 text-red-300 flex items-center justify-center hover:bg-red-500/35 transition-all duration-300 text-sm flex-shrink-0"
                      >
                        →
                      </button>
                    </div>
                  ) : actionStep?.type === "end" ? (
                    <button
                      onClick={startSim}
                      className="w-full py-2 rounded-full bg-white/[0.04] border border-white/12 text-white/45 text-xs hover:border-red-400/30 hover:text-red-300 transition-all duration-300"
                    >
                      TRY AGAIN
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — ARCHITECTURE
      ════════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[2] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-indigo-700/6 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-red-700/6 rounded-full blur-[130px]" />
          <div className="absolute inset-0 opacity-60 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em] mb-3">AWS-Native Architecture</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">ARCHITECTURE</h2>
            <p className="text-white/45 text-sm md:text-base max-w-2xl leading-relaxed">
              Every service was selected for a specific purpose. No unnecessary dependencies. The system runs entirely serverless on AWS with one external integration — Google Calendar.
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="text-[10px] font-bold text-white/28 mb-5 tracking-[0.2em] uppercase">System Architecture</div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 overflow-x-auto mb-14">
            <div className="min-w-[640px]">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-white/28 text-[10px] uppercase tracking-widest w-24 flex-shrink-0">Inbound:</div>
                {[
                  { label: "CALLER", c: "border-white/25 text-white/70 bg-white/[0.03]" },
                  { label: "Amazon\nConnect", c: "border-orange-400/45 text-orange-300/90 bg-orange-500/[0.07]" },
                  { label: "Amazon\nLex", c: "border-blue-400/45 text-blue-300/90 bg-blue-500/[0.07]" },
                  { label: "AWS\nLambda", c: "border-yellow-400/45 text-yellow-300/90 bg-yellow-500/[0.07]" },
                ].map((n, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-[10px] font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>
                      {n.label}
                    </div>
                    {i < 3 && <span className="text-red-400/35 font-bold flex-shrink-0 text-sm">→</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-6 pl-28">
                <div className="flex gap-5">
                  {[
                    { label: "DynamoDB", c: "border-cyan-400/45 text-cyan-300/90 bg-cyan-500/[0.07]", arrow: "↑" },
                    { label: "Google\nCalendar", c: "border-green-400/45 text-green-300/90 bg-green-500/[0.07]", arrow: "↓" },
                    { label: "Amazon\nBedrock", c: "border-purple-400/45 text-purple-300/90 bg-purple-500/[0.07]", arrow: "↓" },
                  ].map((n) => (
                    <div key={n.label} className="flex flex-col items-center gap-1">
                      <div className="text-red-400/30 text-xs">{n.arrow}</div>
                      <div className={`rounded-xl border px-4 py-2 text-center text-[10px] font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>
                        {n.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="text-white/28 text-[10px] uppercase tracking-widest w-24 flex-shrink-0">Response:</div>
                {[
                  { label: "Amazon\nPolly", c: "border-green-400/45 text-green-300/90 bg-green-500/[0.07]" },
                  { label: "Amazon\nConnect", c: "border-orange-400/45 text-orange-300/90 bg-orange-500/[0.07]" },
                  { label: "CALLER\n(voice)", c: "border-white/25 text-white/70 bg-white/[0.03]" },
                ].map((n, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`rounded-xl border px-4 py-2.5 text-center text-[10px] font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>
                      {n.label}
                    </div>
                    {i < 2 && <span className="text-red-400/35 font-bold text-sm">→</span>}
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-5">
                <div className="flex items-center gap-3">
                  <div className="text-white/28 text-[10px] uppercase tracking-widest w-24 flex-shrink-0">Reminders:</div>
                  {[
                    { label: "EventBridge\n(hourly)", c: "border-red-400/45 text-red-300/90 bg-red-500/[0.07]" },
                    { label: "AWS\nLambda", c: "border-yellow-400/45 text-yellow-300/90 bg-yellow-500/[0.07]" },
                    { label: "Amazon\nConnect", c: "border-orange-400/45 text-orange-300/90 bg-orange-500/[0.07]" },
                    { label: "CALLER\n(reminder)", c: "border-white/25 text-white/70 bg-white/[0.03]" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`rounded-xl border px-3 py-2 text-center text-[10px] font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>
                        {n.label}
                      </div>
                      {i < 3 && <span className="text-red-400/35 font-bold text-sm">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service breakdown */}
          <div className="text-[10px] font-bold text-white/28 mb-7 tracking-[0.2em] uppercase">Service Breakdown</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-14">
            {stack.map((s) => (
              <div
                key={s.name}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-red-400/22 hover:bg-white/[0.045] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`inline-block px-2.5 py-1 rounded-lg bg-gradient-to-r ${s.color} border ${s.border} ${s.text} text-[10px] font-bold tracking-widest mb-3`}>
                  {s.tag}
                </div>
                <div className="text-white font-bold text-sm mb-2">{s.name}</div>
                <div className="text-white/38 text-xs leading-relaxed mb-3">{s.desc}</div>
                <div className="border-t border-white/[0.06] pt-3">
                  <span className="text-red-300/45 text-xs">Why: </span>
                  <span className="text-white/28 text-xs">{s.why}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Differentiator */}
          <div className="relative bg-gradient-to-br from-red-500/7 to-violet-500/7 border border-red-400/18 rounded-2xl p-8 md:p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/4 via-transparent to-violet-500/4 pointer-events-none" />
            <div className="relative z-10">
              <div className="text-red-400/55 text-[10px] uppercase tracking-[0.2em] mb-3">Our Differentiator</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                We don&apos;t just book.{" "}
                <span className="text-red-300 drop-shadow-[0_0_18px_rgba(239,68,68,0.35)]">We follow up.</span>
              </h3>
              <p className="text-white/45 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
                Most comparable solutions stop at inbound booking. CallSync adds a proactive outbound reminder loop — EventBridge fires a Lambda hourly, placing automated calls to patients 24 hours before their appointment. No staff action. No missed reminders.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[
                  { val: "−40%", label: "No-show rate" },
                  { val: "24h", label: "Before appointment" },
                  { val: "0", label: "Staff required" },
                ].map((s) => (
                  <div key={s.val} className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                    <div className="text-xl md:text-2xl font-bold text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.35)] mb-1">
                      {s.val}
                    </div>
                    <div className="text-white/38 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — TEAM
      ════════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[3] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/6 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-60 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center mb-14">
            <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em] mb-3">
              HACK&apos;A&apos;WAR GenAI × AWS · RIT Bengaluru
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">THE TEAM</h2>
            <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
              Four students from RIT Bengaluru building production-grade voice AI infrastructure in 24 hours. Track 3.3.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 mb-16">
            {team.map((m) => (
              <div
                key={m.name}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 md:p-8 text-center hover:border-red-400/28 hover:shadow-[0_0_35px_rgba(239,68,68,0.07)] hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-red-500/12 to-violet-500/12 border border-white/[0.07] flex items-center justify-center text-3xl md:text-4xl mx-auto mb-5 group-hover:shadow-[0_0_22px_rgba(239,68,68,0.18)] group-hover:border-red-400/22 transition-all duration-300">
                  {m.emoji}
                </div>
                <div className="text-white font-bold text-base tracking-wide mb-1">{m.name}</div>
                <div className="text-red-300/65 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">{m.role}</div>
                <div className="text-white/32 text-xs leading-relaxed">{m.detail}</div>
              </div>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 md:p-10 text-center">
            <div className="text-white/22 text-[10px] uppercase tracking-widest mb-4">Built for</div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">HACK&apos;A&apos;WAR GenAI × AWS</div>
            <div className="text-white/38 text-sm mb-7">Track 3.3 — Voice AI · RIT Bengaluru · 24-hour hackathon</div>
            <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
              {["Amazon Connect", "Amazon Lex", "Amazon Bedrock", "Amazon Polly", "AWS Lambda"].map((s) => (
                <div
                  key={s}
                  className="text-white/22 text-xs font-bold tracking-wide hover:text-red-300 transition-colors duration-300 cursor-default"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes navDotPop {
          0%   { transform: scale(0.5); opacity: 0.3; }
          55%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
