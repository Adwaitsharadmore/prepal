import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

// Initialize Google Generative AI and File Manager
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Function to upload a file with retries
async function uploadFileWithRetry(filePath, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const uploadResponse = await fileManager.uploadFile(filePath, options);
      return uploadResponse;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

// Route for file upload and cheatsheet generation
app.post('/upload-and-generate', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { textPrompt } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = file.path;

    const uploadResponse = await uploadFileWithRetry(filePath, {
      mimeType: "application/pdf",
      displayName: file.originalname,
    });

    console.log(`Uploaded file: ${uploadResponse.file.displayName} as ${uploadResponse.file.uri}`);

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: textPrompt },
    ]);

    res.json({
      message: "Content generated successfully",
      generatedText: result.response.text(),
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error during file upload or content generation:", error);
    res.status(500).json({ error: "File upload or content generation failed" });
  }
});

// Route for quiz generation
app.post('/upload-and-generate-quiz', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { textPrompt } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = file.path;
    const uploadResponse = await uploadFileWithRetry(filePath, {
      mimeType: "application/pdf",
      displayName: file.originalname,
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: textPrompt || "Generate 5 multiple-choice questions based on the document provided." },
    ]);

    const generatedText = result.response.text();
    console.log("Generated quiz content:", generatedText);

    res.json({
      message: "Quiz generated successfully",
      generatedQuiz: generatedText,
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error during quiz generation:", error);
    res.status(500).json({ error: "File upload or quiz generation failed" });
  }
});

// Route for mnemonics generation
app.post('/upload-and-generate-mnemonics', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { textPrompt } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = file.path;
    const uploadResponse = await uploadFileWithRetry(filePath, {
      mimeType: "application/pdf",
      displayName: file.originalname,
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: textPrompt },
    ]);

    const generatedText = result.response.text();
    console.log("Generated mnemonics content:", generatedText);

    res.json({
      message: "Mnemonics generated successfully",
      generatedMnemonics: generatedText,
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error during mnemonics generation:", error);
    res.status(500).json({ error: "File upload or mnemonics generation failed" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
