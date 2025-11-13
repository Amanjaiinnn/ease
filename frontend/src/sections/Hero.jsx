import React from 'react'

export default function Hero({ onOpen }) {
  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#0e1b2b]">Ease</div>
        <div className="flex items-center gap-3">
       
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="pt-10">
            <h1 className="text-6xl md:text-[80px] leading-tight font-extrabold text-[#0e1b2b]">
              it's not therapy.
              <br />
              it's just Ease.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-xl">
              your wise, witty ai built to help you explore your thoughts, emotions, and behaviors.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <button
                onClick={() => onOpen && onOpen()}
                className="inline-flex items-center gap-3 bg-rose-200 hover:bg-rose-500 text-[#0e1b2b] px-5 py-3 rounded-lg font-semibold shadow"
              >
                <span>start yapping —</span>
                <span className="text-sm text-neutral-700">it's free</span>
              </button>
              <div className="text-sm text-neutral-500">loved by people</div>
            </div>
          </div>

          <div className="pt-10">
            <div className="bg-white rounded-xl shadow-lg p-8 overflow-hidden">
              <div className="rounded-lg bg-neutral-50 p-8">
                <div className="flex flex-col items-center">
                  <div className="text-sm text-neutral-400 mb-4">connecting...</div>

                  <div className="w-40 h-40 rounded-full bg-rose-400 shadow-inner" />

                  <div className="mt-8 text-neutral-500 text-center max-w-[420px]">
                    okay, so it sounds like you're pretty in your feels right now. what's got you feeling shook today? let's dive in and vibe-check this together.
                  </div>

                  <div className="mt-8 flex items-center gap-6">
                    <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 9l6 6M15 9l-6 6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>

                    <button className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center shadow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#0e1b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>

                    <button className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shadow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}
