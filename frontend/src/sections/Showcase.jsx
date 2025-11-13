import React from 'react'

export default function Showcase() {
  return (
    <section className="mt-8">
      <div className="bg-neutral-50 rounded-xl p-8 md:p-12 shadow-inner">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-3xl font-bold">whenever, wherever</h3>
            <p className="mt-4 text-neutral-600">never need a friend at 3 a.m. again. just start yapping with Ease, your conversational ai for wellbeing that’s ready 24/7.</p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-md">
              <div className="flex flex-col items-center">
                <div className="text-xs text-neutral-400 mb-2">listening...</div>
                <div className="w-28 h-28 rounded-full bg-rose-400" />
                <div className="mt-4 text-xs text-neutral-400">(waveform placeholder)</div>

                <div className="mt-6 flex items-center gap-4">
                  <button className="w-9 h-9 rounded-full bg-neutral-100 shadow">🔈</button>
                  <button className="w-10 h-10 rounded-full bg-rose-200 shadow">⏹</button>
                  <button className="w-9 h-9 rounded-full bg-neutral-100 shadow">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </section>
  )
}
