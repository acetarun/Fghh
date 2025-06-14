export function Input({ name, value, onChange, placeholder }) {
  return (
    <input
      className="border p-2 rounded w-full"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}