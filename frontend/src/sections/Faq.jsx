import React, { useState } from 'react'

const faqs = [
  { q: "what is Ease?", a: "Ease is a conversational AI built to help you process emotions, reflect and get small practical steps." },
  { q: "how does Ease work?", a: "You can speak or type. Ease listens, reflects, and offers prompts to help clarify feelings." },
  { q: "is Ease a replacement for traditional therapy?", a: "No. Ease helps with everyday support but is not a replacement for professional therapy." },
  { q: "is my data secure and confidential?", a: "We store your sessions securely; check the privacy policy for details." },
  { q: "does Ease support multiple languages?", a: "Currently English-first; multilingual support is being added." },
]

export default function Faq(){
  const [open, setOpen] = useState(null)
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-center">frequently asked questions</h2>
      <div className="mt-8 divide-y divide-neutral-200">
        {faqs.map((f, i) => (
          <div key={i} className="py-4">
            <button className="w-full text-left flex items-center justify-between" onClick={() => setOpen(open===i ? null : i)}>
              <div className="text-lg font-medium text-[#0e1b2b]">{f.q}</div>
              <div className="text-neutral-400">{open===i ? "▴" : "▾"}</div>
            </button>
            {open===i && <div className="mt-3 text-neutral-600">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
