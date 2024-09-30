import "./search.css";

export default function Search({ text }: { text: string }) {
  return (
    <div className="input-search__container">
      <span className="material-symbols-outlined">search</span>
      <input className="input-search" type="text" placeholder={text} />
    </div>
  );
}
