import React, {useState} from 'react'
import axios from 'axios'
import { setToken } from '../auth'

export default function Signin({ onDone }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  async function submit(e){
    e.preventDefault()
    try{
      const res = await axios.post('http://localhost:4000/api/login',{ email, password })
      setToken(res.data.token)
      onDone(res.data.userId)
    }catch(err){ setError(err.response?.data?.error || 'Error') }
  }
  return (
    <div className='signup-panel'>
      <h2 className='font-extrabold text-center'>Sign in</h2>
      {error && <div className='text-red-600 mb-2'>{error}</div>}
      <form onSubmit={submit} className='space-y-4'>
        <div><label className='block text-sm mb-1'>Email</label><input required className='w-full p-3 rounded border' value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label className='block text-sm mb-1'>Password</label><input required type='password' className='w-full p-3 rounded border' value={password} onChange={e=>setPassword(e.target.value)} /></div>
        <button className='w-full py-3 rounded-xl bg-rose-300 font-bold'>Sign in</button>
      </form>
    </div>
  )
}
