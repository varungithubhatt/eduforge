import React from 'react'
import { Course } from '@/type/CourseType';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {  Dot} from 'lucide-react';
import { CourseComposition } from './ChapterVideo';
import { Player } from '@remotion/player';
type Props={
    course:Course | undefined;
    durationbyslideId: Record<string,number> | null;
}
const CourseChapters = ({course,durationbyslideId}:Props) => {
    
    const slides=course?.chapterContentSlides??[];

   const GetChapterDurationInFrame = (chapterId: string) => {
  if (!durationbyslideId || !course) return 30;

  const chapterSlides = course.chapterContentSlides.filter(
    (slide) => slide.chapterId === chapterId
  );

  const frames = chapterSlides.reduce(
    (sum, slide) => sum + (durationbyslideId[slide.slideId] ?? 30),
    0
  );

  return frames > 0 ? frames : 30; // fallback if no slides
};

  return (
    <div className='max-w-6xl -mt-5 p-10 border rounded-3xl shadow w-full
    bg-background/80 backdrop-blur-lg '>
        <div className='flex justify-between items-center'>
        <h2 className='font-bold text-2xl'>Course Preview</h2>
        <h2 className='text-sm text-muted-foreground'>Chapters and Short preview</h2> 
        </div>
        <div className='mt-5'>
            {course?.courseLayout?.chapters.map((chapter,index) =>(
                <Card className='mb-5' key={index}>
                    <CardHeader>
                        <div className='flex gap-3 items-center'>
                            <h2 className='p-2 bg-primary/40 inline-flex h-10 w-10 item-center text-center rounded-2xl justify-center'>{index+1}</h2>
                        <CardTitle className='md:text-xl text-base'>
                            {chapter.chapterTitle}
                        </CardTitle>
                        </div>
                    </CardHeader>
  
                    <CardContent>
                        <div className='grid grid-cols-2 gap-5
                        '>
                            <div>
                        {chapter?.subContent.map((content,index) =>(
                            <div className='flex gap-2 items-center mt-2 ' key={index}>
                                <Dot className=' h-5 w-5 text-primary'></Dot>
                                <h2>{content}</h2>
                            </div>
                        ))
                        }
                        </div>
                        <div>
                           <Player
                        component={CourseComposition}
                        inputProps={{
                           // @ts-ignore
                            slides:slides.filter((slide)=>slide.chapterId === chapter.chapterId),
                            durationsBySlideId:durationbyslideId??{}
                        }}
                        durationInFrames={GetChapterDurationInFrame(chapter.chapterId)}
                        compositionWidth={1280}
                        compositionHeight={720}
                        fps={30}
                        controls
                        style={{
                            width:'80%',
                            height:'180px',
                            aspectRatio:'16/9',
                        }}
                        />
                        </div>
                        </div>
                    </CardContent>
                    
                </Card>
            ))}
        </div>
    </div>
  )
}

export default CourseChapters