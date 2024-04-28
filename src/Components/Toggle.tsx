interface ToggleProps {
  label: string;
  value: boolean;
  toggle: () => void;
}

function Toggle({ label, value, toggle } : ToggleProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-2 px-0">
        <span className="label-text">{label}</span>
        <input type="checkbox" className="toggle toggle-primary" checked={value} onChange={toggle} />
      </label>
    </div>
  );
}

export default Toggle;
