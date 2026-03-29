interface ToggleProps {
  label: string;
  value: boolean;
  toggle: () => void;
}

function Toggle({ label, value, toggle } : ToggleProps) {
  return (
    <div className="py-2">
      <label className="label cursor-pointer gap-2 px-0 flex flex-row justify-between align-center">
        <span className="label-text font-semibold">{label}</span>
        <input type="checkbox" className="toggle toggle-primary" checked={value} onChange={toggle} />
      </label>
    </div>
  );
}

export default Toggle;
