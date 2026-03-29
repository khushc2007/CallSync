"use client"
import { useState } from "react"
import Link from "next/link"
import Nav from "@/components/nav"

const steps = [
  { icon: "📞", title: "Caller Dials", desc: "Customer calls your dedicated number. No app, no internet required." },
  { icon: "🎙️", title: "AI Listens", desc: "Amazon Lex powered by Bedrock understands natural speech instantly." },
  { icon: "📋", title: "Slots Collected", desc: "AI asks for date, time, service type, name, and phone number." },
  { icon: "📅", title: "Calendar Checked", desc: "Lambda checks Google Calendar in real-time. No double bookings." },
  { icon: "✅", title: "Booking Confirmed", desc: "Saved to DynamoDB. Caller hears confirmation via Amazon Polly." },
  { icon: "🔔", title: "Reminder Sent", desc: "System calls the customer 24hrs before. Zero no-shows." },
]

type SimStep =
  | { type: "bot"; text: string }
  | { type: "choices"; options: { label: string; next: string }[] }
  | { type: "input"; placeholder: string; next: string }
  | { type: "end" }

const sim: Record<string, SimStep[]> = {
  start: [
    { type: "bot", text: "Hi! I am CallSync AI. Would you like to book, reschedule, or cancel?" },
    { type: "choices", options: [{ label: "Book", next: "book1" }, { label: "Reschedule", next: "reschedule" }, { label: "Cancel", next: "cancel" }] },
  ],
  book1: [
    { type: "bot", text: "Great! What date works for you?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "book2" }, { label: "This Week", next: "book2" }, { label: "Next Week", next: "book2" }] },
  ],
  book2: [
    { type: "bot", text: "I have 2PM and 4PM available. Which works better?" },
    { type: "choices", options: [{ label: "2PM", next: "book3" }, { label: "4PM", next: "book3" }] },
  ],
  book3: [
    { type: "bot", text: "Perfect. What is your name?" },
    { type: "input", placeholder: "Enter your name...", next: "book4" },
  ],
  book4: [
    { type: "bot", text: "Booked! You will receive a reminder call 24 hours before your appointment. Goodbye!" },
    { type: "end" },
  ],
  reschedule: [
    { type: "bot", text: "I found your appointment. What is the new date?" },
    { type: "choices", options: [{ label: "Tomorrow", next: "reschedule2" }, { label: "Next Week", next: "reschedule2" }] },
  ],
  reschedule2: [
    { type: "bot", text: "Done! Your appointment has been rescheduled. You will receive an updated reminder. Goodbye!" },
    { type: "end" },
  ],
  cancel: [
    { type: "bot", text: "Are you sure you want to cancel your appointment?" },
    { type: "choices", options: [{ label: "Yes, cancel", next: "cancel2" }, { label: "No, keep it", next: "start" }] },
  ],
  cancel2: [
    { type: "bot", text: "Your appointment has been cancelled. Sorry to see you go. Goodbye!" },
    { type: "end" },
  ],
}

type Message = { from: "bot" | "user"; text: string }

export default function HowItWorks() {
  const [messages, setMessages] = useState<Message[]>([])
  const [simKey, setSimKey] = useState("start")
  const [inputVal, setInputVal] = useState("")
  const [started, setStarted] = useState(false)

  function startSim() {
    setStarted(true)
    setSimKey("start")
    setMessages([])
    const firstBot = sim["start"][0] as { type: "bot"; text: string }
    setMessages([{ from: "bot", text: firstBot.text }])
  }

  function handleChoice(label: string, next: string) {
    const newMsgs: Message[] = [...messages, { from: "user", text: label }]
    const nextSteps = sim[next]
    if (nextSteps) {
      const botStep = nextSteps[0] as { type: "bot"; text: string }
      newMsgs.push({ from: "bot", text: botStep.text })
    }
    setMessages(newMsgs)
    setSimKey(next)
  }

  function handleInput(next: string) {
    if (!inputVal.trim()) return
    const newMsgs: Message[] = [...messages, { from: "user", text: inputVal }]
    const nextSteps = sim[next]
    if (nextSteps) {
      const botStep = nextSteps[0] as { type: "bot"; text: string }
      newMsgs.push({ from: "bot", text: botStep.text })
    }
    setMessages(newMsgs)
    setSimKey(next)
    setInputVal("")
  }

  const currentSteps = sim[simKey] || []
  const actionStep = currentSteps[1] as SimStep | undefined

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#5B4B8A] via-[#7B5B8A] to-[#8B6B9A]">
      {/* Subtle bg */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Nav />

        <div className="px-6 md:px-16 py-12 max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-red-300 text-sm uppercase tracking-widest mb-3">Track 3.3 — Voice AI</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">HOW IT WORKS</h1>
            <p className="text-white/60 text-base max-w-xl mx-auto">From the first ring to the confirmed booking — in under two minutes.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
            {[
              { val: "$150B", label: "Lost annually in the US healthcare system due to no-shows alone" },
              { val: "40%", label: "Of front desk time spent on repetitive scheduling calls" },
              { val: "30–40%", label: "Reduction in no-shows when automated reminders are used" },
            ].map((s) => (
              <div key={s.val} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-red-400/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-red-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] mb-3">{s.val}</div>
                <div className="text-white/60 text-sm leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Call flow */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-12 tracking-wide">THE CALL FLOW</h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 flex-1">
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-3 group-hover:border-red-400/60 group-hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all duration-300 hover:scale-110">
                      {step.icon}
                    </div>
                    <div className="text-white text-xs font-bold tracking-wide mb-1">{step.title}</div>
                    <div className="text-white/50 text-xs max-w-[100px] leading-tight hidden md:block">{step.desc}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block text-red-400/60 text-xl font-bold mx-1">→</div>
                  )}
                  {i < steps.length - 1 && (
                    <div className="md:hidden text-red-400/60 text-xl font-bold rotate-90">→</div>
                  )}
                </div>
              ))}
            </div>
            {/* Mobile step descriptions */}
            <div className="mt-8 grid grid-cols-1 gap-3 md:hidden">
              {steps.map((step, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                  <span className="text-xl">{step.icon}</span>
                  <div>
                    <div className="text-white text-sm font-bold mb-1">{step.title}</div>
                    <div className="text-white/50 text-xs">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulator */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-wide">TRY THE DEMO</h2>
            <p className="text-white/50 text-sm text-center mb-10">Click through a live booking conversation</p>

            <div className="max-w-sm mx-auto">
              {/* Phone frame */}
              <div className="relative bg-[#1a0f3a] rounded-[2.5rem] border-2 border-white/20 shadow-[0_0_60px_rgba(239,68,68,0.2),0_0_120px_rgba(139,91,154,0.2)] overflow-hidden">
                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2">
                  <div className="text-white/40 text-xs">9:41</div>
                  <div className="w-20 h-5 bg-black rounded-full" />
                  <div className="text-white/40 text-xs">●●●</div>
                </div>

                {/* Call header */}
                <div className="text-center pb-3 border-b border-white/10">
                  <div className="text-white/50 text-xs uppercase tracking-widest">CallSync AI</div>
                  <div className="text-green-400 text-xs mt-1">● Connected</div>
                </div>

                {/* Messages */}
                <div className="h-72 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                  {!started && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-white/30 text-xs text-center">Press start to try the booking demo</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        m.from === "bot"
                          ? "bg-white/10 text-white rounded-tl-sm"
                          : "bg-red-500/30 text-white rounded-tr-sm border border-red-400/30"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action area */}
                <div className="px-4 pb-6 pt-3 border-t border-white/10 min-h-[80px]">
                  {!started ? (
                    <button
                      onClick={startSim}
                      className="w-full py-2 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold tracking-wide hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300"
                    >
                      START DEMO CALL
                    </button>
                  ) : actionStep?.type === "choices" ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {actionStep.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => handleChoice(opt.label, opt.next)}
                          className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : actionStep?.type === "input" ? (
                    <div className="flex gap-2">
                      <input
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleInput((actionStep as {type:"input";placeholder:string;next:string}).next)}
                        placeholder={(actionStep as {type:"input";placeholder:string;next:string}).placeholder}
                        className="flex-1 bg-white/5 border border-white/20 rounded-full px-3 py-1.5 text-white text-xs placeholder:text-white/30 outline-none focus:border-red-400/60"
                      />
                      <button
                        onClick={() => handleInput((actionStep as {type:"input";placeholder:string;next:string}).next)}
                        className="w-8 h-8 rounded-full bg-red-500/30 border border-red-400/40 text-red-300 flex items-center justify-center hover:bg-red-500/50 transition-all duration-300 text-xs"
                      >
                        →
                      </button>
                    </div>
                  ) : actionStep?.type === "end" ? (
                    <button
                      onClick={startSim}
                      className="w-full py-2 rounded-full bg-white/5 border border-white/20 text-white/60 text-xs hover:border-red-400/40 hover:text-red-300 transition-all duration-300"
                    >
                      TRY AGAIN
                    </button>
                  ) : null}
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
            <Link href="/tech-stack">
              <button className="px-8 py-3 rounded-full border-2 border-white/20 text-white text-sm font-bold tracking-wide hover:border-red-400 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300">
                VIEW TECH STACK →
              </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
