export default function Button({ children, variant = "primary", onClick, type = "button", ...rest }) {
  const className =
    variant === "primary" ? "btn-primary" : variant === "clay" ? "btn-clay" : "btn-ghost";

  return (
    <button type={type} className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}