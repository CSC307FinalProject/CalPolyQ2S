import { ArrowUpRight } from "lucide-react";

interface FetchButtonProps {
  fetchClasses: () => void;
}

export default function FetchButton({ fetchClasses }: FetchButtonProps) {
  return (
    <button
      className="inline-flex items-center justify-center relative text-xs font-medium rounded-full h-9 p-1 ps-5 pe-11 group transition-all duration-700 ease-in-out hover:ps-11 w-fit overflow-hidden cursor-pointer bg-black text-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      onClick={fetchClasses}
    >
      <span className="relative z-10 block overflow-hidden h-4">
        <span className="invisible block leading-4">Show Classes</span>
        <span className="absolute top-0 left-0 block leading-4 transition-transform duration-500 ease-in-out delay-200 group-hover:-translate-y-full">
          Select Major
        </span>
        <span className="absolute top-full left-0 block leading-4 transition-transform duration-500 ease-in-out delay-200 group-hover:-translate-y-full">
          Show Classes
        </span>
      </span>
      <div className="absolute right-1 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center transition-all duration-700 ease-in-out group-hover:right-[calc(100%-36px)] group-hover:rotate-45">
        <ArrowUpRight size={13} />
      </div>
    </button>
  );
}
