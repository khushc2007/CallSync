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
    { type: "bot", text: "Hi! I am CallSync AI. Would you like to book, reschedule, or cancel an appointment?" },
    { type: "choices", options: [{ label: "Book", next: "book1" }, { label: "Reschedule", next: "reschedule" }, { label: "Cancel", next: "cancel" }] },
  ],
  book1: [
    { type: "bot", text: "Great choice! What date works for you?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "book2" }, { label: "This Week", next: "book2" }, { label: "Next Week", next: "book2" }] },
  ],
  book2: [
    { type: "bot", text: "I have availability at 2PM and 4PM. Which slot works better for you?" },
    { type: "choices", options: [{ label: "2PM", next: "book3" }, { label: "4PM", next: "book3" }] },
  ],
  book3: [
    { type: "bot", text: "Perfect. May I have your name for the booking?" },
    { type: "input", placeholder: "Enter your name...", next: "book4" },
  ],
  book4: [
    { type: "bot", text: "All done! Your appointment is confirmed. You will receive an automated reminder call 24 hours before. Have a great day!" },
    { type: "end" },
  ],
  reschedule: [
    { type: "bot", text: "I found your existing appointment. What is your preferred new date?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "reschedule2" }, { label: "Next Week", next: "reschedule2" }] },
  ],
  reschedule2: [
    { type: "bot", text: "Your appointment has been successfully rescheduled. You will receive an updated reminder call. Goodbye!" },
    { type: "end" },
  ],
  cancel: [
    { type: "bot", text: "I found your appointment. Are you sure you would like to cancel?" },
    { type: "choices", options: [{ label: "Yes, cancel it", next: "cancel2" }, { label: "No, keep it", next: "start" }] },
  ],
  cancel2: [
    { type: "bot", text: "Your appointment has been cancelled successfully. We hope to see you again soon. Goodbye!" },
    { type: "end" },
  ],
}

type Message = { from: "bot" | "user"; text: string }

const sections = ["Hero", "How It Works", "Tech Stack", "Team"]

const callSteps = [
  { icon: "📞", title: "Caller Dials", desc: "The customer calls your dedicated phone number from any device. No app to download, no form to fill out — just a natural phone call, exactly as they have always done. The system answers instantly, 24 hours a day, 7 days a week." },
  { icon: "🎙️", title: "AI Listens", desc: "Amazon Lex, powered by Amazon Bedrock, processes the caller's natural speech in real time. It understands intent regardless of phrasing — whether they say 'book me in for Tuesday' or 'I need an appointment next week', the system comprehends it accurately." },
  { icon: "📋", title: "Slots Collected", desc: "The AI conducts a structured yet natural conversation, intelligently collecting all required booking information: preferred date, time, service type, full name, and contact number. It handles ambiguity gracefully and confirms each detail before proceeding." },
  { icon: "📅", title: "Calendar Checked", desc: "AWS Lambda queries Google Calendar in real time to verify slot availability before confirming. Conflicts are detected and the caller is offered alternative times instantly. Double bookings are architecturally impossible — the calendar is the single source of truth." },
  { icon: "✅", title: "Booking Confirmed", desc: "Once all details are verified, the appointment is atomically written to DynamoDB and Google Calendar simultaneously. The caller receives a natural-sounding voice confirmation via Amazon Polly, with all appointment details read back clearly." },
  { icon: "🔔", title: "Reminder Sent", desc: "An EventBridge scheduled Lambda runs hourly, scanning DynamoDB for appointments within the next 24 hours. For each due appointment, Amazon Connect places an automated outbound reminder call — the patient receives a personalised voice reminder without any staff involvement." },
]

const stack = [
  { name: "Amazon Connect", tag: "Telephony", desc: "Manages all inbound and outbound PSTN phone calls. Provides the dedicated phone number, handles call routing, and orchestrates the contact flow that connects callers to the Lex NLU engine.", why: "AWS-native telephony eliminates any dependency on third-party providers.", color: "from-orange-500/20 to-red-500/20", border: "border-orange-400/40", text: "text-orange-300" },
  { name: "Amazon Lex", tag: "NLU Engine", desc: "Natural language understanding engine that classifies caller intent and extracts structured slot values including date, time, service type, name, and phone number from free-form speech.", why: "Built-in slot filling eliminates 80% of custom conversation logic.", color: "from-blue-500/20 to-purple-500/20", border: "border-blue-400/40", text: "text-blue-300" },
  { name: "Amazon Bedrock", tag: "LLM Fallback", desc: "Claude model on Bedrock handles edge cases that fall outside Lex's structured intent framework — ambiguous requests, multi-intent utterances, and complex rescheduling scenarios that require genuine reasoning.", why: "Provides a safety net for calls with unusual or complex requests.", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-400/40", text: "text-purple-300" },
  { name: "Amazon Polly", tag: "Text-to-Speech", desc: "Converts all system responses into natural-sounding voice output. Used for booking confirmations, slot prompts, error handling, and all outbound reminder call scripts.", why: "Neural TTS voices are indistinguishable from human speech — critical for caller trust.", color: "from-green-500/20 to-teal-500/20", border: "border-green-400/40", text: "text-green-300" },
  { name: "AWS Lambda", tag: "Serverless Compute", desc: "Stateless functions handle all business logic: calendar availability checks, booking creation, DynamoDB writes, conflict detection, and the outbound reminder scheduling loop.", why: "Scales to zero between calls. No idle infrastructure costs during off-hours.", color: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-400/40", text: "text-yellow-300" },
  { name: "DynamoDB", tag: "Database", desc: "Stores the complete appointment record including caller name, phone number, date, time, service type, booking status, and reminder delivery status.", why: "Sub-millisecond read latency and infinite scale with zero operational overhead.", color: "from-blue-500/20 to-cyan-500/20", border: "border-cyan-400/40", text: "text-cyan-300" },
  { name: "EventBridge", tag: "Scheduler", desc: "Provides a serverless cron trigger that fires the reminder Lambda function every hour. Checks DynamoDB for appointments within the next 24-hour window that have not yet received a reminder call.", why: "Fully managed scheduling with no EC2, no always-on process.", color: "from-red-500/20 to-pink-500/20", border: "border-red-400/40", text: "text-red-300" },
  { name: "Google Calendar API", tag: "Calendar Layer", desc: "Acts as the authoritative source of truth for slot availability. All bookings are written directly to Google Calendar, making the system compatible with any business already using Google Workspace.", why: "Eliminates double-booking at the infrastructure level.", color: "from-green-500/20 to-emerald-500/20", border: "border-green-400/40", text: "text-green-300" },
  { name: "React + Vite", tag: "Dashboard", desc: "A real-time web dashboard for clinic staff showing all upcoming appointments, live call logs, reminder delivery status, and cancellation history.", why: "Instant HMR during development and one-command Vercel deployment.", color: "from-cyan-500/20 to-blue-500/20", border: "border-blue-400/40", text: "text-blue-300" },
]

const team = [
  { name: "Satvik", role: "Team Lead", detail: "Product vision, system architecture, and overall technical direction", emoji: "⚡" },
  { name: "Shriya", role: "AI & Backend", detail: "Amazon Lex intent design, Bedrock integration, and Lambda business logic", emoji: "🧠" },
  { name: "Rajat", role: "Infrastructure", detail: "AWS Connect setup, DynamoDB schema, EventBridge scheduling, and IAM", emoji: "🔧" },
  { name: "Khush", role: "Frontend & Voice", detail: "React dashboard, Polly voice tuning, and end-to-end demo integration", emoji: "🎙️" },
]

export default function Home() {
  const [active, setActive] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [simKey, setSimKey] = useState("start")
  const [inputVal, setInputVal] = useState("")
  const [started, setStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i) },
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

      {/* Side dot nav */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {sections.map((s, i) => (
          <button key={s} onClick={() => scrollTo(i)} title={s} className="group relative flex items-center justify-end gap-2">
            <span className="absolute right-6 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">{s}</span>
            <div className={`rounded-full transition-all duration-300 ${active === i ? "w-3 h-3 bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "w-2 h-2 bg-white/30 hover:bg-white/60"}`} />
          </button>
        ))}
      </div>

      {/* SECTION 1 — HERO */}
      <section ref={(el) => { sectionRefs.current[0] = el }} className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#5B4B8A] via-[#7B5B8A] to-[#8B6B9A]">
        <div className="absolute inset-0 z-0">
          <iframe src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/" frameBorder="0" width="100%" height="100%" className="h-full w-full" />
        </div>

        <nav className="relative z-10 px-16 py-8">
          <ul className="flex gap-12 text-sm font-bold tracking-wide text-white">
            {sections.map((s, i) => (
              <li key={s} onClick={() => scrollTo(i)} className="cursor-pointer transition-all duration-300 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {s.toUpperCase()}
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center justify-between px-16 pt-12">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-200/90">VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS</p>
            <h1 className="mb-6 text-6xl font-bold leading-tight text-white">
              YOUR RECEPTIONIST.
              <br />
              MINUS THE SALARY.
              <br />
              <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]">WITH CALLSYNC AI.</span>
            </h1>
            <p className="mb-10 max-w-xl text-base leading-relaxed text-white/90">
              An AI-powered voice agent that books, reschedules, and cancels appointments through a natural phone call — no app, no form, no waiting on hold. Available 24/7 with proactive reminder calls that eliminate no-shows.
            </p>
            <div className="mb-12 flex gap-4">
              <Button onClick={() => scrollTo(1)} size="lg" className="rounded-full bg-white px-8 text-sm font-semibold uppercase tracking-wide text-[#7B6BA8] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]">SEE HOW IT WORKS</Button>
              <Button onClick={() => scrollTo(2)} size="lg" variant="outline" className="rounded-full border-2 border-white bg-transparent px-8 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:border-red-400 hover:bg-white/10 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.5)]">VIEW TECH STACK</Button>
            </div>
            <div className="flex gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/40" />
            </div>
          </div>
          <div className="relative animate-pulse-scale transition-transform duration-500 hover:scale-110">
            <div className="relative h-[720px] w-[540px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png"
                alt="CallSync AI Voice Agent"
                fill
                className="object-contain transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 50px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 100px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 150px rgba(239, 68, 68, 0.4))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — HOW IT WORKS */}
      <section ref={(el) => { sectionRefs.current[1] = el }} className="relative min-h-screen bg-gradient-to-br from-[#5B4B8A] via-[#7B5B8A] to-[#8B6B9A] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-red-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-red-300 text-sm uppercase tracking-widest mb-3">The Problem We Solve</p>
            <h2 className="text-5xl font-bold text-white mb-6">HOW IT WORKS</h2>
            <p className="text-white/60 text-base max-w-2xl leading-relaxed">Scheduling friction costs businesses millions annually. CallSync AI eliminates the entire problem — from the first ring to the confirmed booking — in under two minutes, with no human involvement required.</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-20">
            {[
              { val: "$150B", label: "Lost annually to appointment no-shows in US healthcare alone", sub: "Source: MGMA" },
              { val: "40%", label: "Of front desk staff time consumed by repetitive scheduling calls", sub: "Recoverable with automation" },
              { val: "30–40%", label: "Reduction in no-show rate when automated reminder calls are deployed", sub: "Industry benchmark" },
            ].map((s) => (
              <div key={s.val} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-400/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.1)] transition-all duration-300">
                <div className="text-5xl font-bold text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] mb-3">{s.val}</div>
                <div className="text-white/70 text-sm leading-relaxed mb-2">{s.label}</div>
                <div className="text-white/30 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="mb-20">
            <h3 className="text-lg font-bold text-white mb-10 tracking-wide">THE CALL FLOW — END TO END</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {callSteps.map((step, i) => (
                <div key={i} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-red-400/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:border-red-400/40 transition-all duration-300">{step.icon}</div>
                    <div className="text-red-300/70 text-xs font-bold">STEP {i + 1}</div>
                  </div>
                  <div className="text-white font-bold text-sm mb-2">{step.title}</div>
                  <div className="text-white/50 text-xs leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-3 tracking-wide">LIVE CONVERSATION DEMO</h3>
            <p className="text-white/50 text-sm mb-10">Experience the booking flow exactly as a caller would. Click through a real conversation with CallSync AI.</p>
            <div className="flex gap-12 items-start">
              <div className="flex-1">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                  <div className="text-white/40 text-xs uppercase tracking-widest mb-3">What this demonstrates</div>
                  <div className="text-white/70 text-sm leading-relaxed mb-4">This simulator replicates the exact conversation flow a caller experiences. In production, this same flow runs over a real phone call — the caller speaks, Amazon Lex processes their words, and Amazon Polly reads the response back aloud.</div>
                  <div className="space-y-2">
                    {["Natural language understanding — say it any way you like", "Multi-turn context — the system remembers previous answers", "Slot validation — confirms every detail before booking", "Outbound reminders — automated follow-up 24hrs before"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                        <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-72 flex-shrink-0">
                <div className="bg-[#1a0f3a] rounded-[2.5rem] border-2 border-white/20 shadow-[0_0_60px_rgba(239,68,68,0.15)] overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-4 pb-2">
                    <div className="text-white/40 text-xs">9:41</div>
                    <div className="w-20 h-5 bg-black rounded-full" />
                    <div className="text-white/40 text-xs">●●●</div>
                  </div>
                  <div className="text-center pb-3 border-b border-white/10">
                    <div className="text-white/50 text-xs uppercase tracking-widest">CallSync AI</div>
                    <div className="text-green-400 text-xs mt-1">● Connected</div>
                  </div>
                  <div className="h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                    {!started && <div className="flex-1 flex items-center justify-center h-full"><p className="text-white/30 text-xs text-center px-4">Press start to experience the booking conversation</p></div>}
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.from === "bot" ? "bg-white/10 text-white rounded-tl-sm" : "bg-red-500/25 text-white rounded-tr-sm border border-red-400/30"}`}>{m.text}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="px-4 pb-6 pt-3 border-t border-white/10 min-h-[80px] flex items-center">
                    {!started ? (
                      <button onClick={startSim} className="w-full py-2 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold tracking-wide hover:bg-red-500/30 transition-all duration-300">START DEMO CALL</button>
                    ) : actionStep?.type === "choices" ? (
                      <div className="flex flex-wrap gap-2 justify-center w-full">
                        {(actionStep as { type: "choices"; options: { label: string; next: string }[] }).options.map((opt) => (
                          <button key={opt.label} onClick={() => handleChoice(opt.label, opt.next)} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs hover:border-red-400/60 hover:text-red-300 transition-all duration-300">{opt.label}</button>
                        ))}
                      </div>
                    ) : actionStep?.type === "input" ? (
                      <div className="flex gap-2 w-full">
                        <input value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)} placeholder={(actionStep as { type: "input"; placeholder: string; next: string }).placeholder} className="flex-1 bg-white/5 border border-white/20 rounded-full px-3 py-1.5 text-white text-xs placeholder:text-white/30 outline-none focus:border-red-400/60" />
                        <button onClick={() => handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)} className="w-8 h-8 rounded-full bg-red-500/30 border border-red-400/40 text-red-300 flex items-center justify-center hover:bg-red-500/50 transition-all duration-300 text-sm flex-shrink-0">→</button>
                      </div>
                    ) : actionStep?.type === "end" ? (
                      <button onClick={startSim} className="w-full py-2 rounded-full bg-white/5 border border-white/20 text-white/60 text-xs hover:border-red-400/40 hover:text-red-300 transition-all duration-300">TRY AGAIN</button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TECH STACK */}
      <section ref={(el) => { sectionRefs.current[2] = el }} className="relative min-h-screen bg-gradient-to-br from-[#4B3B7A] via-[#6B4B7A] to-[#7B5B8A] overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-red-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-red-300 text-sm uppercase tracking-widest mb-3">AWS-Native Architecture</p>
            <h2 className="text-5xl font-bold text-white mb-6">TECH STACK</h2>
            <p className="text-white/60 text-base max-w-2xl leading-relaxed">Every service was chosen deliberately for a specific reason. No bloat, no unnecessary dependencies. The entire system runs serverless on AWS with a single external integration — Google Calendar.</p>
          </div>

          <div className="mb-16">
            <h3 className="text-lg font-bold text-white mb-8 tracking-wide">SYSTEM ARCHITECTURE</h3>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-white/40 text-xs uppercase tracking-widest w-24 flex-shrink-0">Inbound:</div>
                  {[{ label: "CALLER", c: "border-white/40 text-white bg-white/5" }, { label: "Amazon\nConnect", c: "border-orange-400/60 text-orange-300 bg-orange-500/10" }, { label: "Amazon\nLex", c: "border-blue-400/60 text-blue-300 bg-blue-500/10" }, { label: "AWS\nLambda", c: "border-yellow-400/60 text-yellow-300 bg-yellow-500/10" }].map((n, i) => (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={`flex-1 rounded-xl border px-3 py-3 text-center text-xs font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>{n.label}</div>
                      {i < 3 && <span className="text-red-400/60 font-bold flex-shrink-0">→</span>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mb-8 pl-28">
                  <div className="flex gap-6">
                    {[{ label: "DynamoDB", c: "border-cyan-400/60 text-cyan-300 bg-cyan-500/10", arrow: "↑" }, { label: "Google\nCalendar", c: "border-green-400/60 text-green-300 bg-green-500/10", arrow: "↓" }, { label: "Amazon\nBedrock", c: "border-purple-400/60 text-purple-300 bg-purple-500/10", arrow: "↓" }].map((n) => (
                      <div key={n.label} className="flex flex-col items-center gap-1">
                        <div className="text-red-400/50 text-sm">{n.arrow}</div>
                        <div className={`rounded-xl border px-4 py-2 text-center text-xs font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>{n.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-white/40 text-xs uppercase tracking-widest w-24 flex-shrink-0">Response:</div>
                  {[{ label: "Amazon\nPolly", c: "border-green-400/60 text-green-300 bg-green-500/10" }, { label: "Amazon\nConnect", c: "border-orange-400/60 text-orange-300 bg-orange-500/10" }, { label: "CALLER\n(voice)", c: "border-white/40 text-white bg-white/5" }].map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`rounded-xl border px-4 py-3 text-center text-xs font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>{n.label}</div>
                      {i < 2 && <span className="text-red-400/60 font-bold">→</span>}
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="text-white/40 text-xs uppercase tracking-widest w-24 flex-shrink-0">Reminders:</div>
                    {[{ label: "EventBridge\n(hourly)", c: "border-red-400/60 text-red-300 bg-red-500/10" }, { label: "AWS\nLambda", c: "border-yellow-400/60 text-yellow-300 bg-yellow-500/10" }, { label: "Amazon\nConnect", c: "border-orange-400/60 text-orange-300 bg-orange-500/10" }, { label: "CALLER\n(reminder)", c: "border-white/40 text-white bg-white/5" }].map((n, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`rounded-xl border px-3 py-2 text-center text-xs font-bold whitespace-pre-line leading-snug ${n.c} hover:scale-105 transition-all duration-200`}>{n.label}</div>
                        {i < 3 && <span className="text-red-400/60 font-bold">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-lg font-bold text-white mb-8 tracking-wide">SERVICE BREAKDOWN</h3>
            <div className="grid grid-cols-3 gap-4">
              {stack.map((s) => (
                <div key={s.name} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-red-400/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.08)] hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`inline-block px-2.5 py-1 rounded-lg bg-gradient-to-r ${s.color} border ${s.border} ${s.text} text-xs font-bold tracking-wide mb-3`}>{s.tag}</div>
                  <div className="text-white font-bold text-sm mb-2">{s.name}</div>
                  <div className="text-white/50 text-xs leading-relaxed mb-3">{s.desc}</div>
                  <div className="border-t border-white/10 pt-3">
                    <span className="text-red-300/60 text-xs">Why: </span>
                    <span className="text-white/35 text-xs">{s.why}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-400/25 rounded-2xl p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-purple-500/5" />
            <div className="relative z-10">
              <div className="text-red-300 text-sm uppercase tracking-widest mb-3">Our Differentiator</div>
              <h3 className="text-3xl font-bold text-white mb-4">We don&apos;t just book. <span className="text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">We follow up.</span></h3>
              <p className="text-white/60 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">Most competing solutions handle inbound booking only. CallSync AI adds a proactive outbound reminder loop — EventBridge triggers a Lambda hourly, which places automated reminder calls to patients 24 hours before their appointment. No staff involvement. No missed reminders.</p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {[{ val: "30–40%", label: "Reduction in no-shows" }, { val: "24hr", label: "Before appointment" }, { val: "100%", label: "Zero staff required" }].map((s) => (
                  <div key={s.val} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-bold text-red-300 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] mb-1">{s.val}</div>
                    <div className="text-white/50 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — TEAM */}
      <section ref={(el) => { sectionRefs.current[3] = el }} className="relative min-h-screen bg-gradient-to-br from-[#3B2B6A] via-[#5B3B7A] to-[#6B4B8A] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <p className="text-red-300 text-sm uppercase tracking-widest mb-3">HACK&apos;A&apos;WAR GenAI × AWS · RIT Bengaluru</p>
            <h2 className="text-5xl font-bold text-white mb-6">THE TEAM</h2>
            <p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed">Four students from RIT Bengaluru building production-grade AI infrastructure in 24 hours. Track 3.3 — Voice AI.</p>
          </div>
          <div className="grid grid-cols-4 gap-8 mb-20">
            {team.map((m) => (
              <div key={m.name} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center hover:border-red-400/40 hover:shadow-[0_0_50px_rgba(239,68,68,0.12)] hover:-translate-y-2 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-4xl mx-auto mb-6 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] group-hover:border-red-400/30 transition-all duration-300">{m.emoji}</div>
                <div className="text-white font-bold text-lg tracking-wide mb-1">{m.name}</div>
                <div className="text-red-300/80 text-xs font-bold uppercase tracking-widest mb-4">{m.role}</div>
                <div className="text-white/40 text-xs leading-relaxed">{m.detail}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <div className="text-white/30 text-xs uppercase tracking-widest mb-4">Built for</div>
            <div className="text-3xl font-bold text-white mb-2">HACK&apos;A&apos;WAR GenAI × AWS</div>
            <div className="text-white/50 text-sm mb-6">Track 3.3 — Voice AI · RIT Bengaluru · 24-hour hackathon</div>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {["Amazon Connect", "Amazon Lex", "Amazon Bedrock", "Amazon Polly", "AWS Lambda"].map((s) => (
                <div key={s} className="text-white/30 text-xs font-bold tracking-wide hover:text-red-300 transition-colors duration-300 cursor-default">{s}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
