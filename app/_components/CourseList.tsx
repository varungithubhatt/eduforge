'use client'
import React, { useEffect,useState } from 'react'
import axios from 'axios';
import { Course } from '@/type/CourseType';
import CourseListCard from './CourseListCard';
const CourseList = () => {
const [courseList,setCourseList] =useState<Course[]>([]);
  useEffect(()=>{
    GetCourseList();
  },[])

  const GetCourseList=async()=>{
    
    const result=await axios.get('/api/course');
    console.log(result.data)
    setCourseList(result.data);
  }

  return (
    <div className='max-w-6xl mt-10 mb-10'>
      <h2 className='font-bold text-2xl'>My Courses</h2>
      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5'>
        {courseList.map((course,index)=>(
          <CourseListCard courseItem={course} key={index}/>
        ))}
    </div>
    </div>
  )
}

export default CourseList