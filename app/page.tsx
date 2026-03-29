"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

/* ─── Types ─── */
type SimStep =
  | { type: "bot"; text: string }
  | { type: "choices"; options: { label: string; next: string }[] }
  | { type: "input"; placeholder: string; next: string }
  | { type: "end" }
type Message = { from: "bot" | "user"; text: string }

/* ─── Conversation sim ─── */
const sim: Record<string, SimStep[]> = {
  start: [
    { type: "bot", text: "Hello, this is CallSync AI. Would you like to book, reschedule, or cancel an appointment?" },
    { type: "choices", options: [{ label: "Book", next: "book1" }, { label: "Reschedule", next: "reschedule" }, { label: "Cancel", next: "cancel" }] },
  ],
  book1: [
    { type: "bot", text: "What date works best for you?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "book2" }, { label: "This Week", next: "book2" }, { label: "Next Week", next: "book2" }] },
  ],
  book2: [
    { type: "bot", text: "I have two slots open — 2:00 PM and 4:00 PM. Which works better?" },
    { type: "choices", options: [{ label: "2:00 PM", next: "book3" }, { label: "4:00 PM", next: "book3" }] },
  ],
  book3: [
    { type: "bot", text: "Could I take your full name to confirm?" },
    { type: "input", placeholder: "Your name...", next: "book4" },
  ],
  book4: [
    { type: "bot", text: "Done — appointment confirmed. You'll receive an automated reminder call 24 hours in advance." },
    { type: "end" },
  ],
  reschedule: [
    { type: "bot", text: "I have your existing appointment on file. What date would you prefer?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "reschedule2" }, { label: "Next Week", next: "reschedule2" }] },
  ],
  reschedule2: [
    { type: "bot", text: "Rescheduled. A confirmation and updated reminder will follow automatically." },
    { type: "end" },
  ],
  cancel: [
    { type: "bot", text: "I can see your upcoming appointment. Proceed with cancellation?" },
    { type: "choices", options: [{ label: "Yes, cancel", next: "cancel2" }, { label: "Keep it", next: "start" }] },
  ],
  cancel2: [
    { type: "bot", text: "Cancellation confirmed. The slot has been freed. We hope to hear from you again." },
    { type: "end" },
  ],
}

/* ─── Data ─── */
const sections = ["Overview", "How It Works", "Architecture", "Team"]

const callSteps = [
  {
    num: "01",
    title: "Caller Dials In",
    desc: "The patient calls your clinic's dedicated number — no app, no web form. CallSync answers instantly, 24/7.",
    detail: "Amazon Connect manages PSTN telephony. The call is answered within two rings regardless of time of day. No human receptionist required at any stage.",
    latency: "< 2s answer time",
  },
  {
    num: "02",
    title: "Speech Understood",
    desc: "Amazon Lex parses natural speech in real time. 'Tuesday morning' or 'sometime next week' — both understood correctly.",
    detail: "Lex uses multi-turn intent classification and entity extraction. Amazon Bedrock handles edge cases and complex rescheduling scenarios that fall outside structured intents.",
    latency: "~200ms NLU latency",
  },
  {
    num: "03",
    title: "Details Collected",
    desc: "The AI collects date, time, service type, full name, and contact number through structured slot-filling.",
    detail: "Each slot is validated individually. The system re-prompts on invalid input without losing prior context. Callers never repeat themselves.",
    latency: "Avg. 6 turns",
  },
  {
    num: "04",
    title: "Availability Verified",
    desc: "Lambda queries Google Calendar live. Conflicts are caught and alternatives offered before the caller commits.",
    detail: "The calendar is the single source of truth. Double-bookings are architecturally impossible — the slot is only confirmed after a successful Calendar write.",
    latency: "Real-time check",
  },
  {
    num: "05",
    title: "Appointment Locked",
    desc: "The booking is written atomically to DynamoDB and Google Calendar. Polly reads back every detail to the caller.",
    detail: "Neural TTS via Amazon Polly produces voice output indistinguishable from a trained human receptionist. Caller confidence is high.",
    latency: "Atomic write",
  },
  {
    num: "06",
    title: "Reminder Dispatched",
    desc: "EventBridge fires a Lambda hourly. Each appointment within 24 hours gets an automated outbound reminder call.",
    detail: "No staff action required. The reminder system runs independently of the booking system. Delivery status is tracked in DynamoDB per appointment.",
    latency: "Hourly scan",
  },
]

const stackGroups = [
  {
    group: "Voice Layer",
    color: "text-orange-300",
    accent: "bg-orange-500/10 border-orange-400/30",
    dot: "bg-orange-400",
    services: [
      { name: "Amazon Connect", tag: "Telephony", desc: "Manages all inbound and outbound PSTN calls. Provides the dedicated phone number and routes calls to the Lex engine.", why: "AWS-native — no third-party telephony contracts." },
      { name: "Amazon Polly", tag: "Voice Synthesis", desc: "Converts system responses to natural-sounding speech. All confirmations, prompts, and reminders go through Polly.", why: "Neural TTS voices are indistinguishable from human speech." },
    ],
  },
  {
    group: "Intelligence Layer",
    color: "text-violet-300",
    accent: "bg-violet-500/10 border-violet-400/30",
    dot: "bg-violet-400",
    services: [
      { name: "Amazon Lex", tag: "NLU Engine", desc: "Classifies caller intent and extracts slot values — date, time, service type, name, contact — from free-form speech.", why: "Built-in slot filling eliminates 80% of custom conversation logic." },
      { name: "Amazon Bedrock", tag: "LLM Fallback", desc: "Handles edge cases outside Lex's structured intent framework — multi-intent utterances and complex rescheduling.", why: "Safety net for unusual or compound requests." },
    ],
  },
  {
    group: "Data & Compute",
    color: "text-cyan-300",
    accent: "bg-cyan-500/10 border-cyan-400/30",
    dot: "bg-cyan-400",
    services: [
      { name: "AWS Lambda", tag: "Business Logic", desc: "Calendar availability checks, booking writes, conflict detection, DynamoDB operations, and the reminder scheduling loop.", why: "Scales to zero between calls — zero idle cost." },
      { name: "DynamoDB", tag: "Database", desc: "Stores the full appointment record: caller name, number, date, time, service type, status, and reminder delivery state.", why: "Sub-millisecond reads with no operational overhead." },
      { name: "EventBridge", tag: "Scheduler", desc: "Serverless cron trigger that fires the reminder Lambda every hour. Scans DynamoDB for upcoming 24-hour window appointments.", why: "Fully managed — no EC2, no always-on process." },
    ],
  },
  {
    group: "External Integration",
    color: "text-green-300",
    accent: "bg-green-500/10 border-green-400/30",
    dot: "bg-green-400",
    services: [
      { name: "Google Calendar API", tag: "Availability", desc: "Authoritative source of truth for slot availability. All bookings write directly to Calendar — compatible with any Google Workspace clinic.", why: "Prevents double-bookings at the infrastructure level." },
    ],
  },
]

const team = [
  { name: "Satvik", role: "Team Lead", detail: "Product vision, system architecture, and overall technical direction", initials: "S", skills: ["Architecture", "Product", "AWS"] },
  { name: "Shriya", role: "AI & Backend", detail: "Amazon Lex intent design, Bedrock integration, Lambda business logic", initials: "Sh", skills: ["Lex", "Bedrock", "Lambda"] },
  { name: "Rajat", role: "Infrastructure", detail: "AWS Connect setup, DynamoDB schema, EventBridge scheduling, IAM", initials: "R", skills: ["Connect", "DynamoDB", "IAM"] },
  { name: "Khush", role: "Frontend & Voice", detail: "React dashboard, Polly voice tuning, end-to-end demo integration", initials: "K", skills: ["React", "Polly", "UI/UX"] },
]

/* ─── Animated counter hook ─── */
function useCounter(target: number, duration = 1800, trigger: boolean) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = () => {
      start += 1
      setVal(Math.min(Math.round((start / 60) * target), target))
      if (start < 60) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, trigger])
  return val
}

/* ─── Main component ─── */
export default function Home() {
  const [active, setActive] = useState(0)
  const [navY, setNavY] = useState(0)
  const sectionRefs = useRef<(HTMLElement | null)[]>([])
  const navRef = useRef<HTMLDivElement>(null)
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [messages, setMessages] = useState<Message[]>([])
  const [simKey, setSimKey] = useState("start")
  const [inputVal, setInputVal] = useState("")
  const [started, setStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  /* Animate sidebar pill to match active dot */
  useEffect(() => {
    const btn = dotRefs.current[active]
    const nav = navRef.current
    if (!btn || !nav) return
    const navRect = nav.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setNavY(btnRect.top - navRect.top)
  }, [active])

  /* Intersection observer for sections */
  useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i) },
        { threshold: 0.35 }
      )
      obs.observe(ref)
      return obs
    })
    return () => observers.forEach((o) => o?.disconnect())
  }, [])

  /* Stats counter trigger */
  useEffect(() => {
    if (!statsRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.5 }
    )
    obs.observe(statsRef.current)
    return () => obs.disconnect()
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
    setMessages([{ from: "bot", text: (sim["start"][0] as { type: "bot"; text: string }).text }])
  }

  function handleChoice(label: string, next: string) {
    const newMsgs: Message[] = [...messages, { from: "user", text: label }]
    const ns = sim[next]
    if (ns?.[0]) newMsgs.push({ from: "bot", text: (ns[0] as { type: "bot"; text: string }).text })
    setMessages(newMsgs)
    setSimKey(next)
  }

  function handleInput(next: string) {
    if (!inputVal.trim()) return
    const newMsgs: Message[] = [...messages, { from: "user", text: inputVal }]
    const ns = sim[next]
    if (ns?.[0]) newMsgs.push({ from: "bot", text: (ns[0] as { type: "bot"; text: string }).text })
    setMessages(newMsgs)
    setSimKey(next)
    setInputVal("")
  }

  const currentSteps = sim[simKey] || []
  const actionStep = currentSteps[1] as SimStep | undefined

  const noShowReduction = useCounter(40, 1600, statsVisible)
  const deskTimeRecovered = useCounter(40, 1800, statsVisible)
  const callsHandled = useCounter(150, 2000, statsVisible)

  return (
    <div className="relative">

      {/* ── Sidebar nav — desktop ── */}
      <div
        ref={navRef}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-[22px] items-end"
      >
        {/* Animated pill that slides to active dot */}
        <div
          className="absolute right-0 w-[3px] h-6 bg-red-400 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none"
          style={{ top: navY - 2, transform: "translateX(0)" }}
        />

        {sections.map((s, i) => (
          <button
            key={s}
            ref={(el) => { dotRefs.current[i] = el }}
            onClick={() => scrollTo(i)}
            className="group relative flex items-center gap-3 focus:outline-none"
          >
            {/* Label on hover */}
            <span
              className={`text-[10px] font-bold tracking-[0.15em] transition-all duration-300 ${
                active === i ? "text-white opacity-100 translate-x-0" : "text-white/30 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
              }`}
            >
              {s.toUpperCase()}
            </span>
            {/* Dot */}
            <div
              className={`rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                active === i
                  ? "w-2.5 h-2.5 bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                  : "w-1.5 h-1.5 bg-white/20 group-hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[0] = el }}
        className="relative min-h-screen overflow-hidden bg-[#0b0717]"
      >
        <div className="absolute inset-0 z-0">
          <iframe
            src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="h-full w-full"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0b0717] to-transparent z-1 pointer-events-none" />

        <nav className="relative z-10 px-6 md:px-16 py-7 flex items-center justify-between">
          <span className="text-white font-bold tracking-[0.2em] text-sm">CALLSYNC AI</span>
          <ul className="hidden md:flex gap-10 text-[11px] font-bold tracking-[0.15em] text-white/50">
            {sections.map((s, i) => (
              <li key={s} onClick={() => scrollTo(i)}
                className={`cursor-pointer transition-colors duration-200 hover:text-white ${active === i ? "text-red-300" : ""}`}>
                {s.toUpperCase()}
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 md:px-16 pt-6 md:pt-10 pb-20 gap-10 min-h-[calc(100vh-80px)]">
          <div className="max-w-xl w-full">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-px w-8 bg-red-400/60" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-300/75">
                VOICE AI · TRACK 3.3 · HACK&apos;A&apos;WAR GenAI × AWS
              </p>
            </div>
            <h1 className="mb-6 text-4xl md:text-[58px] font-bold leading-[1.05] text-white">
              YOUR RECEPTIONIST.
              <br />
              MINUS THE SALARY.
              <br />
              <span className="text-red-300 drop-shadow-[0_0_30px_rgba(239,68,68,0.45)]">
                WITH CALLSYNC AI.
              </span>
            </h1>
            <p className="mb-10 max-w-lg text-sm md:text-[15px] leading-relaxed text-white/60">
              An AI voice agent that handles appointment booking, rescheduling, and cancellations over a natural phone call. No app, no form, no hold music. Runs 24/7 with proactive reminder calls that cut no-shows by up to 40%.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <Button
                onClick={() => scrollTo(1)}
                size="lg"
                className="rounded-full bg-white px-8 text-[11px] font-bold uppercase tracking-widest text-[#12083a] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_28px_rgba(255,255,255,0.2)]"
              >
                SEE HOW IT WORKS
              </Button>
              <Button
                onClick={() => scrollTo(3)}
                size="lg"
                variant="outline"
                className="rounded-full border border-white/20 bg-transparent px-8 text-[11px] font-bold uppercase tracking-widest text-white/65 transition-all duration-300 hover:border-red-400/45 hover:text-red-300 hover:bg-white/[0.04]"
              >
                MEET THE TEAM
              </Button>
            </div>

            {/* Animated metrics */}
            <div ref={statsRef} className="flex flex-wrap gap-8">
              {[
                { val: `${noShowReduction}%`, suffix: "reduction", label: "No-show rate" },
                { val: "24/7", suffix: "", label: "Zero downtime" },
                { val: `${deskTimeRecovered}%`, suffix: "recovered", label: "Front-desk time" },
              ].map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-red-300 font-bold text-xl leading-none tabular-nums drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]">
                    {m.val}
                    {m.suffix && <span className="text-red-300/50 text-xs ml-1 font-normal">{m.suffix}</span>}
                  </span>
                  <span className="text-white/30 text-xs tracking-wide mt-1">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone image */}
          <div className="relative flex-shrink-0 animate-pulse-scale">
            <div className="relative h-[400px] w-[300px] md:h-[660px] md:w-[500px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png"
                alt="CallSync AI"
                fill
                className="object-contain"
                style={{ filter: "drop-shadow(0 0 50px rgba(239,68,68,0.6)) drop-shadow(0 0 100px rgba(239,68,68,0.3))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ══════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[1] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-violet-700/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-red-700/5 rounded-full blur-[140px]" />
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-6 bg-red-400/50" />
              <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em]">The Problem We Solve</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">HOW IT WORKS</h2>
            <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
              Scheduling friction is a silent cost centre. CallSync removes it entirely — from the first ring to confirmed booking — in under two minutes.
            </p>
          </div>

          {/* Live stat counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {[
              {
                val: `$${callsHandled}B`,
                label: "Lost annually to no-shows in US healthcare",
                sub: "Source: MGMA",
                pct: 85,
                color: "bg-red-500",
              },
              {
                val: `${deskTimeRecovered}%`,
                label: "Of front-desk time consumed by repetitive scheduling",
                sub: "Recoverable immediately",
                pct: 40,
                color: "bg-violet-500",
              },
              {
                val: `${noShowReduction}%`,
                label: "Reduction in no-shows with automated voice reminders",
                sub: "Industry benchmark",
                pct: noShowReduction,
                color: "bg-cyan-500",
              },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 group hover:border-white/[0.1] transition-all duration-300">
                <div className="text-4xl font-bold text-white tabular-nums mb-3">{s.val}</div>
                <div className="text-white/45 text-xs leading-relaxed mb-4">{s.label}</div>
                <Progress value={s.pct} className={`h-[2px] bg-white/[0.06] mb-2 [&>div]:${s.color}`} />
                <div className="text-white/20 text-[10px]">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Interactive step explorer */}
          <div className="flex items-center gap-2 mb-7">
            <div className="h-px w-6 bg-white/20" />
            <div className="text-[10px] font-bold text-white/28 tracking-[0.2em] uppercase">End-to-End Call Flow</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {/* Step list */}
            <div className="flex flex-col gap-2">
              {callSteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`group text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    activeStep === i
                      ? "bg-white/[0.05] border-red-400/30 shadow-[inset_0_0_30px_rgba(239,68,68,0.04)]"
                      : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`text-[11px] font-bold tracking-widest mt-0.5 flex-shrink-0 tabular-nums transition-colors duration-300 ${
                    activeStep === i ? "text-red-400" : "text-white/25 group-hover:text-white/40"
                  }`}>
                    {step.num}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm mb-1 transition-colors duration-300 ${
                      activeStep === i ? "text-white" : "text-white/60 group-hover:text-white/75"
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-white/35 text-xs leading-relaxed">{step.desc}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 text-[9px] border-white/[0.08] bg-transparent text-white/25 transition-all duration-300 ${
                      activeStep === i ? "border-red-400/30 text-red-300/60" : ""
                    }`}
                  >
                    {step.latency}
                  </Badge>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            <div className="sticky top-24 h-fit">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 min-h-[260px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[11px] font-bold tracking-widest text-red-400/80 tabular-nums">
                      STEP {callSteps[activeStep].num}
                    </span>
                    <Separator orientation="vertical" className="h-4 bg-white/10" />
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">
                      {callSteps[activeStep].latency}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{callSteps[activeStep].title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{callSteps[activeStep].detail}</p>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  {callSteps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`h-0.5 rounded-full transition-all duration-300 ${
                        activeStep === i ? "bg-red-400 w-8" : "bg-white/15 w-3 hover:bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live conversation demo */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-white/20" />
            <div className="text-[10px] font-bold text-white/28 tracking-[0.2em] uppercase">Live Conversation Demo</div>
          </div>
          <p className="text-white/30 text-xs mb-8">
            Walk through the booking flow exactly as a caller would. Production runs over a live phone call — speech in, Polly voice out.
          </p>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Feature list */}
            <div className="flex-1 min-w-0">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                <div className="text-white/25 text-[10px] uppercase tracking-widest mb-5">What this demonstrates</div>
                <div className="space-y-4">
                  {[
                    { label: "Natural language", desc: "Intent captured regardless of how the caller phrases it" },
                    { label: "Multi-turn context", desc: "Prior answers retained across every exchange" },
                    { label: "Slot validation", desc: "Every detail confirmed before the booking commits" },
                    { label: "Automated reminder", desc: "Outbound call placed 24 hours before the appointment" },
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-px h-full bg-white/[0.07] self-stretch flex-shrink-0 mt-1" />
                      <div>
                        <div className="text-white/70 text-xs font-bold mb-0.5">{f.label}</div>
                        <div className="text-white/35 text-xs">{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="w-full md:w-72 flex-shrink-0 mx-auto md:mx-0">
              <div className="bg-[#0d0820] rounded-[2.5rem] border border-white/10 shadow-[0_0_60px_rgba(120,68,255,0.08)] overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <div className="text-white/30 text-xs">9:41</div>
                  <div className="w-20 h-5 bg-black/60 rounded-full" />
                  <div className="text-white/30 text-xs">●●●</div>
                </div>
                <div className="text-center pb-3 border-b border-white/[0.05]">
                  <div className="text-white/35 text-[10px] uppercase tracking-widest">CallSync AI</div>
                  <div className={`text-[10px] mt-1 transition-colors duration-300 ${started ? "text-green-400/70" : "text-white/20"}`}>
                    {started ? "● Connected" : "● Idle"}
                  </div>
                </div>
                <div className="h-64 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  {!started && (
                    <div className="flex-1 flex items-center justify-center h-full">
                      <p className="text-white/20 text-xs text-center px-4">Tap start to begin the demo</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        m.from === "bot"
                          ? "bg-white/[0.05] text-white/70 rounded-tl-sm"
                          : "bg-red-500/15 text-white/70 rounded-tr-sm border border-red-400/20"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="px-4 pb-6 pt-3 border-t border-white/[0.05] min-h-[80px] flex items-center">
                  {!started ? (
                    <button onClick={startSim} className="w-full py-2 rounded-full bg-red-500/12 border border-red-400/28 text-red-300 text-[11px] font-bold tracking-widest hover:bg-red-500/20 transition-all duration-300">
                      START DEMO CALL
                    </button>
                  ) : actionStep?.type === "choices" ? (
                    <div className="flex flex-wrap gap-2 justify-center w-full">
                      {(actionStep as { type: "choices"; options: { label: string; next: string }[] }).options.map((opt) => (
                        <button key={opt.label} onClick={() => handleChoice(opt.label, opt.next)}
                          className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 text-xs hover:border-red-400/40 hover:text-red-300 transition-all duration-300">
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : actionStep?.type === "input" ? (
                    <div className="flex gap-2 w-full">
                      <input value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)}
                        placeholder={(actionStep as { type: "input"; placeholder: string; next: string }).placeholder}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1.5 text-white/70 text-xs placeholder:text-white/20 outline-none focus:border-red-400/40" />
                      <button onClick={() => handleInput((actionStep as { type: "input"; placeholder: string; next: string }).next)}
                        className="w-8 h-8 rounded-full bg-red-500/18 border border-red-400/28 text-red-300 flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 text-sm flex-shrink-0">
                        →
                      </button>
                    </div>
                  ) : actionStep?.type === "end" ? (
                    <button onClick={startSim} className="w-full py-2 rounded-full bg-white/[0.03] border border-white/10 text-white/40 text-xs hover:border-red-400/28 hover:text-red-300 transition-all duration-300">
                      TRY AGAIN
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — ARCHITECTURE
      ══════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[2] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-indigo-700/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-red-700/5 rounded-full blur-[140px]" />
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-6 bg-red-400/50" />
              <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em]">AWS-Native Architecture</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">ARCHITECTURE</h2>
            <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
              Every service chosen for a specific reason. No unnecessary dependencies. Entirely serverless with one external integration — Google Calendar.
            </p>
          </div>

          {/* Architecture flow diagram */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-6 bg-white/15" />
            <div className="text-[10px] font-bold text-white/25 tracking-[0.2em] uppercase">System Architecture</div>
          </div>
          <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-6 md:p-8 overflow-x-auto mb-14">
            <div className="min-w-[640px] space-y-5">
              {[
                {
                  label: "Inbound",
                  nodes: [
                    { text: "CALLER", c: "border-white/20 text-white/60 bg-white/[0.025]" },
                    { text: "Connect", c: "border-orange-400/40 text-orange-300/80 bg-orange-500/[0.06]" },
                    { text: "Lex", c: "border-blue-400/40 text-blue-300/80 bg-blue-500/[0.06]" },
                    { text: "Lambda", c: "border-yellow-400/40 text-yellow-300/80 bg-yellow-500/[0.06]" },
                  ],
                },
                {
                  label: "Services",
                  indent: true,
                  nodes: [
                    { text: "DynamoDB", c: "border-cyan-400/40 text-cyan-300/80 bg-cyan-500/[0.06]", arrow: "↕" },
                    { text: "Calendar", c: "border-green-400/40 text-green-300/80 bg-green-500/[0.06]", arrow: "↕" },
                    { text: "Bedrock", c: "border-purple-400/40 text-purple-300/80 bg-purple-500/[0.06]", arrow: "↕" },
                  ],
                },
                {
                  label: "Response",
                  nodes: [
                    { text: "Polly", c: "border-green-400/40 text-green-300/80 bg-green-500/[0.06]" },
                    { text: "Connect", c: "border-orange-400/40 text-orange-300/80 bg-orange-500/[0.06]" },
                    { text: "CALLER", c: "border-white/20 text-white/60 bg-white/[0.025]" },
                  ],
                },
                {
                  label: "Reminders",
                  nodes: [
                    { text: "EventBridge", c: "border-red-400/40 text-red-300/80 bg-red-500/[0.06]" },
                    { text: "Lambda", c: "border-yellow-400/40 text-yellow-300/80 bg-yellow-500/[0.06]" },
                    { text: "Connect", c: "border-orange-400/40 text-orange-300/80 bg-orange-500/[0.06]" },
                    { text: "CALLER", c: "border-white/20 text-white/60 bg-white/[0.025]" },
                  ],
                },
              ].map((row) => (
                <div key={row.label} className={`flex items-center gap-3 ${(row as {indent?: boolean}).indent ? "pl-28" : ""}`}>
                  {!(row as {indent?: boolean}).indent && (
                    <div className="text-white/22 text-[10px] uppercase tracking-widest w-20 flex-shrink-0">{row.label}</div>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {row.nodes.map((n, ni) => (
                      <div key={ni} className="flex items-center gap-2">
                        {(n as {arrow?: string}).arrow && <span className="text-red-400/25 text-xs">{(n as {arrow?: string}).arrow}</span>}
                        <div className={`rounded-xl border px-3 py-2 text-center text-[10px] font-bold leading-snug hover:scale-105 transition-all duration-200 cursor-default ${n.c}`}>
                          {n.text}
                        </div>
                        {!(n as {arrow?: string}).arrow && ni < row.nodes.length - 1 && (
                          <span className="text-red-400/25 text-sm font-bold">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service breakdown with tabs */}
          <div className="flex items-center gap-2 mb-7">
            <div className="h-px w-6 bg-white/15" />
            <div className="text-[10px] font-bold text-white/25 tracking-[0.2em] uppercase">Service Breakdown</div>
          </div>

          <Tabs defaultValue="Voice Layer" className="mb-14">
            <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6 h-auto flex-wrap gap-1">
              {stackGroups.map((g) => (
                <TabsTrigger
                  key={g.group}
                  value={g.group}
                  className="text-[10px] font-bold tracking-widest uppercase rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/35 hover:text-white/60 transition-all duration-200"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${g.dot}`} />
                  {g.group}
                </TabsTrigger>
              ))}
            </TabsList>

            {stackGroups.map((g) => (
              <TabsContent key={g.group} value={g.group} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {g.services.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => setExpandedService(expandedService === s.name ? null : s.name)}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                        expandedService === s.name
                          ? `${g.accent} shadow-[0_0_30px_rgba(0,0,0,0.3)]`
                          : "bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.035]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" className={`text-[9px] border-white/[0.08] bg-transparent ${expandedService === s.name ? g.color : "text-white/30"} transition-colors duration-300`}>
                          {s.tag}
                        </Badge>
                        <span className={`text-[10px] transition-all duration-300 ${expandedService === s.name ? "text-white/40 rotate-180" : "text-white/20"}`}>
                          ▾
                        </span>
                      </div>
                      <div className={`font-bold text-sm mb-2 transition-colors duration-300 ${expandedService === s.name ? "text-white" : "text-white/55"}`}>
                        {s.name}
                      </div>
                      <div className="text-white/35 text-xs leading-relaxed mb-3">{s.desc}</div>
                      {expandedService === s.name && (
                        <div className={`border-t border-white/[0.08] pt-3 mt-1 transition-all duration-300`}>
                          <span className={`text-[10px] font-bold ${g.color} opacity-70`}>Why: </span>
                          <span className="text-white/35 text-[10px]">{s.why}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Differentiator */}
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 md:p-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-red-400/55 text-[10px] uppercase tracking-[0.2em] mb-3">Our Differentiator</div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  We don&apos;t just book.{" "}
                  <span className="text-red-300">We follow up.</span>
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">
                  Most comparable solutions stop at inbound booking. CallSync adds a proactive outbound reminder loop — EventBridge fires a Lambda hourly, placing automated calls to patients 24 hours before their appointment. No staff action required.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: "−40%", label: "No-show rate", pct: 40 },
                  { val: "24h", label: "Lead time", pct: 100 },
                  { val: "0", label: "Staff required", pct: 0 },
                ].map((s) => (
                  <div key={s.val} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-center">
                    <div className="text-xl font-bold text-red-300 mb-1">{s.val}</div>
                    <div className="text-white/30 text-[10px] leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — TEAM
      ══════════════════════════════════════ */}
      <section
        ref={(el) => { sectionRefs.current[3] = el }}
        className="relative min-h-screen bg-[#0b0717] overflow-hidden flex items-center"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-50 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 px-6 md:px-16 py-20 max-w-7xl mx-auto w-full">
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-6 bg-red-400/50" />
              <p className="text-red-400/60 text-[11px] uppercase tracking-[0.2em]">
                HACK&apos;A&apos;WAR GenAI × AWS · RIT Bengaluru
              </p>
              <div className="h-px w-6 bg-red-400/50" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">THE TEAM</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
              Four students from RIT Bengaluru. Track 3.3 — Voice AI. 24-hour hackathon.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 mb-16">
            {team.map((m) => (
              <div
                key={m.name}
                className="group bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 md:p-7 hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 font-bold text-sm tracking-wide mx-auto mb-5 group-hover:border-red-400/25 group-hover:text-red-300/70 transition-all duration-300">
                  {m.initials}
                </div>
                <div className="text-center mb-4">
                  <div className="text-white font-bold text-base tracking-wide mb-1">{m.name}</div>
                  <div className="text-red-300/55 text-[10px] font-bold uppercase tracking-[0.18em]">{m.role}</div>
                </div>
                <div className="text-white/28 text-xs leading-relaxed text-center mb-4">{m.detail}</div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {m.skills.map((sk) => (
                    <Badge key={sk} variant="outline" className="text-[9px] border-white/[0.06] bg-white/[0.025] text-white/30 group-hover:border-red-400/20 group-hover:text-red-300/45 transition-all duration-300">
                      {sk}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom credit */}
          <div className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-white/20 text-[10px] uppercase tracking-widest mb-2">Built for</div>
                <div className="text-2xl font-bold text-white mb-1">HACK&apos;A&apos;WAR GenAI × AWS</div>
                <div className="text-white/35 text-sm">Track 3.3 — Voice AI · RIT Bengaluru · 24 hours</div>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-5">
                {["Connect", "Lex", "Bedrock", "Polly", "Lambda", "DynamoDB"].map((s) => (
                  <div key={s} className="text-white/18 text-xs font-bold tracking-wide hover:text-red-300/60 transition-colors duration-300 cursor-default">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
