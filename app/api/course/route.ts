import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/config/db';
import { coursesTable,chapterContentSlides } from '@/config/schema';
import { eq } from 'drizzle-orm';
 

export async function GET(request:NextRequest){
const courseId = await request.nextUrl.searchParams.get('courseId');

const courses = await db.select().from(coursesTable).where(eq(coursesTable.courseId,courseId as string));
 
const chapterContentSlide = await db.select().from(chapterContentSlides).where(eq(chapterContentSlides.courseid,courseId as string)); 

return NextResponse.json({
    ...courses[0],
    chapterContentSlides:chapterContentSlide
});
}