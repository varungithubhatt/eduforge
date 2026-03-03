'use client'
import axios from 'axios'
import { toast } from 'sonner'
import { useState } from 'react'
import React from 'react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputOTPGroup } from '@/components/ui/input-otp'
import { Loader2, Send } from 'lucide-react'
import { QUICK_VIDEO_SUGGESTIONS } from '@/data/constant'
import { set } from 'date-fns'
import { se } from 'date-fns/locale'
import { SignInButton, useUser } from '@clerk/nextjs'
const Hero = () => {
    const [userInput,setUserInput] = useState('');
    const [type,setType] = useState('full-course');
    const [loading,setLoading] = useState(false);
    const {user} = useUser();
    const GenerateCouseLayout = async()=>{
         const toastId= toast.loading('Generating Course Layout...');
     try{
        setLoading(true);
      
        const result = await axios.post('/api/generate-course-layout',{
            userInput,
            type,
            courseId: `${user?.id}-${Date.now()}`
        });
        console.log(result.data);
        setLoading(false);
        toast.success('Course Layout Generated Successfully',{id:toastId});

        //navigate course layout

    }catch(error){
        setLoading(false);
        toast.error('Failed to Generate Course Layout',{id:toastId});
    }
    }
  return (
    <div>
        <div className='flex items-center flex-col mt-20'>
            <h2 className='text-4xl font-bold'>Learn Smarter with <span className='text-primary'>AI Video Courses</span></h2>
            <p className='text-center text-gray-500 mt-3 text-3xl'>Turn Any Topic into Video Course</p>
            <div className="grid w-full max-w-xl mt-5 gap-6 bg-white z-10">
            <InputGroup>
                <InputGroupTextarea
                data-slot="input-group-control"
                className="flex field-sizing-content min-h-24 w-full resize-none rounded-xl  bg-white px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
                placeholder="Autoresize textarea..."
                value = {userInput}
                onChange={(e)=>setUserInput(e.target.value)}
                />
                <InputGroupAddon align="block-end">
                <Select>
                <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Select Course Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectLabel>Course Type</SelectLabel>
                    <SelectItem value="full">Full Course</SelectItem>
                    <SelectItem value="summary">Quick Summary</SelectItem>
                    
                    </SelectGroup>
                </SelectContent>
                </Select>

                {user?
                <InputGroupButton className="ml-auto" size="icon-sm" variant="default"
                onClick={GenerateCouseLayout}
                disabled={loading}>
                 {loading? <Loader2 className='animate-spin' />:<Send/> }   
                </InputGroupButton>
                : <SignInButton mode='modal'>
                   <InputGroupButton className="ml-auto" size="icon-sm" variant="default">
                   <Send/>
                   </InputGroupButton>
                </SignInButton>}
                </InputGroupAddon>
            </InputGroup>
        </div>
        <div className='flex gap-5 mt-5 max-w-3xl flex-wrap justify-center z-10 '>
        {QUICK_VIDEO_SUGGESTIONS.map((suggestion,index) =>(
            <h2 key={index} onClick={()=>setUserInput(suggestion?.prompt)} className='border rounded-2xl px-2 p-1 text-sm bg-white cursor-pointer'> {suggestion.title}</h2>
        ))} 
        </div>
        </div> 
        
    </div>
  )
}

export default Hero