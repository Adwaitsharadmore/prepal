"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const ResponsePage = () => {
  const [cheatsheetContent, setCheatsheetContent] = useState(null);
  const [file, setFile] = useState(null); // State to store the uploaded file
  const [textPrompt, setTextPrompt] = useState(""); // State to store the text prompt
  const [loadingCheatsheet, setLoadingCheatsheet] = useState(false); // Loading state for cheatsheet
  const [loadingQuiz, setLoadingQuiz] = useState(false); // Loading state for quiz

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      alert("No file selected. Please try again.");
    }
  };

  // Function to handle cheatsheet generation
  const handleSubmit = async (event) => {
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
      const data = await response.json();
      setCheatsheetContent(data.generatedText);
    } catch (error) {
      console.error("Error fetching cheatsheet content:", error);
    } finally {
      setLoadingCheatsheet(false);
    }
  };

  // Function to handle quiz generation and redirect to quizPage with the quiz content
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
      "Can you generate 5 multiple-choice questions based on the key concepts in the document?"
    );

    try {
      const response = await fetch(
        "http://localhost:3001/upload-and-generate-quiz",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      // Redirect to the new quiz page with generated quiz content
      window.location.href = `/quizPage?quiz=${encodeURIComponent(
        data.generatedQuiz
      )}`;
    } catch (error) {
      console.error("Error fetching quiz content:", error);
    } finally {
      setLoadingQuiz(false);
    }
  };
  
  const renderCheatsheetAsList = () => {
    if (!cheatsheetContent) return null;

    // Split the cheatsheet content by double newlines to separate sections
    const sections = cheatsheetContent.split("\n\n").filter((section) => section.trim() !== "");

    return (
      <div>
        {sections.map((section, index) => {
          // Split section by newlines to separate the lines
          const lines = section.split("\n").filter((line) => line.trim() !== "");
          
          return (
            <div key={index} className="mb-6">
              {lines.map((line, lineIndex) => {
                // Remove hyphens at the start of lines
                const cleanedLine = line.replace(/^\-\s*/, "").trim();

                if (cleanedLine.startsWith("{") && cleanedLine.endsWith("}")) {
                  // Main title with curly brackets
                  const mainTitle = cleanedLine.replace(/^\{(.*?)\}$/, "$1");
                  return (
                    <h1 key={lineIndex} className="font-semibold text-3xl text-white mb-4">
                      {mainTitle}
                    </h1>
                  );
                } else if (cleanedLine.startsWith("[") && cleanedLine.endsWith("]")) {
                  // Subtopic with square brackets
                  const subtopic = cleanedLine.replace(/^\[(.*?)\]$/, "$1");
                  return (
                    <h2 key={lineIndex} className="font-semibold text-xl text-white mb-2">
                      {subtopic}
                    </h2>
                  );
                } else {
                  // Regular bullet points without hyphens
                  return (
                    <ul key={lineIndex} className="list-disc pl-5">
                      <li className="text-lg text-white mb-2">
                        {cleanedLine} {/* Display points as clean bullet points */}
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
              src="/images/logo.JPG" // Make sure the path is correct
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
    className="hidden" // Hide the default file input
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

            <div className="mb-4 bg-black  rounded-lg">
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


            {/* Generate Cheatsheet Button */}
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded-full"
              disabled={loadingCheatsheet}
            >
              {loadingCheatsheet ? "Generating..." : "Generate Cheatsheet"}
            </button>
            {/* Generate Quiz Button */}
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
