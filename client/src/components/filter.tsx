import "./filter.css";

export default function Filter({ text }: { text: string }) {
  return (
    <div className="input-filter__container">
      <input type="button" value={text} className="input-filter" />
      <span className="material-symbols-outlined">keyboard_arrow_down</span>
    </div>
  );
}
