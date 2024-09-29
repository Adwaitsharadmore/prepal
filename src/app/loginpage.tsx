import "./globals.css";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen bg-custom_background_color flex flex-col items-center justify-center">
      <header className="w-full p-4 flex justify-between items-center bg-black text-white shadow-lg">
        <div className="font-bold text-3xl text-customcolor font-inter pl-3">
          PrepPal
        </div>
        <div className="flex gap-5 items-center">
          <div>Login</div>
          <div>Contact</div>
          <div>Home</div>
        </div>
      </header>

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md mt-8">
        <h2 className="text-4xl font-extrabold text-center green-glow mb-6">
          Welcome to PrepPal
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2.5 w-full border rounded-full bg-gray-100"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2.5 w-full border rounded-full bg-gray-100"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-customcolor text-white p-3 rounded-full hover:bg-green-600 transition-colors"
          >
            Log In
          </button>
          <p className="text-center text-sm mt-4">
            New here?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Create an account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
