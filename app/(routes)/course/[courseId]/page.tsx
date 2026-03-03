'use client'
import {Course} from '@/type/CourseType';
import React, { use, useEffect,useState } from 'react'
import CourseInfoCard from './_components/CourseInfoCard'
import axios from 'axios';
import { useParams } from 'next/dist/client/components/navigation';
import { set } from 'date-fns';
import CourseChapters from './_components/CourseChapters';

const CoursePreview = () => {
    const {courseId} = useParams();
    const [courseDetail,setCourseDetail] = useState<Course>();
    useEffect(() => {
        GetCourseDetail();
    },[])
    const GetCourseDetail = async ()=>{
        const result = await axios.get('/api/course?courseId='+courseId);
        console.log(result.data)
        setCourseDetail(result.data);
    }
  return (
    <div className='flex flex-col items-center'>
        <CourseInfoCard course={courseDetail}/>
        <CourseChapters course={courseDetail}/>
    </div>
  )
}

export default CoursePreview