import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthMessage(null);
    setIsSuccess(false);

    if (!email) {
      setAuthMessage("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();
      setLoading(false);

      if (response.status === 404) {
        setAuthMessage("Your email is not registered on Cal Poly Q2S.");
        return;
      }

      if (!response.ok) {
        setAuthMessage(json.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSuccess(true);
      setAuthMessage(json.message);
    } catch (error) {
      setLoading(false);
      setAuthMessage("Unable to reach the server.");
      console.error("Password reset error:", error);
    }
  };

  return (
    <form className="gap-4 mt-4 w-full text-left" onSubmit={handleSubmit}>
      <div className="gap-1">
        <label className="text-sm text-gray-800 font-medium">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 outline-none focus:border-gray-500 w-full"
        />
      </div>

      <div className={`mt-2 text-sm ${isSuccess ? "text-calpoly-green font-bold" : "text-red-600"} ${!authMessage && "invisible"}`}>
        {authMessage ?? "placeholder"}
      </div>


      <button
        type="submit"
        disabled={loading}
        className="mb-2 mt-12 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <label className="block text-left text-sm text-center text-gray-600 mt-2">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-calpoly-green font-bold hover:underline"
        >
          Login
        </Link>
      </label>

    </form>
  );
}
