import React from 'react'

const cards = [
  { text: "i'm... speechless. i used this for less than 5 minutes and i'm already crying. i really needed this. thank you so much.", handle: "@mvggotz" },
  { text: "that shit works a little bit too well.", handle: "@_rose_boy_1029" },
  { text: "this ateeeee.", handle: "@aflynaaa" },
  { text: "i tried it and i can genuinely say—this is insane. i'm so amused by how good the ai is.", handle: "@user" },
  { text: "to be honest, i gave it a try and it's really good. i feel better now.", handle: "@someone" },
  { text: "guys, it works, i swear. this made my day.", handle: "@happy" },
]

export default function Testimonials(){
  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {cards.map((c, i) => (
        <div key={i} className="bg-neutral-100 p-6 rounded-xl min-h-[160px]">
          <p className="text-lg leading-relaxed font-serif text-[#0e1b2b]">{`"${c.text}"`}</p>
          <div className="mt-4 text-sm text-neutral-500">{c.handle}</div>
        </div>
      ))}
    </div>
  )
}
