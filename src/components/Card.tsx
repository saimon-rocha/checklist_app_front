"use client";

export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-slate-100
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        p-5
        md:p-6
        transition-all
        duration-300
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]
      "
    >
      {children}
    </div>
  );
}