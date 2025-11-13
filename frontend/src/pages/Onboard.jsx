import React, {useState} from 'react'
import axios from 'axios'
import { authHeader } from '../auth'

export default function Onboard({ step='step1', onDone }){
  const [fullName,setFullName]=useState('')
  const [ageGroup,setAgeGroup]=useState('18-24')
  const [relationship,setRelationship]=useState('single')
  const [concerns,setConcerns]=useState('')
  const [sleepHours,setSleepHours]=useState('7')
  const [dailyMood,setDailyMood]=useState('okay')

  async function saveProfile(data){
    await axios.post('http://localhost:4000/api/onboard', { profile: data }, { headers: authHeader() })
  }

  async function next(){
    if(step==='step1'){
      await saveProfile({ fullName, ageGroup })
      window.location.hash = 'onboard-step2'
    } else if(step==='step2'){
      await saveProfile({ relationship, concerns })
      window.location.hash = 'onboard-step3'
    } else if(step==='step3'){
      await saveProfile({ sleepHours, dailyMood })
      onDone && onDone()
    }
  }

  return (
    <div className='max-w-3xl mx-auto'>
      <h2 className='text-2xl font-bold mb-2'>Welcome to Ease</h2>
      <p className='text-rose-400 mb-4'>Tell us a little about yourself so we can personalise your experience.</p>
      <div className='progress-track mb-6'><div className='progress-fill' style={{width: step==='step1'?'33%':step==='step2'?'66%':'100%'}}></div></div>

      {step==='step1' && (
        <div className='bg-white p-6 rounded-lg border'>
          <div className='mb-4'><label className='block mb-1 font-medium'>Full name</label><input className='w-full p-3 rounded border' value={fullName} onChange={e=>setFullName(e.target.value)} /></div>
          <div className='mb-4'><label className='block mb-2 font-medium'>Age group</label><select className='p-2 rounded border' value={ageGroup} onChange={e=>setAgeGroup(e.target.value)}><option>Under 18</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45+</option></select></div>
          <div className='flex justify-end'><button className='px-6 py-3 rounded bg-rose-300 font-bold' onClick={next}>Next</button></div>
        </div>
      )}

      {step==='step2' && (
        <div className='bg-white p-6 rounded-lg border'>
          <div className='mb-4'><label className='block mb-1 font-medium'>Relationship status</label><select className='p-2 rounded border' value={relationship} onChange={e=>setRelationship(e.target.value)}><option>single</option><option>in_relationship</option><option>married</option><option>prefer_not</option></select></div>
          <div className='mb-4'><label className='block mb-1 font-medium'>Concerns</label><input className='w-full p-3 rounded border' value={concerns} onChange={e=>setConcerns(e.target.value)} placeholder='Anxiety, Sleep, Relationships' /></div>
          <div className='flex justify-between'><button className='px-4 py-2 border rounded' onClick={()=>{ window.location.hash='onboard-step1' }}>Back</button><button className='px-6 py-3 rounded bg-rose-300 font-bold' onClick={next}>Next</button></div>
        </div>
      )}

      {step==='step3' && (
        <div className='bg-white p-6 rounded-lg border'>
          <div className='mb-4'><label className='block mb-1 font-medium'>Hours of sleep (avg)</label><input className='w-full p-3 rounded border' value={sleepHours} onChange={e=>setSleepHours(e.target.value)} /></div>
          <div className='mb-4'><label className='block mb-1 font-medium'>Daily mood</label><select className='p-2 rounded border' value={dailyMood} onChange={e=>setDailyMood(e.target.value)}><option>good</option><option>okay</option><option>bad</option></select></div>
          <div className='flex justify-between'><button className='px-4 py-2 border rounded' onClick={()=>{ window.location.hash='onboard-step2' }}>Back</button><button className='px-6 py-3 rounded bg-rose-300 font-bold' onClick={next}>Finish</button></div>
        </div>
      )}

    </div>
  )
}
