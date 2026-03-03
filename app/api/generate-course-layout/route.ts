import { NextRequest, NextResponse } from "next/server";
import { client } from "@/config/openai";
import { Course_config_prompt } from "@/data/prompt";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userInput,courseId,type } = await req.json();
    const user = await currentUser();

    const response = await client.chat.completions.create({
  model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
  messages: [
    { role: "system", content: Course_config_prompt },
    { role: "user", content: `Course Topic is ${userInput}` }
  ],
  temperature: 0.7
});

    const rawResult = response.choices[0].message?.content || "";

    const JSONResult = JSON.parse(rawResult);
    
    const courseResult = await db.insert(coursesTable).values({
        courseId: courseId,
        courseName: JSONResult.courseName,
        userInput: userInput,
        type: type,
        courseLayout: JSONResult,
        userId:user?.primaryEmailAddress?.emailAddress || ''
    }).returning();
       

    return NextResponse.json(courseResult[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate course" },
      { status: 500 }
    );
  }
}