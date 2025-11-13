import React, {useState} from 'react'
import axios from 'axios'
import { setToken } from '../auth'

export default function Signup({ onDone }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  async function submit(e){
    e.preventDefault()
    try{
      const res = await axios.post('http://localhost:4000/api/signup',{ email, password })
      setToken(res.data.token)
      onDone(res.data.userId)
    }catch(err){ setError(err.response?.data?.error || 'Error') }
  }
  return (
    <div className='signup-panel'>
      <h2 className='font-extrabold text-center'>create your account</h2>
      <p className='text-center text-rose-600 mb-4'>join and get started. It only takes a moment.</p>
      {error && <div className='text-red-600 mb-2'>{error}</div>}
      <form onSubmit={submit} className='space-y-4'>
        <div><label className='block text-sm mb-1'>Email</label><input required className='w-full p-3 rounded border' value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label className='block text-sm mb-1'>Password</label><input required type='password' className='w-full p-3 rounded border' value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className='w-full py-3 rounded-xl bg-rose-300 font-bold'>create account</button>
      </form>
      <p className='text-center text-sm mt-3'>already have an account? <a className='underline' href='#' onClick={(e)=>{e.preventDefault(); window.location.hash='signin'}}>log in</a></p>
    </div>
  )
}
