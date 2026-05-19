import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Eye, EyeOff, Circle, CircleCheckBig } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface FormData {
  email: string;
  password: string;
  staySignedIn: boolean;
}

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export function logout() {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    staySignedIn: false,
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.email || !formData.password) {
      setAuthMessage("Please enter both email and password.");
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
          email: formData.email,
          password: formData.password,
        }),
      });

      const json = await response.json();
      setLoading(false);

      if (!response.ok) {
        setAuthMessage(json.error || "Login failed. Please try again.");
        return;
      }

      if (formData.staySignedIn) {
        localStorage.setItem("token", json.token);
      } else {
        sessionStorage.setItem("token", json.token);
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

      <div className="gap-1 mt-6">
        <label className="text-sm text-gray-800 font-medium">Password</label>

        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
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

      <label className="mt-2 mb-8 flex items-center gap-2 text-sm text-black cursor-pointer select-none hover:text-gray-600">
        <input
          name="staySignedIn"
          type="checkbox"
          checked={formData.staySignedIn}
          onChange={handleChange}
          className="sr-only"
        />
        {formData.staySignedIn ? (
          <CircleCheckBig className="w-4" />
        ) : (
          <Circle className="w-4" />
        )}
        Keep me signed in
      </label>

      {authMessage ? (
        <div className="mb-4 text-sm text-red-600">{authMessage}</div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mb-2 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
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