interface Option {
  value: any;
  label: string
}
interface SelectProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: Option[];
}

function Select({ label, value, onChange, options } : SelectProps) {
  return (
    <select
      onChange={(e) =>onChange(e.target.value)}
      value={value}
      className="select select-bordered select-xs"
    >
      <option className="bg-neutral" disabled>{label}</option>
      {
          options.map(({value, label}) => <option key={value} value={value}>{label}</option> )
      }
    </select>
  );
}

export default Select;


