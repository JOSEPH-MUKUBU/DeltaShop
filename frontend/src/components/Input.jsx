import clsx from "clsx";

export function Input({ className, label, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className={clsx(
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2",
          className
        )}
        {...props}
      />
    </label>
  );
}

