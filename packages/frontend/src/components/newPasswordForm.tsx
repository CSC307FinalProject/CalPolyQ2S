import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

interface Props {
  token: string;
}

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function NewPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthMessage(null);
    setIsSuccess(false);

    if (!password || !confirmPassword) {
      setAuthMessage("Please fill in both fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAuthMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl("/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      const json = await response.json();
      setLoading(false);

      if (!response.ok) {
        setAuthMessage(json.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSuccess(true);
      setAuthMessage(json.message);
    } catch (error) {
      setLoading(false);
      setAuthMessage("Unable to reach the server.");
      console.error("New password error:", error);
    }
  };

  return (
    <form className="gap-4 mt-4 w-full text-left" onSubmit={handleSubmit}>
      <div className="gap-1">
        <label className="text-sm text-gray-800 font-medium">New Password</label>

        <div className="relative">
          <input
            name="password"
            minLength={8}
            required
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 outline-none focus:border-gray-500 w-full pr-12"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      <div className="gap-1 mt-6">
        <label className="text-sm text-gray-800 font-medium">
          Confirm Password
        </label>
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 outline-none focus:border-gray-500 w-full pr-12"
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      <div
        className={`mt-2 text-sm ${isSuccess ? "text-calpoly-green font-bold" : "text-red-600"} ${!authMessage && "invisible"}`}
      >
        {authMessage ?? "placeholder"}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mb-2 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving..." : "Set New Password"}
      </button>

      <label className="block text-sm text-center text-gray-600 mt-2">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-calpoly-green font-bold hover:underline"
        >
          Sign In
        </Link>
      </label>
    </form>
  );
}
