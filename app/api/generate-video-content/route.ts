
import { NextRequest, NextResponse } from "next/server"
import { client } from "@/config/openai";
import { Generate_Video_Prompt } from "@/data/prompt";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/config/db";
import { chapterContentSlides } from "@/config/schema";

// Cloudinary configuration for storing generated audio files
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
})

export async function POST(req: NextRequest) {

  // Extract chapter + courseId from request body
  const { chapter, courseId } = await req.json();

  // -----------------------------
  // 1️⃣ Generate slide content using LLM
  // -----------------------------
  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: Generate_Video_Prompt },
      { role: "user", content: `Chapter details are ${JSON.stringify(chapter)}` }
    ],
    temperature: 0.7
  });

  const Result = response.choices[0].message?.content || "";

  // Safe JSON parsing because AI sometimes returns markdown wrappers
  let parsed: any = {};
  try {
    parsed = JSON.parse(Result.replace(/```json|```/g, ""))
  } catch (err) {
    console.error("AI JSON parse error", err)
  }

  // Extract slides array from parsed result
  const VideoContentJSON = parsed.slides || [];

  // -----------------------------
  // 2️⃣ Generate audio using TTS
  // -----------------------------
  const audioFileUrls: string[] = [];

  for (let i = 0; i < VideoContentJSON?.length; i++) {

    const narration = VideoContentJSON[i]?.narration?.fullText || "";

    try {

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

      // Upload generated audio to Cloudinary
      const audioUrl = await SaveAudioToStorage(
        audioBuffer,
        VideoContentJSON[i].audioFileName
      );

      audioFileUrls.push(audioUrl);

    } catch (error) {

      console.error("TTS generation failed", error)

      // push empty url so indexes remain aligned
      audioFileUrls.push("");
    }

  }

  // -----------------------------
  // 3️⃣ Generate captions using Deepgram
  // -----------------------------
  let captionsArray: any[] = [];

  for (let i = 0; i < audioFileUrls.length; i++) {

    try {

      let captions = await GenerateCaptions(audioFileUrls[i]);
      captionsArray.push(captions);

    } catch (error) {

      console.error("Caption generation failed", error)

      // fallback caption so DB doesn't crash
      captionsArray.push("");
    }

  }

  // -----------------------------
  // 4️⃣ Save slides to database
  // -----------------------------
  for (let index = 0; index < VideoContentJSON.length; index++) {

    try {

      await db.insert(chapterContentSlides).values({
        chapterId: chapter.chapterId,
        courseid: courseId,

        slideIndex: VideoContentJSON[index].slideIndex,
        slideId: VideoContentJSON[index].slideId,

        audioFileName: VideoContentJSON[index].audioFileName,

        narration: VideoContentJSON[index].narration,

        // Prevent NULL constraint error
        revelData: VideoContentJSON[index].revelData ?? [],

        html: VideoContentJSON[index].html,

        audioFileUrl: audioFileUrls[index] ?? "",

        // captions are text → fallback empty string
        caption: captionsArray[index] ?? ""
      }).returning();

    } catch (error) {

      console.error("DB insert failed", error)

    }

  }

  // -----------------------------
  // 5️⃣ Return generated data
  // -----------------------------
  return NextResponse.json({
    VideoContentJSON,
    audioFileUrls,
    captionsArray
  });

}

// -----------------------------
// Upload audio buffer to Cloudinary
// -----------------------------
const SaveAudioToStorage = async (
  audioBuffer: Buffer,
  fileName: string
): Promise<string> => {

  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video", // required for audio uploads
       public_id: fileName.replace(".mp3",""),
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

// -----------------------------
// Generate captions using Deepgram
// -----------------------------
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

  return transcript;
};

