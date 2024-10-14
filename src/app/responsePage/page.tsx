"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface FileData {
  name: string;
  path: string;
}

const ResponsePage: React.FC = () => {
  const [cheatsheetContent, setCheatsheetContent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [loadingCheatsheet, setLoadingCheatsheet] = useState<boolean>(false);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [tempFilePath, setTempFilePath] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalFileName(selectedFile.name); // Store the original file name
    } else {
      alert("No file selected. Please try again.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      alert("Please upload a file");
      return;
    }

    setLoadingCheatsheet(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("textPrompt", textPrompt);

    try {
      const response = await fetch("http://localhost:3001/upload-and-generate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to generate cheatsheet");
      }
      const data = await response.json();
      setCheatsheetContent(data.generatedText);
    } catch (error) {
      console.error("Error fetching cheatsheet content:", error);
    } finally {
      setLoadingCheatsheet(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    setLoadingQuiz(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "textPrompt",
      "Generate 5 multiple-choice questions based on the document provided. Each question should be enclosed in curly brackets {}. List the four options within square brackets [], with each option labeled with a), b), c), and d) on a new line using \n to separate them. Place the correct option in parentheses () as a letter (a, b, c, or d) on a new line after the options. Ensure the output strictly follows this format: {Question text} [a) Option A\nb) Option B\nc) Option C\nd) Option D] \n(Correct option letter). Please use this format exactly as described."
    );

    try {
      const response = await fetch(
        "http://localhost:3001/upload-and-generate-quiz",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }
      const data = await response.json();

      // Store the tempFilePath for later use
      setTempFilePath(data.tempFilePath);

      // Redirect to the new quiz page with generated quiz content
      window.location.href = `/quizPage?quiz=${encodeURIComponent(
        data.generatedQuiz
      )}&originalFileName=${encodeURIComponent(file.name)}`;

    } catch (error) {
      console.error("Error fetching quiz content:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const fetchFeedback = async (questions: string[], attempts: number[]) => {
    if (!tempFilePath) {
      console.error("Temporary file path is missing.");
      return;
    }

    try {
      const response = await fetch('/api/get-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions,
          attempts,
          tempFilePath,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      console.log("Feedback received:", data.feedback);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const renderCheatsheetAsList = () => {
    if (!cheatsheetContent) return null;

    const sections = cheatsheetContent.split("\n\n").filter((section) => section.trim() !== "");

    return (
      <div>
        {sections.map((section, index) => {
          const lines = section.split("\n").filter((line) => line.trim() !== "");

          return (
            <div key={index} className="mb-6">
              {lines.map((line, lineIndex) => {
                const cleanedLine = line.replace(/^\-\s*/, "").trim();

                if (cleanedLine.startsWith("{") && cleanedLine.endsWith("}")) {
                  const mainTitle = cleanedLine.replace(/^\{(.*?)\}$/, "$1");
                  return (
                    <h1 key={lineIndex} className="font-semibold text-3xl text-white mb-4">
                      {mainTitle}
                    </h1>
                  );
                } else if (cleanedLine.startsWith("[") && cleanedLine.endsWith("]")) {
                  const subtopic = cleanedLine.replace(/^\[(.*?)\]$/, "$1");
                  return (
                    <h2 key={lineIndex} className="font-semibold text-xl text-white mb-2">
                      {subtopic}
                    </h2>
                  );
                } else {
                  return (
                    <ul key={lineIndex} className="list-disc pl-5">
                      <li className="text-lg text-white mb-2">
                        {cleanedLine}
                      </li>
                    </ul>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-preppal text-white">
      <div>
        <Link href="/">
          <Image
            src="/images/logo.JPG"
            alt="PrepPal Logo"
            width={100}
            height={100}
            className="object-cover rounded-full"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="min-h-screen flex-1 flex justify-center items-center flex-col">
          <div className="font-semibold text-6xl text-white font-inter mb-6">
            Here's your
            <span className="font-semibold text-6xl" style={{ color: "rgba(235, 255, 92, 1)" }}>
              {" "}
              cheatsheet!
            </span>
          </div>
          <div className="font text-2xl pb-5 pt-2 text-white">
            Your file has been converted to the following cheatsheet:
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl bg-black border border-gray-700 shadow-md rounded-lg p-6 mt-6"
          >
            <div className="mb-4">
              <label className="block text-lg font-medium text-white">
                Upload File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer mt-2 px-4 py-2 bg-white text-black border rounded-full inline-block text-center hover:bg-gray-700 transition-colors"
              >
                Choose File
              </label>
              {file && (
                <p className="text-white mt-2">
                  Selected file: <span className="font-semibold">{file.name}</span>
                </p>
              )}
            </div>

            <div className="mb-4 bg-black rounded-lg">
              <label className="block text-lg font-medium text-white">
                Text Prompt (Optional)
              </label>
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="mt-2 p-2 border border-gray-500 rounded w-full bg-black text-white"
                placeholder="Enter any additional prompt (optional)"
              />
            </div>

            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded-full"
              disabled={loadingCheatsheet}
            >
              {loadingCheatsheet ? "Generating..." : "Generate Cheatsheet"}
            </button>
            <button
              type="button"
              className="bg-white text-black px-4 py-2 rounded-full ml-4"
              onClick={handleGenerateQuiz}
              disabled={loadingQuiz}
            >
              {loadingQuiz ? "Generating..." : "Generate Quiz"}
            </button>
          </form>

          <div className="w-full max-w-4xl bg-black border border-gray-700 shadow-md rounded-lg p-6 mt-6">
            <div className="text-lg text-white">
              {cheatsheetContent ? (
                renderCheatsheetAsList()
              ) : (
                <p>
                  {loadingCheatsheet
                    ? "Generating your cheatsheet..."
                    : "Your cheatsheet content will be displayed here once generated."}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Link href="/">
              <label className="flex items-center justify-center w-58 p-4 bg-white text-black border rounded-full cursor-pointer hover:bg-custom-hover transition-colors">
                <span className="font-bold">Back</span>
              </label>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;