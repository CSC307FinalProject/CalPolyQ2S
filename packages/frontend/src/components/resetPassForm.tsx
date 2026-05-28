import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
  email: string;
}

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function ResetPassForm() {
  const [formData, setFormData] = useState<FormData>({
    email: ""
  });

  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    if (!formData.email) {
      setAuthMessage("Invalid email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      const json = await response.json();
      setLoading(false);

      if (!response.ok) {
        setAuthMessage(json.error || "Login failed. Please try again.");
        return;
      }

      navigate("/class-selector");
    } catch (error) {
      setLoading(false);
      setAuthMessage("Unable to reach the login server.");
      console.error("Login error:", error);
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
          value={formData.email}
          onChange={handleChange}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 outline-none focus:border-gray-500 w-full"
        />
      </div>

      <div className="mb-4 min-h-5 text-sm text-red-600">{authMessage}</div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 mb-2 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <label className="text-sm text-center text-gray-600">
        Need to sign up?{" "}
        <Link
          to="/register"
          className="text-calpoly-green font-bold hover:underline"
        >
          Create Account
        </Link>
      </label>
    </form>
  );
}
