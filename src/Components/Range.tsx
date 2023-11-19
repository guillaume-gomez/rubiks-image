

interface RangeProps {
  label: string;
  value: boolean;
  onChange: (value: number) => void;
  min?: number;
  max?: number
}

function Range({ label, value, onChange, min = 0, max = 100 } : RangeProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer flex flex-row gap-1">
        <span className="label-text">{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          className="range"
          onChange={(event) => onChange(parseInt(event.target.value, 10))}
        />
        <span>{value}</span>
      </label>
    </div>
  );
}

export default Range;
