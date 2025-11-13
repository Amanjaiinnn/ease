import React from 'react'
import Hero from '../sections/Hero'
import Showcase from '../sections/Showcase'
import Testimonials from '../sections/Testimonials'
import Faq from '../sections/Faq'
import Footer from '../sections/Footer'
import CookieBar from '../sections/CookieBar'

export default function Home({ onOpen }) {
  return (
    <div className="min-h-screen bg-white text-[#0e1b2b]">
      <Hero onOpen={onOpen} />

      <main className="max-w-7xl mx-auto px-6 md:px-10">
        <Showcase />

        <section className="mt-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight">all the good stuff</h2>
          <p className="mt-4 text-center text-neutral-600 max-w-2xl mx-auto">whenever, wherever — Ease is ready 24/7 to listen and help you process what’s on your mind.</p>

          <div className="mt-8">
            <Testimonials />
          </div>
        </section>

        <section className="mt-20">
          <Faq />
        </section>

        <section className="mt-28 text-center">
          <h3 className="text-4xl font-extrabold">get started for free</h3>
          <p className="mt-3 text-neutral-600">be heard. be understood. be better.</p>
          <button
            className="mt-8 inline-block bg-rose-400 hover:bg-rose-500 text-[#0e1b2b] font-semibold px-8 py-3 rounded-lg shadow"
            onClick={() => onOpen && onOpen()}
          >
            try Ease free
          </button>
        </section>

        <Footer />
      </main>

      <CookieBar />
    </div>
  )
}
