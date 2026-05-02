import LoginForm from "../components/loginform";


function Login() {
     return (
    <div className="relative w-full h-screen">

      <div className="absolute inset-0 -z-10"></div>

        <div className="text-left leading-tight font-bold px-10 pt-5 pb-8 w-[50vw]">
          Cal Poly Q2S
        </div>

        <div className="flex flex-col gap-1 px-10">
          <div className="text-left leading-tight font-bold text-6xl w-[50vw]">
            Welcome Back
          </div>
          <div className="text-left text-xl">
            Log into your account
          </div>
        </div>
        <div className="mt-25 px-10">
            <LoginForm/>
        </div>
      </div>
  );
}

export default Login;