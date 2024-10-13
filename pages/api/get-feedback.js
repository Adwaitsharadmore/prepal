import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';

// Remove dotenv import and config if you're using Next.js built-in environment variables
// import dotenv from 'dotenv';
// dotenv.config();


// Remove this line completely
// console.log(process.env.API_KEY);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questions, attempts, tempFilePath } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Invalid or missing questions data" });
  }
  if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
    return res.status(400).json({ error: "Invalid or missing attempts data" });
  }
  if (!tempFilePath || typeof tempFilePath !== 'string') {
    return res.status(400).json({ error: "Invalid or missing tempFilePath" });
  }

  try {
    const tempFileContent = await fs.readFile(tempFilePath, 'utf8');
    const { fileContent } = JSON.parse(tempFileContent);

    if (!fileContent || typeof fileContent !== 'string' || fileContent.trim() === '') {
      return res.status(400).json({ error: "Invalid or missing file content" });
    }

    const questionsWithMultipleAttempts = questions.filter((_, index) => attempts[index] > 1);

    if (questionsWithMultipleAttempts.length === 0) {
      return res.json({ feedback: ["No additional feedback is needed. All questions were answered correctly in one attempt."] });
    }

    const prompt = `Given the following file content on which the quiz questions are based:

${fileContent}

Provide feedback summary for these quiz questions where the user took more than one attempt and refer to the file content to provide the feedback:
${questionsWithMultipleAttempts.map((q, index) => `Question: "${q}" (${attempts[index]} attempts)`).join("\n")}`;

    const result = await model.generateContent(prompt);
    const generatedFeedback = await result.response.text();

    // Delete the temporary file after feedback generation
    await fs.unlink(tempFilePath);
    console.log("Temporary file deleted after feedback generation");

    // Clear the uploads folder if it exists
    const uploadsDir = path.join(process.cwd(), 'pages', 'api', 'uploads');
    try {
      const files = await fs.readdir(uploadsDir);
      for (const file of files) {
        await fs.unlink(path.join(uploadsDir, file));
      }
      console.log("Uploads folder cleared");
    } catch (dirError) {
      if (dirError.code !== 'ENOENT') {
        console.error("Error clearing uploads folder:", dirError);
      } else {
        console.log("Uploads folder does not exist, skipping clear operation");
      }
    }

    res.json({
      feedback: generatedFeedback.split("\n"),
    });
  } catch (error) {
    console.error("Error in feedback generation:", error);
    res.status(500).json({ error: "Failed to generate feedback. Please try again later." });
  }
}

async function getFeedback(questions, attempts, fileContent, retries = 3, backoff = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Make the API request
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GOOGLE_API_KEY}`,
        },
        body: JSON.stringify({
          questions,
          attempts,
          fileContent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw new Error('Max retries reached. Failed to generate feedback.');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoff * attempt));
    }
  }
}
