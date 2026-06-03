import { use, useMemo, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

type Status = "success" | "expired" | "invalid";

async function fetchStatus(token: string): Promise<Status> {
  try {
    const res = await fetch(
      apiUrl(`/verify-email?token=${encodeURIComponent(token)}`),
    );
    const data = await res.json();
    if (data.message) return "success";
    if (data.error?.toLowerCase().includes("expired")) return "expired";
    return "invalid";
  } catch {
    return "invalid";
  }
}

function VerifyEmailResult({ token }: { token: string }) {
  const promise = useMemo(() => fetchStatus(token), [token]);
  const status = use(promise);

  if (status === "success") {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Email verified!
        </h2>
        <p className="text-gray-500 mb-6">
          Your account is now active. You can log in.
        </p>
        <Link
          to="/login"
          className="mt-6 block w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-calpoly-green"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Link expired</h2>
        <p className="text-gray-500 mb-6">
          This verification link has expired. Request a new one from the login
          page.
        </p>
        <Link
          to="/login"
          className="block w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-calpoly-green"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
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
  );
}

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md w-full text-center">
        <div className="text-left leading-tight font-bold mb-8">
          <Link to="/">Cal Poly Q2S</Link>
        </div>

        {!token ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Invalid link
            </h2>
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
        ) : (
          <Suspense
            fallback={<p className="text-gray-500">Verifying your email...</p>}
          >
            <VerifyEmailResult token={token} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
