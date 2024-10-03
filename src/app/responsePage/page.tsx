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
  const [loadingMnemonics, setLoadingMnemonics] = useState(false); // Loading state for mnemonics
  const [selectedOption, setSelectedOption] = useState(""); // State to track which option is selected (Detailed or Precise)
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

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

    if (!selectedOption) {
      setErrorMessage("Please select if you want a detailed or precise cheatsheet first");
      return;
    }

    setLoadingCheatsheet(true);
    setErrorMessage(""); // Clear error message on valid selection

    let customPrompt = textPrompt || ""; // Use any additional prompt provided by the user

    // Modify the prompt based on the selection
    if (selectedOption === "Detailed") {
      customPrompt =
        customPrompt ||
        "Please create a cheat sheet based on the provided document. Format the main titles using curly brackets {}. Format subtopics using square brackets []. Present each relevant detail as bullet points under the corresponding subtopic. Ensure that all text is in normal font. The format should strictly follow this structure: {Main Title} [Subtopic] - Bullet point 1 - Bullet point 2. Make sure to use this exact format throughout the entire cheat sheet. Write the details in bullet points using simple understandable language. Provide further explanation of the relevant topics using your own knowledge and not just what is provided in the document. Expand on each bullet point with in-depth explanations, context, and additional insights to ensure a comprehensive and thorough understanding of the topic."; // Add your detailed prompt here
    } else if (selectedOption === "Precise") {
      customPrompt =
        customPrompt ||
        "Please create a cheat sheet based on the provided document. Format the main titles using curly brackets {}. Format subtopics using square brackets []. Present each relevant detail as bullet points under the corresponding subtopic. Ensure that all text is in normal font. The format should strictly follow this structure: {Main Title} [Subtopic] - Bullet point 1 - Bullet point 2. Make sure to use this exact format throughout the entire cheat sheet. Write the details in bullet points using simple understandable language. Provide further explaination of the releavant topics using your own knowledge and not just what is provided in the document. Make this answer more precise and relatively shorter with the bullet points being straight to the point."; // Add your precise prompt here
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("textPrompt", customPrompt);

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

  // Function to handle quiz generation
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

  // Function to handle mnemonics generation
  const handleGenerateMnemonics = async () => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    setLoadingMnemonics(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("textPrompt", "Please create mnemonics for the file uploaded that will help to memorize the key concepts. Format the main titles using curly braces and subtopics using square brackets. For each topic, generate a mnemonic that utilizes the best method for memorization, selecting from acronyms, acrostics, associations, chunking, method of loci, songs, and rhymes. Where appropriate, combine techniques, such as using both an acronym and a rhyme, to enhance retention. Use acronyms by taking the first letters of each key term to form a simple, memorable word or phrase, and include an explanation to clarify the connection between the acronym and the concept. Create acrostics by forming a phrase or sentence where the first letter of each word represents an important term in the topic. Use association to link the new concept to familiar knowledge or experiences for building a meaningful connection. Apply chunking to break down complex or multi-step processes into smaller, more digestible parts. Use the method of loci to associate key concepts with specific locations or a journey to visualize and recall the information. Create simple songs or rhymes that describe the topic in a fun, engaging way. For each topic, ensure that the mnemonic is not just an abbreviation but also provides additional context or visualization where possible. Select the most effective mnemonic method based on the topic's complexity, and include a short explanation after each mnemonic to clarify how it aids in memorization. Make sure to use this exact format throughout the entire mnemonic generation."); // Placeholder for your mnemonic prompt

    try {
      const response = await fetch("http://localhost:3001/upload-and-generate-mnemonics", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      // Handle mnemonics generation result, you can store or display it in the same area as cheatsheet
      setCheatsheetContent(data.generatedMnemonics); // Display mnemonics in cheatsheet area for now
    } catch (error) {
      console.error("Error fetching mnemonics:", error);
    } finally {
      setLoadingMnemonics(false);
    }
  };

  const toggleSelection = (option) => {
    setSelectedOption(selectedOption === option ? "" : option);
  };

  // Updated renderCheatsheetAsList function to handle asterisks replacement
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
                  // Detect asterisks for bold/italic formatting and replace them with <strong> or <em> tags
                  const formattedLine = cleanedLine
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Replace **bold** with <strong>
                    .replace(/\*(.*?)\*/g, "<em>$1</em>"); // Replace *italic* with <em>

                  return (
                    <ul key={lineIndex} className="list-disc pl-5">
                      <li className="text-lg text-white mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }}></li>
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
              <label className="block text-lg font-medium text-white">Upload File</label>
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
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
              <label className="block text-lg font-medium text-white">Text Prompt (Optional)</label>
              <input
                type="text"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                className="mt-2 p-2 border border-gray-500 rounded w-full bg-black text-white"
                placeholder="Enter any additional prompt (optional)"
              />
            </div>

            {/* Select an option */}
            <div className="mb-4">
              <label className="block text-lg font-medium text-white mb-2">Select an option:</label>
              <div className="flex justify-start gap-4">
                <button
                  type="submit"
                  className={`bg-${loadingCheatsheet ? "yellow-500" : "white"} text-black px-4 py-2 rounded-full`}
                  disabled={loadingCheatsheet}
                >
                  {loadingCheatsheet ? "Generating..." : "Generate Cheatsheet"}
                </button>
                <button
                  type="button"
                  className={`bg-${loadingQuiz ? "yellow-500" : "white"} text-black px-4 py-2 rounded-full ml-4`}
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                >
                  {loadingQuiz ? "Generating..." : "Generate Quiz"}
                </button>

                {/* New Generate Mnemonics Button */}
                <button
                  type="button"
                  className={`bg-${loadingMnemonics ? "yellow-500" : "white"} text-black px-4 py-2 rounded-full ml-4`}
                  onClick={handleGenerateMnemonics}
                  disabled={loadingMnemonics}
                >
                  {loadingMnemonics ? "Generating..." : "Generate Mnemonics"}
                </button>
              </div>
            </div>

            {/* Error message for selection */}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

            {/* Option Buttons for Detailed and Precise */}
            <div className="mb-4">
              <div className="flex justify-start gap-4">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full ${selectedOption === "Detailed" ? "bg-yellow-500 text-black" : "bg-white text-black"}`}
                  onClick={() => toggleSelection("Detailed")}
                >
                  Detailed
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full ${selectedOption === "Precise" ? "bg-yellow-500 text-black" : "bg-white text-black"}`}
                  onClick={() => toggleSelection("Precise")}
                >
                  Precise
                </button>
              </div>
            </div>
          </form>

          <div className="w-full max-w-4xl bg-black border border-gray-700 shadow-md rounded-lg p-6 mt-6">
            <div className="text-lg text-white">
              {cheatsheetContent ? (
                renderCheatsheetAsList()
              ) : (
                <p>{loadingCheatsheet ? "Generating your cheatsheet..." : "Your cheatsheet content will be displayed here once generated."}</p>
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
 