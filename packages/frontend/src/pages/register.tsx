import RegisterForm from "../components/registerForm";
import calPolyImg from "../assets/CalPolyArialView.jpg";
import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Left Side - Registration Form */}
      <div className="flex flex-col w-full md:w-1/2 px-8 sm:px-12 md:px-14 py-8">
        <Link to="/">
          <div className="text-left leading-tight font-bold">Cal Poly Q2S</div>
        </Link>

        <div className="flex flex-col mt-10 md:mt-16">
          <div className="flex flex-col gap-1">
            <div className="text-left leading-tight font-bold text-4xl sm:text-5xl md:text-6xl">
              Welcome
            </div>
            <div className="text-left text-lg sm:text-xl ml-1 mt-1">Register your account</div>
          </div>

          <div className="mt-8 md:mt-10 w-full max-w-sm">
            <RegisterForm />
          </div>
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
