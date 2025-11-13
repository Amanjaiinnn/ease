import React, { useState, useEffect } from 'react'

export default function CookieBar(){
  const [accepted, setAccepted] = useState(true)
  useEffect(() => {
    const s = localStorage.getItem('cookies-accepted')
    if(!s) setAccepted(false)
  },[])
  function accept(){
    localStorage.setItem('cookies-accepted','1')
    setAccepted(true)
  }
  function reject(){
    localStorage.setItem('cookies-accepted','0')
    setAccepted(true)
  }
  if(accepted) return null
  return (
    <div className="fixed left-0 right-0 bottom-0 bg-white border-t shadow-lg p-4 flex items-center justify-between gap-4">
      <div className="text-neutral-600">we use cookies (yummy) to improve your experience. essential cookies are always active. <a className="underline">manage preferences</a></div>
      <div className="flex gap-3">
        <button onClick={reject} className="px-4 py-2 rounded-lg bg-neutral-900 text-white">reject all</button>
        <button onClick={accept} className="px-4 py-2 rounded-lg bg-rose-400 text-[#0e1b2b]">accept all</button>
      </div>
    </div>
  )
}
