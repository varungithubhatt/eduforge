'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Course } from '@/type/CourseType';
import { BookOpen, ChartNoAxesColumnIncreasing,  Sparkles } from 'lucide-react';
import { Player } from '@remotion/player';

import {getAudioData} from '@remotion/media-utils'
import { CourseComposition } from './ChapterVideo';
type Props = {
    course: Course | undefined;
    durationbyslideId: Record<string,number> | null;
}
const CourseInfoCard = ({course, durationbyslideId}:Props) => {
    const fps=30;
    const slides=course?.chapterContentSlides??[];
    console.log('durationbyslideId',durationbyslideId) 

    const durationInFrames=useMemo(()=>{
        if(!durationbyslideId) return;
        return slides.reduce((sum,slide)=>sum+(durationbyslideId[slide.slideId]??fps*6),0)
    },[slides,durationbyslideId,fps])


    if(!durationbyslideId){
        return <div>Loading...</div>
    }

  return (
    <div>
        <div className='p-20 grid grid-cols-1 md:grid-cols-2 gap-5 bg-gradient-to-br from-slate-950 via-slate-800 to-slate-950 rounded-lg'>
    <div>
        <h2 className='flex gap-2 p-1 px-2 border rounded-2xl inline-flex text-white border-gray-200/70'><Sparkles/>Course Preview</h2>
        <h2 className='text-5xl text-bold mt-4 text-white'>{course?.courseName}</h2>
        <p className='text-lg text-muted-foreground mt-3'>{course?.courseLayout?.courseDescription}</p>
        <div className='mt-5 flex gap-5 text-white'>
            <h2 className='px-3 p-2 border rounded-4xl flex gap-2 items-center inline-flex'><ChartNoAxesColumnIncreasing className='text-sky-400'/>{course?.courseLayout?.level}</h2>
            <h2 className='px-3 p-2 border rounded-4xl flex gap-2 items-center inline-flex'><BookOpen className='text-green-400'/>{course?.courseLayout?.totalChapters} Chapters</h2>
        </div>
    </div>
    <div className='border-2 border-white/10 rounded-2xl '>
        <Player
        component={CourseComposition}
        inputProps={{
            //@ts-ignore
            slides:slides,
            durationsBySlideId:durationbyslideId
        }}
        durationInFrames={durationInFrames&& durationInFrames!==0?durationInFrames:30}
        compositionWidth={1280}
        compositionHeight={720}
        fps={30}
        controls
        style={{
            width:'100%',
            aspectRatio:'16/9',
        }}
        />
    </div>
        </div>
    </div>
  )
}

export default CourseInfoCard