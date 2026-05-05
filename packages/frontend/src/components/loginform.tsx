import { useState, type ChangeEvent, type ComponentProps } from 'react';
import { Eye, EyeOff, Circle, CircleCheckBig } from 'lucide-react';


interface FormData {
  email: string;
  password: string;
  staySignedIn: boolean;
}


type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;


export default function LoginForm() {
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    staySignedIn: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault();
    // TODO: IMPLEMENT POST CALL HERE
    console.log("IMPLEMENT POST CALL TO BACKEND");
  };

// CURRENT OVERALL TODOS: 
// Add hover features to buttons and such
// Replace "show" and "hide" with eye

  return (
    <form className="gap-4 mt-4 w-80 text-left" onSubmit={handleSubmit}>

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
        <label className="text-sm text-gray-800 font-medium">
          Password
        </label>
        
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-black placeholder-gray-400 outline-none focus:border-gray-500 w-full pr-12"
          />
          {/*TODO: replace "hide" and "show" with icons*/}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
          >
            {showPassword ? <EyeOff/> : <Eye/> }
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

        { formData.staySignedIn ? <CircleCheckBig className='w-4'/> : <Circle className='w-4'/> }
        
        Keep me signed in
      
      </label>

      
      <button  
        type="submit"
        className="mb-2 w-full py-3 rounded-lg bg-black text-white font-semibold cursor-pointer hover:bg-calpoly-green"
      >
        Sign In
      </button>

      <p className="text-sm text-center text-gray-600">
        Need to sign up?{' '}
        <a href="/registration" className="text-calpoly-green font-bold hover:underline">
          Create Account
        </a>
      </p>

    </form>
  );
}
