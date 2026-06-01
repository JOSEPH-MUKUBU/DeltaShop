import clsx from "clsx";

export function Button({ className, variant = "primary", ...props }) {
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-slate-100 text-slate-900"
      : variant === "danger"
        ? "bg-rose-600 hover:bg-rose-700 text-white"
        : "bg-slate-900 hover:bg-slate-800 text-white";

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50",
        styles,
        className
      )}
      {...props}
    />
  );
}

