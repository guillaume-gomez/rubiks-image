

interface RangeProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number
  disabled?: boolean
}

function Range({ label, value, onChange, min = 0, max = 100, step = 1, disabled = false } : RangeProps) {

  if(min === max || disabled) {
    return (
      <label className="label cursor-pointer flex flex-row gap-2">
        <span className="label-text font-semibold h-full">{label}</span>
        <span className="font-bold">{value}</span>
      </label>
      );
  }

  return (
    <div className="form-control">
      <label className="label cursor-pointer flex flex-row gap-2">
        <span className="label-text font-semibold h-full">{label}</span>
        <div className="w-full flex flex-col gap-0">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            className={`range range-primary range-sm`}
            onChange={(event) => onChange(parseInt(event.target.value, 10))}
          />

          <div className="flex flex-row justify-between text-sm">
            <span className="italic">{min}</span>
            <span className="font-bold">{value}</span>
            <span className="italic">{max}</span>
          </div>
        </div>
      </label>
    </div>
  );
}

export default Range;
