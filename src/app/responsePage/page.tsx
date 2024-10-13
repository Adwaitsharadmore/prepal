"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import html2pdf from 'html2pdf.js';

const ResponsePage = () => {
  const [cheatsheetContent, setCheatsheetContent] = useState(null);
  const [file, setFile] = useState(null);
  const [textPrompt, setTextPrompt] = useState("");
  const [loadingCheatsheet, setLoadingCheatsheet] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingMnemonics, setLoadingMnemonics] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      alert("No file selected. Please try again.");
    }
  };

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
    setErrorMessage("");

    let customPrompt = textPrompt || "";

    if (selectedOption === "Detailed") {
      customPrompt = customPrompt || `
        Create a comprehensive cheat sheet from the provided document. Use the following format:

        1. Main Titles: Enclose in curly brackets {}.
        2. Subtopics: Enclose in square brackets [].
        3. Details: Present each detail as a bullet point under the corresponding subtopic.

        Ensure all text is in normal font. Follow this structure consistently:

        - {Main Title}
          - [Subtopic]
            - Bullet point 1
            - Bullet point 2

        Use clear and simple language for bullet points. Provide additional explanations, context, and insights beyond the document to enhance understanding. Expand on each point to ensure a thorough grasp of the topic.
      `;
    } else if (selectedOption === "Precise") {
      customPrompt = customPrompt || "Please create a precise cheat sheet...";
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

  const handleGenerateMnemonics = async () => {
    if (!file) {
      alert("Please upload a file");
      return;
    }

    setLoadingMnemonics(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("textPrompt", `
      Please create effective mnemonics for the uploaded file to help with memorizing key concepts. Follow these specific formatting rules and guidelines:

      Main Titles: Enclose each main topic in curly braces {}.
      Subtopics: Enclose each subtopic in square brackets [].
      For each subtopic, generate an appropriate mnemonic using one or more of the following methods:

      Acronyms: Form a memorable word or phrase using the first letters of the key terms. Provide an explanation of how the acronym connects to the concept.

      Example:
      [Process State Transition]
      Mnemonic: "RUN IS BLOCKED WAIT."
      Explanation: The acronym "RIBW" helps recall the states in the process lifecycle—Running, Interrupted, Blocked, Waiting.

      Acrostics: Create a sentence where each word’s first letter represents an important term.

      Example:
      [Layers of OSI Model]
      Mnemonic: "Please Do Not Throw Sausage Pizza Away."
      Explanation: The first letter of each word corresponds to the layers of the OSI model (Physical, Data Link, Network, Transport, Session, Presentation, Application).

      Associations: Link the concept to something familiar or intuitive for easier recall.

      Example:
      [Interrupt Handling]
      Mnemonic: "Like answering the phone when someone calls."
      Explanation: When an interrupt occurs, the CPU stops its current work and answers the interrupt, like answering a ringing phone.

      Chunking: Break down complex concepts into smaller, easier-to-remember parts.

      Example:
      [Memory Hierarchy]
      Mnemonic: "L1 Cache -> L2 Cache -> Main Memory -> Disk."
      Explanation: Breaking the memory hierarchy into levels helps recall the order of memory access speed.

      Method of Loci: Create a vivid journey in which key concepts are associated with specific locations.

      Example:
      [Database Normalization]
      Mnemonic: Imagine walking through a house where each room is a normal form, increasing in simplicity and organization.

      Songs/Rhymes: Develop simple, catchy songs or rhymes.

      Example:
      [Binary Search Algorithm]
      Mnemonic: "Divide and Conquer, that's the trick, cut in half, it's fast and quick!"
      Explanation: The rhyme helps recall the divide-and-conquer approach used in binary search.
    `);

    try {
      const response = await fetch("http://localhost:3001/upload-and-generate-mnemonics", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      setCheatsheetContent(data.generatedMnemonics);
    } catch (error) {
      console.error("Error fetching mnemonics:", error);
    } finally {
      setLoadingMnemonics(false);
    }
  };

  const handleGenerateQuiz = () => {
    alert("Quiz generation is not implemented yet.");
  };

  const renderCheatsheetAsList = () => {
    if (!cheatsheetContent) return null;

    const sections = cheatsheetContent.split("\n\n").filter((section) => section.trim() !== "");

    return (
      <div className="text-black">
        {sections.map((section, index) => {
          const lines = section.split("\n").filter((line) => line.trim() !== "");
          const title = lines[0].replace(/[\{\}]/g, "").trim(); // Remove curly braces

          return (
            <div key={index} className="mb-8">
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {lines.slice(1).map((line, lineIndex) => {
                let cleanedLine = line.replace(/^\-\s*/, "").trim();

                // Remove all asterisks and square brackets
                cleanedLine = cleanedLine.replace(/[\*\[\]]/g, "");

                if (cleanedLine.startsWith("Acronym:") || cleanedLine.startsWith("Acrostic:") || cleanedLine.startsWith("Association:")) {
                  const [mnemonicType, content] = cleanedLine.split(":");
                  return (
                    <p key={lineIndex} className="ml-4 mb-2">
                      <strong>{mnemonicType}:</strong> {content.trim()}
                    </p>
                  );
                } else if (cleanedLine.startsWith("Explanation:")) {
                  const explanation = cleanedLine.replace("Explanation:", "").trim();
                  return (
                    <p key={lineIndex} className="ml-4 mb-2">
                      <strong>Explanation:</strong> {explanation}
                    </p>
                  );
                } else if (cleanedLine.startsWith("-")) {
                  return (
                    <p key={lineIndex} className="ml-8 mb-2">
                      {cleanedLine}
                    </p>
                  );
                } else {
                  return (
                    <h3 key={lineIndex} className="text-xl font-bold mt-4 mb-2">
                      {cleanedLine}
                    </h3>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Define the toggleSelection function to handle option changes
  const toggleSelection = (option) => {
    // If the clicked option is already selected, deselect it; otherwise, select the new option.
    if (selectedOption === option) {
      setSelectedOption(""); // Deselect if it's the current option
    } else {
      setSelectedOption(option); // Select the clicked option
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('cheatsheet-content');
    
    if (!element) {
      console.error('Cheatsheet content element not found');
      return;
    }

    const opt = {
      margin: 10,
      filename: 'cheatsheet.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().catch(err => {
      console.error('Error generating PDF:', err);
    });
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
                  className={`bg-${loadingMnemonics ? "yellow-500" : "white"} text-black px-4 py-2 rounded-full ml-4`}
                  onClick={handleGenerateMnemonics}
                  disabled={loadingMnemonics}
                >
                  {loadingMnemonics ? "Generating..." : "Generate Mnemonics"}
                </button>
                <button
                  type="button"
                  className={`bg-${loadingQuiz ? "yellow-500" : "white"} text-black px-4 py-2 rounded-full ml-4`}
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz}
                >
                  {loadingQuiz ? "Generating..." : "Generate Quiz"}
                </button>
              </div>
            </div>

            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

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

          <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6 mt-6">
            <div id="cheatsheet-content" className="text-lg text-black min-h-[500px]">
              {cheatsheetContent ? (
                renderCheatsheetAsList()
              ) : (
                <p>{loadingCheatsheet ? "Generating your cheatsheet..." : "Your cheatsheet content will be displayed here once generated."}</p>
              )}
            </div>
          </div>

          {cheatsheetContent && (
            <button
              onClick={handleDownloadPDF}
              className="mt-4 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              Download as PDF
            </button>
          )}

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