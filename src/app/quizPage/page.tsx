"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string | null;
}

const QuizPage = () => {
  const router = useRouter();
  const [quizContent, setQuizContent] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);
  const [showFinalFeedback, setShowFinalFeedback] = useState(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [incorrectQuestions, setIncorrectQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const quiz = urlParams.get("quiz");
    const fileName = urlParams.get("originalFileName");

    if (quiz && quiz !== "undefined" && quiz.length > 0) {
      const parsedQuiz = parseQuizContent(quiz);
      if (parsedQuiz.length > 0) {
        setQuizContent(parsedQuiz);
      } else {
        console.error("Parsed quiz content is empty or invalid.");
        setQuizContent([]);
      }
    } else {
      console.error("Quiz parameter is missing or invalid.");
      setQuizContent([]);
    }

    if (fileName && fileName !== "undefined") {
      setOriginalFileName(fileName);
    } else {
      console.error("Original file name is missing or invalid.");
    }
  }, []);

  useEffect(() => {
    if (quizContent.length > 0 && attempts.length === 0) {
      setAttempts(new Array(quizContent.length).fill(0));
    }
  }, [quizContent]);

  const parseQuizContent = (quiz: string): QuizQuestion[] => {
    const questions = quiz.split("{").filter((item) => item.includes("?"));
    return questions
      .map((q) => {
        const parts = q.split("}");
        if (parts.length < 2) {
          console.error("Invalid question format:", q);
          return null;
        }

        const [questionPart, optionsPart] = parts;
        if (!optionsPart) {
          console.error("Options part is missing for question:", questionPart);
          return null;
        }

        const optionsMatch = optionsPart.match(/\[([^\]]+)\]/);
        const options = optionsMatch
          ? optionsMatch[1]
              .split("\n")
              .map((opt) => opt.trim())
              .filter((opt) => opt.length > 0)
          : [];

        const correctAnswerMatch = optionsPart.match(/\(([a-d])\)/);
        const correctAnswerLetter = correctAnswerMatch
          ? correctAnswerMatch[1]
          : null;

        return {
          question: questionPart.trim(),
          options: options.slice(0, 4),
          correctAnswer: correctAnswerLetter,
        };
      })
      .filter((q) => q !== null) as QuizQuestion[];
  };

  const fetchFeedback = async () => {
    if (!originalFileName) {
      console.error('Original file name is missing.');
      return;
    }

    try {
      const response = await fetch('/api/get-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: quizContent.map(q => q.question),
          attempts,
          originalFileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }

      const data = await response.json();
      setApiFeedback(data.feedback.join('\n'));
      setShowFinalFeedback(true);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Failed to fetch feedback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (isCorrect) return;

    setSelectedAnswer(index);
    const correct =
      quizContent[currentQuestion].correctAnswer ===
      String.fromCharCode(97 + index);
    setFeedback(correct ? "Correct answer!" : "Incorrect answer.");
    setIsCorrect(correct);

    if (!correct) {
      setIncorrectQuestions((prev) => [
        ...prev,
        quizContent[currentQuestion].question,
      ]);
    }

    setAttempts((prev) => {
      const newAttempts = prev.map((attempt, idx) =>
        idx === currentQuestion ? attempt + 1 : attempt
      );
      return newAttempts;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizContent.length - 1) {
      setFeedback(null);
      setSelectedAnswer(null);
      setIsCorrect(false);
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleQuizCompletion();
    }
  };

  const handleQuizCompletion = () => {
    if (quizContent.length === 0) {
      setError('No quiz content available.');
      return;
    }

    if (!originalFileName) {
      setError('Original file name is missing.');
      return;
    }

    if (!isLoading) {
      setIsLoading(true);
      fetchFeedback();
      setShowFinalFeedback(true);
    }
  };

  const generatePracticeQuestions = async () => {
    if (!originalFileName) {
      console.error("Original file name is missing.");
      return;
    }

    try {
      const response = await fetch("/api/get-morequestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: quizContent.map((q) => q.question),
          attempts,
          originalFileName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await response.json();
      const newQuizContent = parseQuizContent(data.feedback.join("\n"));
      setQuizContent(newQuizContent);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setFeedback(null);
      setIsCorrect(false);
      setAttempts(new Array(newQuizContent.length).fill(0));
      setShowFinalFeedback(false);
    } catch (error) {
      console.error("Error generating practice questions:", error);
      setError("Could not generate practice questions. Try again later.");
    }
  };

  if (!quizContent.length) {
    return (
      <div className="min-h-screen bg-black bg-gradient-preppal text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-semibold mb-6">Loading...</h1>
      </div>
    );
  }

  const handleBackToHome = async () => {
    try {
await fetch("http://localhost:3001/api/cleanup", {
  method: "POST",
});
      console.log("Cleanup successful");
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      router.push("/");
    }
  };

  if (!quizContent.length) {
    return (
      <div className="min-h-screen bg-black bg-gradient-preppal text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-semibold mb-6">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black bg-gradient-preppal text-white flex flex-col items-center justify-center">
      {error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">{error}</div>
      )}
      <header className="absolute top-0 left-0 p-4">
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
      </header>

      <h1 className="text-4xl font-semibold mb-6">Here's your quiz!</h1>

      {!showFinalFeedback ? (
        <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-lg w-3/4">
          <h2 className="text-2xl font-semibold mb-4">
            {quizContent[currentQuestion]?.question}
          </h2>

          <ul>
            {quizContent[currentQuestion]?.options.map((option, index) => (
              <li
                key={index}
                className={`border p-4 rounded-lg my-2 cursor-pointer 
                ${
                  selectedAnswer === index && feedback === "Correct answer!"
                    ? "bg-green-500"
                    : selectedAnswer === index
                    ? "bg-red-500"
                    : "bg-gray-800"
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-lg w-3/4">
          <h2 className="text-2xl font-semibold mb-4">Quiz Completed!</h2>
          {apiFeedback ? (
            <div className="mt-2 text-white">
              {apiFeedback.split("\n").map((part, index) => (
                <p key={index}>{part}</p>
              ))}
            </div>
          ) : (
            <div>No additional feedback required!</div>
          )}
          <button
            onClick={generatePracticeQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Practice More
          </button>
          <button
            onClick={handleBackToHome}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Back to Home
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`mt-4 text-lg font-semibold ${
            feedback.includes("Correct") ? "text-green-500" : "text-red-500"
          }`}
        >
          {feedback}
        </div>
      )}

      {isCorrect && (
        <button
          onClick={
            currentQuestion < quizContent.length - 1
              ? handleNextQuestion
              : generatePracticeQuestions
          }
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          {currentQuestion < quizContent.length - 1
            ? "Next Question"
            : "Practice More"}
        </button>
      )}
      {!isCorrect && currentQuestion === quizContent.length - 1 && (
        <button
          onClick={generatePracticeQuestions}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Practice More
        </button>
      )}
      {!isCorrect && currentQuestion === quizContent.length - 1 && (
        <button
          onClick={handleBackToHome}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Back to Home
        </button>
      )}
    </div>
  );
};

export default QuizPage;
