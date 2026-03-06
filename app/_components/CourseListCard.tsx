'use client'

import React from 'react'
import { Course } from '@/type/CourseType';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Layers, Play,Dot, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { useRouter } from 'next/navigation';
type Props={
    courseItem:Course;
}
const CourseListCard = ({ courseItem }:Props) => {
  const navigate = useRouter();
  return (
  
      <Card className='bg-white z-10'>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <h2 className='font-medium text-md'>{courseItem?.courseName}</h2>
            <h2 className='text-primary p-1 px-2 border rounded-4xl text-sm border-primary bg-primary/10'>{courseItem?.courseLayout?.level}</h2>
          </div>
          <div className='flex gap-3 items-center '>
            <h2 className='flex gap-2 items-centertext-slate-600 p-1 px-2 border rounded-4xl text-xs border-slate-500/10 bg-slate-400
            /10'>
              <Layers className='h-4 w-4'/>
              {courseItem?.courseLayout?.totalChapters} chapters

            </h2>
            <h2 className='flex gap-2 items-centertext-slate-600 p-1 px-2 border rounded-4xl text-xs border-slate-500/10 bg-slate-400
            /30'>
             <Calendar className='h-4 w-4 mr-1'/>
             {moment(courseItem?.createdAt).format('MMM DD, YYYY')}
             <Dot className='h-4 w-4'/>
             {moment(courseItem?.createdAt).fromNow()}

            </h2>
          </div>
          </CardHeader>
          <CardContent>
            <div className='flex justify-between items-center'>
            <p>keep learning...</p>
           
            <Button className='cursor-pointer' onClick={()=>navigate.push('/course/'+courseItem.courseId)}>Watch Now <Play /> </Button>
          
            </div>
          </CardContent>
      </Card>
  
  )
}

export default CourseListCard