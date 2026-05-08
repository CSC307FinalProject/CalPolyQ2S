import React from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-9 w-full rounded-lg border border-gray-400 bg-background px-3 py-3 text-sm text-black shadow-sm shadow-black/5 
            transition-shadow placeholder:text-gray-400 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px]
             focus-visible:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50  ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
