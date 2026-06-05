import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Eye, EyeOff, Circle, CircleCheckBig } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiUrl } from "../lib/api";

interface FormData {
  email: string;
  password: string;
  staySignedIn: boolean;
}

type FormSubmitHandler = NonNullable<ComponentProps<"form">["onSubmit"]>;

export default function PasswordResetForm() {
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
      const response = await fetch(apiUrl("/login"), {
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

      // create a user obj for session
      const userObj = JSON.stringify({
        token: json.token,
        student_id: json.student_id,
        email: formData.email,
      });
      if (formData.staySignedIn) {
        localStorage.setItem("user", userObj);
      } else {
        sessionStorage.setItem("user", userObj);
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
