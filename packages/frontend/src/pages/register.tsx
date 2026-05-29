import { useState } from "react";
import RegisterForm from "../components/registerForm";
import calPolyImg from "../assets/CalPolyArialView.jpg";
import { Link } from "react-router-dom";

function Register() {
  const [registeredEmail, setRegisteredEmail] = useState("");

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
              
                  <br/> Click it to activate your Cal Poly Q2S account.
              
              </p>

              <hr className="border-gray-200" />
              
              <div>
              
                <p className="text-sm text-gray-500">
                  Didn't receive an email?<br />Check your spam folder or resend below.
                </p>
              
                <button
                  type="button"
                  className="mt-3 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green"
                >
                  Resend Email
                </button>
              
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
                <RegisterForm onRegistered={(email) => setRegisteredEmail(email)} />
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
