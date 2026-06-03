import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("invalid");
      setLoading(false);
      return;
    }

    fetch(apiUrl(`/verify-email?token=${encodeURIComponent(token)}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setSuccess(true);
        } else if (data.error?.toLowerCase().includes("expired")) {
          setError("expired");
        } else {
          setError("invalid");
        }
      })
      .catch(() => setError("invalid"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <div className="text-left leading-tight font-bold mb-8">
          <Link to="/">Cal Poly Q2S</Link>
        </div>

        {loading && (
          <p className="text-gray-500">Verifying your email...</p>
        )}

        {success && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Email verified!</h2>
            <p className="text-gray-500 mb-6">Your account is now active. You can log in.</p>
            <Link
              to="/login"
              className="mt-6 block w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-calpoly-green"
            >
              Go to Login
            </Link>
          </div>
        )}

        {error === "expired" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Link expired</h2>
            <p className="text-gray-500 mb-6">
              This verification link has expired. Request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-calpoly-green"
            >
              Back to Login
            </Link>
          </div>
        )}

        {error === "invalid" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid link</h2>
            <p className="text-gray-500 mb-6">
              This verification link is invalid or has already been used.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-calpoly-green"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
