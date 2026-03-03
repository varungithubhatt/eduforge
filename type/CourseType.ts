export type Course = {
    courseId: string;
    courseName: string;
    type: string;
    createdAt: string;
    id: number;
   courseLayout: CourseLayout;
}

export type CourseLayout = {
    courseName: string;
    courseDescription: string;
    courseId: string;
    level:number;
    totalChapters: number;
    chapters: Chapter[];
   
}

export type Chapter = {
    chapterId: string;
    chapterTitle: string;
    subContent: string[];
}