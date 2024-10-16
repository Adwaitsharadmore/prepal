import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import getFeedback from './get-feedback.js';
import { fileURLToPath } from 'url';
import getMoreQuestions from './get-morequestions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("Loaded API Key:", process.env.GOOGLE_API_KEY);

const app = express();
app.use(cors());
app.use(express.json()); // Ensure JSON body parsing is enabled

const port = process.env.PORT || 3001;

// Initialize Google Generative AI and File Manager
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, 'uploads');
      console.log("Saving file to:", uploadsDir); // Debugging line
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Save with original name
    },
  }),
});

// Function to upload a file with retries
async function uploadFileWithRetry(filePath, options, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading file attempt ${attempt}...`);
      const uploadResponse = await fileManager.uploadFile(filePath, options);
      console.log(`File uploaded successfully on attempt ${attempt}`);
      return uploadResponse; // Return response if successful
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error; // Re-throw after final attempt
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
    }
  }
}

// Route for file upload and cheatsheet generation
app.post('/upload-and-generate', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { textPrompt } = req.body;
  console.log("Received upload-and-generate request");

  if (!file) {
    console.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.join(__dirname, 'uploads', file.originalname);

    // Upload the file with retries
    const uploadResponse = await uploadFileWithRetry(filePath, {
      mimeType: "application/pdf",
      displayName: file.originalname,
    });

    console.log(`Uploaded file: ${uploadResponse.file.displayName} as ${uploadResponse.file.uri}`);

    // Generate content using the uploaded file and the text prompt
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: textPrompt || "Please create a cheat sheet based on the provided document..." },
    ]);

    console.log("Generated content successfully");

    // Return the generated text as response
    res.json({
      message: "Content generated successfully",
      generatedText: result.response.text(), // Output the generated text
    });

    // Delete the uploaded file from local storage
    await fs.unlink(filePath);
    console.log("Uploaded file deleted from local storage");

  } catch (error) {
    console.error("Error during file upload or content generation:", error);
    res.status(500).json({ error: "File upload or content generation failed" });
  }
});

// Route for file upload and quiz generation
app.post('/upload-and-generate-quiz', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { textPrompt } = req.body;

  console.log("Received upload-and-generate-quiz request");

  if (!file) {
    console.error("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = file.path;

    // Upload the file with retries
    const uploadResponse = await uploadFileWithRetry(filePath, {
      mimeType: "application/pdf",
      displayName: file.originalname,
    });

    console.log(`Uploaded file: ${uploadResponse.file.displayName} as ${uploadResponse.file.uri}`);

    // Read the file content
    const fileContent = await fs.readFile(filePath, 'utf8');

    // Generate quiz using the uploaded file and the text prompt
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: "Generate 5 multiple-choice questions based on the document provided. Each question should be enclosed in curly brackets {}. List the four options within square brackets [], with each option labeled with a), b), c), and d) on a new line using \n to separate them. Place the correct option in parentheses () as a letter (a, b, c, or d) on a new line after the options. Ensure the output strictly follows this format: {Question text} [a) Option A\nb) Option B\nc) Option C\nd) Option D] \n(Correct option letter). Please use this format exactly as described." },
    ]);

    // Log the generated quiz content
    const generatedText = result.response.text();
    console.log("Generated quiz content:", generatedText);

    // Ensure the temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    await fs.mkdir(tempDir, { recursive: true });

    // Save the file content and URI to a temporary file
    const tempFilePath = path.join(tempDir, `${file.filename}.json`);
    await fs.writeFile(tempFilePath, JSON.stringify({
      fileContent,
      fileUri: uploadResponse.file.uri,
    }));

    console.log(`Temporary file saved at: ${tempFilePath}`);

    // Return the generated quiz as response
    res.json({
      message: "Quiz generated successfully",
      generatedQuiz: generatedText,
      tempFilePath, // Send the temp file path to the client
    });

    // Don't delete the uploaded file here, we'll do it after feedback generation
  } catch (error) {
    console.error("Error during file upload or quiz generation:", error);
    res.status(500).json({ error: "File upload or quiz generation failed" });
  }
});

// Route for generating feedback
app.post('/get-feedback', async (req, res) => {
  const { questions, attempts, tempFilePath } = req.body;

  console.log("Received get-feedback request");
  console.log("Questions:", questions);
  console.log("Attempts:", attempts);
  console.log("Temp File Path:", tempFilePath);

  if (!questions || !attempts || !tempFilePath) {
    console.error("Missing required data for feedback generation");
    return res.status(400).json({ error: "Missing required data" });
  }

  try {
    // Read the temporary file
    const tempFileContent = await fs.readFile(tempFilePath, 'utf8');
    const { fileContent } = JSON.parse(tempFileContent);

    // Call the getFeedback function with the file content
    const feedbackResponse = await getFeedback(questions, attempts, fileContent);
    console.log("Generated feedback successfully");

    // Safely delete the temporary file
    try {
      await fs.unlink(tempFilePath);
      console.log("Temporary file deleted");
    } catch (unlinkError) {
      console.error("Error deleting temporary file:", unlinkError);
    }

    res.json(feedbackResponse);
  } catch (error) {
    console.error("Error in feedback generation:", error);
    res.status(500).json({ error: "Failed to generate feedback" });
  } 
});

// Route for deleting temporary file
app.post('/api/delete-temp-file', async (req, res) => {
  const { tempFilePath } = req.body;

  if (!tempFilePath) {
    return res.status(400).json({ error: "Missing tempFilePath" });
  }

  try {
    await fs.unlink(tempFilePath);
    console.log("Temporary file deleted");
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting temporary file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

app.post('/api/cleanup', async (req, res) => {
  try {
     const uploadsDir = path.resolve(__dirname, 'D:\\New folder\\prepal\\pages\\api\\uploads');
    const tempDir = path.join(__dirname, '../../temp');

    // Delete all files in the uploads directory
    const uploadFiles = await fs.readdir(uploadsDir);
    for (const file of uploadFiles) {
      await fs.unlink(path.join(uploadsDir, file));
    }

    // Delete all files in the temp directory
    const tempFiles = await fs.readdir(tempDir);
    for (const file of tempFiles) {
      await fs.unlink(path.join(tempDir, file));
    }

    console.log("Uploads and temp folders cleaned up");
    res.json({ message: "Cleanup successful" });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({ error: "Failed to clean up folders" });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});