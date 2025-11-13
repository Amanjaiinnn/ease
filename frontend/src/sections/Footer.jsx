import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-20 py-12 text-neutral-700">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 px-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-400 rounded-full" />
          <div className="font-semibold">Ease</div>
        </div>

        <div className="flex justify-center">
          <div>
            <div className="font-semibold mb-2">socials</div>
            <div className="text-sm text-neutral-600">instagram</div>
            <div className="text-sm text-neutral-600">facebook</div>
            <div className="text-sm text-neutral-600">x (twitter)</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-neutral-500">© 2025 Ease inc</div>
          <div className="text-sm text-neutral-500">by Group13 CSE1</div>
        </div>
      </div>
    </footer>
  )
}
