import React from "react"



interface UnitCardProps {
  units: number;
  unit_type: string;
}

const UnitsCard: React.FC<UnitCardProps> = ({ units, unit_type }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-64">
      {/* Top line: Largest and darkest */}
      <p className="text-xl font-bold text-slate-900">
        {units}
      </p>
      
      {/* Middle line: Medium size and slightly grayed out */}
      <p className="text-base font-medium text-slate-600">
        Units Done
      </p>
      
      {/* Bottom line: Smallest and faintest */}
      <p className="text-sm text-slate-400">
        {unit_type} units
      </p>
    </div>
  );
};


export default UnitsCard;