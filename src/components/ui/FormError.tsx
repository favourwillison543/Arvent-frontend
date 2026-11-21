export default function FormError({
  message,
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;

  return (
    <p role="alert" className={`text-sm text-destructive ${className}`}>
      {message}
    </p>
  );
}
