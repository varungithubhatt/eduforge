'use client'
import {Course} from '@/type/CourseType';
import React, { use, useEffect,useState } from 'react'
import CourseInfoCard from './_components/CourseInfoCard'
import axios from 'axios';
import { useParams } from 'next/dist/client/components/navigation';
import { set } from 'date-fns';
import CourseChapters from './_components/CourseChapters';
import { toast } from 'sonner';

const CoursePreview = () => {
    const {courseId} = useParams();
    const [courseDetail,setCourseDetail] = useState<Course>();
    useEffect(() => {
        GetCourseDetail();
    },[courseId])
    const GetCourseDetail = async ()=>{
       const loadingToast= toast.loading('fetching course details');
        const result = await axios.get('/api/course?courseId='+courseId);
        console.log(result.data)
        setCourseDetail(result.data);
        toast.success('course details fetched successfully', {id: loadingToast});
        if(result?.data?.chapterContentSlides?.length === 0){
           GenerateVideoContent(result?.data);
        }
    }

    const GenerateVideoContent = async (course:Course)=>{
        

      for(let i = 0; i<course?.courseLayout?.chapters.length;i++){
         if(i>0) break;//for testing only one chapter content generation
        const loadingToast= toast.loading('generating video content for chapter'+(i+1));

       
 
        const result=await axios.post('/api/generate-video-content',{
            chapter:course?.courseLayout?.chapters[0],
            courseId:course?.courseId
        })
        console.log(result.data);
        toast.success('video content generated for chapter'+(i+1), {id: loadingToast});
        }
    }
  return (
    <div className='flex flex-col items-center'>
        <CourseInfoCard course={courseDetail}/>
        <CourseChapters course={courseDetail}/>
    </div>
  )
}


export default CoursePreview