import { NextRequest, NextResponse } from "next/server"
import { client } from "@/config/openai";
import { Generate_Video_Prompt } from "@/data/prompt";
import { Video } from "lucide-react";
import { VideoSlides } from "@/data/dummy";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/config/db";
import { chapterContentSlides } from "@/config/schema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
})

export async function POST(req: NextRequest) {

const { chapter, courseId } = await req.json();

//gen json schema for video content

 const response = await client.chat.completions.create({
  model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
  messages: [
    { role: "system", content: Generate_Video_Prompt },
    { role: "user", content: `Chapter details are ${JSON.stringify(chapter)}` }
  ],
  temperature: 0.7
});

const Result=response.choices[0].message?.content || "";
const parsed = JSON.parse(Result?.replaceAll('```json','').replace('```','') || '{}');
const VideoContentJSON = parsed.slides || [];

//audio file 

//const VideoContentJSON = VideoSlides;
const audioFileUrls: string[] = [];   // ✅ added

for (let i = 0; i < VideoContentJSON?.length; i++) {

 if (i > 0) break; //for testing only one slide content generation

  const narration = VideoContentJSON[i].narration.fullText;

  const fonadaResult = await axios.post(
    "https://api.fonada.ai/tts/generate-audio-large",
    {
      input: narration,
      voice: "Vaanee",
      language: "English",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FONADALABS_API_KEY}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
      timeout: 120000,
    }
  );

  const audioBuffer = Buffer.from(fonadaResult.data);
  console.log(audioBuffer);

  const audioUrl = await SaveAudioToStorage(
    audioBuffer,
    VideoContentJSON[i].audioFileName
  );

  console.log(audioUrl);

  audioFileUrls.push(audioUrl);
}

//storage

//gen captions
let captionsArray: any[] = [];
for(let i=0;i<audioFileUrls.length;i++){
 if(i>0) break;//for testing only one slide content generation
 let  captions = await GenerateCaptions(audioFileUrls[i]);
 captionsArray.push(captions);
 console.log(captionsArray)
}

//save everything to db
for (let index = 0; index < VideoContentJSON.length; index++) {
 if (index > 0) break;
  //@ts-ignore
  const result = await db.insert(chapterContentSlides).values({
    chapterId: chapter.chapterId,
    courseid: courseId,
    slideIndex: VideoContentJSON[index].slideIndex,
    slideId: VideoContentJSON[index].slideId,
    audioFileName: VideoContentJSON[index].audioFileName,
    narration: VideoContentJSON[index].narration,
    revelData: VideoContentJSON[index].revelData,
    html: VideoContentJSON[index].html,
    audioFileUrl: audioFileUrls[index],
    caption: captionsArray[index] ?? {}
  }).returning();

}



//return response 

return NextResponse.json({
  VideoContentJSON,
  audioFileUrls,
  captionsArray
});

}

const SaveAudioToStorage = async (
  audioBuffer: Buffer,
  fileName: string
): Promise<string> => {

  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // required for audio
        public_id: fileName,
        format: "mp3"
      },
      (error, result) => {

        if (error) {
          reject(error)
        } else {
          resolve(result?.secure_url || "")
        }

      }
    )

    uploadStream.end(audioBuffer)

  })
}

const GenerateCaptions = async (audioUrl: string) => {

  const response = await axios.post(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
    {
      url: audioUrl
    },
    {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const transcript =
    response.data.results.channels[0].alternatives[0].transcript;

  console.log("Transcript:", transcript);

  return transcript;
};