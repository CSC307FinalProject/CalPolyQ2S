import RegisterForm from "../components/registerform";
import calPolyImg from "../assets/CalPolyArialView.jpg";


function Register() {
  return (
    <div className="flex w-full h-screen">

      {/* Left Side - Registration Form */}
      <div className="flex w-1/2 px-10 py-5">
        <div className="text-left leading-tight font-bold">
          Cal Poly Q2S
        </div>

        <div className="justify-center items-center">
          <div className="flex flex-col gap-1 mt-16">
            <div className="text-left leading-tight font-bold text-6xl">
              Welcome
            </div>
            <div className="text-left text-xl ml-1">
              Register your account
            </div>
          </div>

          <div className="mt-10">
            <RegisterForm />
          </div>
          
        </div>

        
      </div>

      {/* 
        TODO: FIND HIGHER RES CAL POLY PHOTO, MAYBE FROM
        https://ucm.calpoly.edu/photo-assets
      */}

      {/* Right Side - Cal Poly Photo */}
      <div className="w-1/2 h-full p-4">
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
