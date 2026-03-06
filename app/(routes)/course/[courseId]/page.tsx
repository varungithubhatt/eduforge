'use client'
import {Course} from '@/type/CourseType';
import React, { use, useEffect,useState } from 'react'
import CourseInfoCard from './_components/CourseInfoCard'
import axios from 'axios';
import { useParams } from 'next/dist/client/components/navigation';
import { set } from 'date-fns';
import CourseChapters from './_components/CourseChapters';
import { toast } from 'sonner';
import { getAudioData } from '@remotion/media-utils';
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
        if(result?.data?.chapterContentSlides?.length < result?.data?.courseLayout?.chapters.length){
   GenerateVideoContent(result?.data);
}
    }

    const GenerateVideoContent = async (course:Course)=>{
        

      for (let i = 0; i < course?.courseLayout?.chapters.length; i++) {

  const chapter = course?.courseLayout?.chapters[i];

  // Skip if slides already exist for this chapter
  const alreadyGenerated = course?.chapterContentSlides?.some(
    (slide) => slide.chapterId === chapter.chapterId
  );

  if (alreadyGenerated) continue;

  const loadingToast = toast.loading(
    'generating video content for chapter ' + (i + 1)
  );

  const result = await axios.post('/api/generate-video-content', {
    chapter: chapter,
    courseId: course?.courseId
  });

  console.log(result.data);

  toast.success(
    'video content generated for chapter ' + (i + 1),
    { id: loadingToast }
  );
}
    }
      const fps = 30;
    const slides=courseDetail?.chapterContentSlides??[];
    const[durationbyslideId,setdurationbyslideId]=useState<Record<string,number> | null>(null);

    useEffect(()=>{
        let cancelled=false;
        const run = async()=>{
            if(!slides) return;
            const entried=await Promise.all(slides.map(async(slide)=>{
                const audioData=await getAudioData(slide?.audioFileUrl);
                const audioSec=audioData?.durationInSeconds;
                const frames=Math.max(1,Math.ceil(audioSec*fps))
                return [slide.slideId,frames] as const;
            }));
            if(!cancelled){
                setdurationbyslideId(Object.fromEntries(entried));
            }
        }
        run();
        return()=>{
            cancelled=true;
        }
    },[slides,fps])
  return (
    <div className='flex flex-col items-center'>
        <CourseInfoCard course={courseDetail} durationbyslideId={durationbyslideId}/>
        <CourseChapters course={courseDetail}
        durationbyslideId={durationbyslideId}
        />
    </div>
  )
}


export default CoursePreview