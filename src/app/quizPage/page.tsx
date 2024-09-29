"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; // Import Link to handle routing back to the homepage
import Image from "next/image";

const QuizPage = () => {
  const [quizContent, setQuizContent] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Store the selected answer
  const [feedback, setFeedback] = useState(null); // Correct/Incorrect feedback
  const [showAnswer, setShowAnswer] = useState(false); // Whether to show the correct answer or not
  const [isCorrect, setIsCorrect] = useState(false); // Track whether the selected answer is correct

  // Simulate fetching quiz content (Replace this with actual API call or content fetching)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quiz = urlParams.get("quiz");

    if (quiz) {
      const parsedQuiz = parseQuizContent(quiz); // Parse the quiz content into questions
      setQuizContent(parsedQuiz);
    }
  }, []);

  // Function to parse the quiz content and return a list of questions
  const parseQuizContent = (quiz) => {
    const questions = quiz.split("{").filter((item) => item.includes("?")); // Split by "{"
    const parsedQuestions = questions.map((q) => {
      const [questionPart, optionsPart] = q.split("}"); // Split by "}"

      // Extract options inside the square brackets `[]`
      const optionsMatch = optionsPart.match(/\[([^\]]+)\]/); // Find everything inside square brackets
      const options = optionsMatch ? optionsMatch[1].split("\n").map((opt) => opt.trim()) : []; // Split by newline or other delimiters

      // Find the correct answer (after the square brackets)
      const correctAnswerMatch = optionsPart.match(/\(([a-d])\)/);
      const correctAnswerLetter = correctAnswerMatch ? correctAnswerMatch[1] : null;

      return {
        question: questionPart.trim(),
        options: options, // Store cleaned options
        correctAnswer: correctAnswerLetter, // Store the correct answer letter (e.g., "c")
      };
    });
    return parsedQuestions;
  };

  // Handle answer selection
  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    const correctAnswerLetter = quizContent[currentQuestion].correctAnswer; // Get correct answer letter (e.g., "c")
    const selectedOptionLetter = quizContent[currentQuestion].options[index].charAt(0); // Get the letter of the selected option (e.g., "a", "b", etc.)

    if (selectedOptionLetter === correctAnswerLetter) {
      setFeedback("Correct answer!");
      setShowAnswer(false); // No need to show the correct answer if the selected one is correct
      setIsCorrect(true); // Mark the answer as correct, so the Next button appears
    } else {
      setFeedback("Try again!"); // Only show "Try again" on incorrect answer
      setShowAnswer(false); // Do not show the correct answer
      setIsCorrect(false); // Keep Next button hidden since the answer is incorrect
    }
  };


  // Move to the next question
  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setIsCorrect(false); // Reset the correct answer status for the next question
    setCurrentQuestion((prev) => prev + 1);
  };

  if (!quizContent.length) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="min-h-screen bg-black bg-gradient-preppal text-white flex flex-col items-center justify-center">
      {/* PrepPal Header in the top left */}
      <header className="absolute top-0 left-0 p-4">
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
      </header>

      <h1 className="text-4xl font-semibold mb-6">Here's your quiz!</h1>

      {/* Question Slide */}
      <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-lg w-3/4">
        <h2 className="text-2xl font-semibold mb-4">{quizContent[currentQuestion].question}</h2>

        {/* Options */}
        <ul>
          {quizContent[currentQuestion].options.map((option, index) => (
            <li
              key={index}
              className={`border p-4 rounded-lg my-2 cursor-pointer 
              ${
                selectedAnswer === index && feedback === "Correct answer!"
                  ? "bg-green-500"
                  : selectedAnswer === index
                  ? "bg-red-500"
                  : "bg-gray-800"
              }`} // Turn green if correct, red if wrong
              onClick={() => handleAnswerSelect(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 text-lg font-semibold ${
            feedback.includes("Correct") ? "text-green-500" : "text-red-500"
          }`}
        >
          {feedback}
        </div>
      )}

      {/* Display Next or Well done message based on the current question */}
      {isCorrect && currentQuestion < quizContent.length - 1 && (
        <button
          className="mt-6 bg-black text-white border border-gray-700 px-4 py-2 rounded-full"
          onClick={handleNextQuestion}
        >
          Next
        </button>
      )}

      {/* Congrats! You have completed the quiz. text and Back button - Only display after the last question */}
      {isCorrect && currentQuestion === quizContent.length - 1 && (
        <div className="text-center mt-8">
          {/* "Congrats! You have completed the quiz." text */}
          <div className="text-lg font-bold text-green-500 mb-4">
            Congrats! You have completed the quiz.
          </div>

          {/* Back button */}
          <Link href="/responsePage">
            <label className="flex items-center justify-center w-58 p-4 bg-black text-white border rounded-full cursor-pointer hover:bg-custom-hover transition-colors">
              <span className="font-bold">Back</span>
            </label>
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
