import React from "react";

interface UnitCardProps {
  units: number;
  unit_type: string;
}

const UnitsCard: React.FC<UnitCardProps> = ({ units, unit_type }) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-64 text-left flex flex-col items-start"
      style={{ border: "1px solid var(--border)" }}
    >
      <p className="text-xl font-bold text-slate-900">{units}</p>
      <p className="text-base font-medium text-slate-600">Units Done</p>
      <p className="text-sm text-slate-400">{unit_type} units</p>
    </div>
  );
};

interface TermCardProps {
  terms: number;
}

const TermsCard: React.FC<TermCardProps> = ({ terms }) => {
  return (
    <div
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-64 text-left flex flex-col items-start"
      style={{ border: "1px solid var(--border)" }}
    >
      <p className="text-xl font-bold text-slate-900">{terms}</p>
      <p className="text-base font-medium text-slate-600">Terms Left</p>
      <p className="text-sm text-slate-400">Semesters</p>
    </div>
  );
};
interface UnitAndTermCardProps {
  units: number;
  terms: number;
  unit_type: string;
}

export const Cards: React.FC<UnitAndTermCardProps> = ({
  units,
  terms,
  unit_type,
}) => {
  return (
    <div className="flex flex-row gap-4 items-center justify-center">
      <UnitsCard units={units} unit_type={unit_type} />
      <TermsCard terms={terms} />
    </div>
  );
};
