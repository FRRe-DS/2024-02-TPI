import { useEffect, useState } from "react";
import "./search.css";

export default function Search({
  text,
  value: initialValue,
  onChange,
  debounce = 500,
}: {
  text: string;
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="input-search__container">
     
      <input
        className="input-search"
        type="text"
        placeholder={text}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
       <span className="material-symbols-outlined">search</span>
    </div>
  );
}
