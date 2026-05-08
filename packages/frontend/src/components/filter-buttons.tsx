interface FilterButtonProps {
  title: string;
}
export default function FilterButton({ title }: FilterButtonProps) {
  return (
    <button className="text-sm text-black py-2 px-3 border border-gray-400 rounded-xl transition-colors duration-300 hover:bg-[#154734] hover:text-white cursor-pointer">
      {title}
    </button>
  );
}
