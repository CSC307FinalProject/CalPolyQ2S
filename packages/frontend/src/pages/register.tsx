import { useState, useEffect, useRef } from "react";
import RegisterForm from "../components/registerForm";
import calPolyImg from "../assets/CalPolyArialView.jpg";
import { Link } from "react-router-dom";
import { apiUrl } from "../lib/api";

const RESEND_COOLDOWN = 20;

function Register() {
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Starts a cooldown, used for when resend email button is pressed
  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    intervalRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    // Disable resend capability while function is
    // in the process of resending
    setResending(true);
    setResendMsg(null);

    // POST call to backend
    try {
      const res = await fetch(apiUrl("/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await res.json();

      // Status 429 => RATE LIMITING
      if (res.status === 429) {
        setResendMsg(
          "Too many attempts. Please wait 15 minutes before trying again.",
        );
      } else if (res.ok) {
        setResendMsg("Verification email resent. Check your inbox.");
        startCooldown();
      } else {
        setResendMsg(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setResendMsg("Network error. Please try again.");
    } finally {
      // Re-enable resend functionality once done
      setResending(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left Side - Registration Form */}
      <div className="flex flex-col w-full md:w-1/2 px-8 sm:px-12 md:px-14 py-8">
        <Link to="/">
          <div className="text-left leading-tight font-bold">Cal Poly Q2S</div>
        </Link>

        <div className="flex flex-col mt-10 md:mt-16">
          {registeredEmail ? (
            <div className="mt-20 w-full max-w-sm flex flex-col gap-6">
              <p className="text-xl text-gray-700 leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-bold text-black">{registeredEmail}</span>.
                <br /> Click it to activate your Cal Poly Q2S account.
              </p>

              <hr className="border-gray-200" />

              <div>
                <p className="text-sm text-gray-500">
                  Didn't receive an email?
                  <br />
                  Check your spam folder or resend below.
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="mt-3 mb-6 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending
                    ? "Sending..."
                    : cooldown > 0
                      ? `Resend Email (${cooldown}s)`
                      : "Resend Email"}
                </button>

                {resendMsg && (
                  <p className="mt-6 text-sm text-gray-500">{resendMsg}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-1">
                <div className="text-left leading-tight font-bold text-4xl sm:text-5xl md:text-6xl">
                  Welcome
                </div>

                <div className="text-left text-lg sm:text-xl ml-1 mt-1">
                  Register your account
                </div>
              </div>

              <div className="mt-8 md:mt-10 w-full max-w-sm">
                <RegisterForm
                  onRegistered={(email) => setRegisteredEmail(email)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/*
        TODO: FIND HIGHER RES CAL POLY PHOTO, MAYBE FROM
        https://ucm.calpoly.edu/photo-assets
      */}

      {/* Right Side - Cal Poly Photo */}
      <div className="hidden md:block md:w-1/2 h-full p-4">
        <img
          src={calPolyImg}
          alt="Cal Poly Arial View"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
}

export default Register;
