import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import path from 'path';

// Remove dotenv import and config if you're using Next.js built-in environment variables
// import dotenv from 'dotenv';
// dotenv.config();


// Remove this line completely
// console.log(process.env.API_KEY);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { questions, attempts, originalFileName } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "Invalid or missing questions data" });
  }
  if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
    return res.status(400).json({ error: "Invalid or missing attempts data" });
  }
  if (!originalFileName || typeof originalFileName !== 'string') {
    return res.status(400).json({ error: "Invalid or missing original file name" });
  }

  try {
    // Use an absolute path to the uploads directory
    const uploadsDir = path.resolve(__dirname, 'D:\\New folder\\prepal\\pages\\api\\uploads');
    const filePath = path.join(uploadsDir, originalFileName);
    console.log("Reading file from:", filePath); // Debugging line

    // Upload the file to get a URI
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType: "application/pdf",
      displayName: originalFileName,
    });

    const fileUri = uploadResponse.file.uri;

    const questionsWithMultipleAttempts = questions.filter((_, index) => attempts[index] > 1);

    if (questionsWithMultipleAttempts.length === 0) {
      return res.json({ feedback: ["No additional feedback is needed. All questions were answered correctly in one attempt."] });
    }

    const prompt = `Generate new multiple-choice questions based on the areas where the user struggled in the previous quiz. Ensure that the new questions are not the same as those in the previous quiz, but focus on the same topic areas where the user faced difficulty, as indicated by the number of attempts provided. Each question should help the user learn from their mistakes by covering similar concepts but with different wording or structure. Each question should be enclosed in curly brackets {}. List the four options within square brackets [], with each option labeled with a), b), c), and d) on a new line using \n to separate them. Place the correct option in parentheses () as a letter (a, b, c, or d) on a new line after the options. Ensure the output strictly follows this format: {Question text} [a) Option A\nb) Option B\nc) Option C\nd) Option D] \n(Correct option letter). Please use this format exactly as described.:
      ${questionsWithMultipleAttempts.map((q, index) => `Question: "${q}" (${attempts[index]} attempts)`).join("\n")}`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf",
          fileUri: fileUri,
        },
      },
      { text: prompt }
    ]);

    const generatedFeedback = await result.response.text();

    res.json({
      feedback: generatedFeedback.split("\n"),
    });
  } catch (error) {
    console.error("Error in feedback generation:", error);
    res.status(500).json({ error: "Failed to generate feedback. Please try again later." });
  }
}


