import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Onboard from './pages/Onboard'
import Therapist from './pages/Therapist'
import { getToken, clearToken } from './auth'

export default function App(){
  const [route, setRoute] = useState('home')
  const [userId, setUserId] = useState(null)
  useEffect(()=>{
    // route by hash for quick demo
    const h = window.location.hash.replace('#','')
    if(h) setRoute(h)
    const onHash = ()=> setRoute(window.location.hash.replace('#','') || 'home')
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  useEffect(()=>{
    const t = getToken()
    if(t){
      // when token present, load me or go to home
    }
  },[])

  const go = (r) => { setRoute(r); window.location.hash = r; }

  return (
    <div className='min-h-screen bg-[var(--bg,#fbf7f3)] text-[var(--deep,#3d221b)] font-poppins'>
      <header className='flex items-center justify-between px-10 py-6'>
        <div className='text-2xl font-bold'>Ease</div>
        <nav className='space-x-4 flex items-center text-sm text-rose-600'>
          <button className='px-3 py-2 rounded' onClick={()=>go('home')}>Home</button>
          {!getToken() && <><button className='px-3 py-2 rounded' onClick={()=>go('signup')}>Get started</button>
          <button className='px-3 py-2 rounded' onClick={()=>go('signin')}>Sign in</button></>}
          {getToken() && <button className='px-3 py-2 rounded' onClick={()=>{ clearToken(); go('home'); }}>Logout</button>}
          {getToken() && <button className='px-3 py-2 rounded bg-rose-200' onClick={()=>go('therapist')}>Open Therapist</button>}
        </nav>
      </header>

      <main className='p-8'>
        {route==='home' && <Home onOpen={()=>go('therapist')} />}
        {route==='signup' && <Signup onDone={(id)=>{ setUserId(id); go('onboard-step1') }} />}
        {route==='signin' && <Signin onDone={(id)=>{ setUserId(id); go('home') }} />}
        {route.startsWith('onboard') && <Onboard onDone={()=>go('home')} step={route.split('-')[1]||'step1'} />}
        {route==='therapist' && <Therapist />}
      </main>
    </div>
  )
}
