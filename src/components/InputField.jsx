/**
 * Reusable Form Input Component
 * Aligned with FEE-II syllabus: forms, validation, and reusable inputs.
 */
export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  helperText,
  ...rest
}) {
  const errorId = id ? `${id}-error` : undefined;
  const helperId = id ? `${id}-helper` : undefined;

  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      {label && (
        <label htmlFor={id}>
          {label} {required && <span className="req-star" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
        className={error ? "input-invalid" : ""}
        {...rest}
      />
      {error && (
        <div id={errorId} className="err" role="alert">
          {error}
        </div>
      )}
      {!error && helperText && (
        <div id={helperId} className="field-hint">
          {helperText}
        </div>
      )}
    </div>
  );
}
