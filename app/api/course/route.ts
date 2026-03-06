import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { coursesTable,chapterContentSlides } from '@/config/schema';
import { desc, eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
 

export async function GET(request:NextRequest){
const courseId = await request.nextUrl.searchParams.get('courseId');
const user = await currentUser();
if(!courseId){
    const userCourses=await db.select().from(coursesTable).where(eq(coursesTable.userId,user?.primaryEmailAddress?.emailAddress as string)).orderBy(desc(coursesTable.id));

    return NextResponse.json(userCourses);
}
const courses = await db.select().from(coursesTable).where(eq(coursesTable.courseId,courseId as string));
 
const chapterContentSlide = await db.select().from(chapterContentSlides).where(eq(chapterContentSlides.courseid,courseId as string)); 

return NextResponse.json({
    ...courses[0],
    chapterContentSlides:chapterContentSlide
});
}