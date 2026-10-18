// Error message and character counter shown under an input. The counter
// only appears once the value is within 20% of the limit (or over it).
const FieldHint = ({ field, value, error }) => {
  const length = String(value ?? "").trim().length;
  const showCount = field.maxLength && length >= field.maxLength * 0.8;

  if (!error && !showCount) return null;

  return (
    <div className="flex justify-between gap-2 text-xs">
      <span className="text-red-500">{error}</span>
      {showCount && (
        <span className={length > field.maxLength ? "text-red-500" : "text-fg/50"}>
          {length}/{field.maxLength}
        </span>
      )}
    </div>
  );
};

export default FieldHint;
