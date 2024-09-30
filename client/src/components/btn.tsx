import "./btn.css";

export default function Btn({ text }: { text: string }) {
  return <button className="btn-principal">{text}</button>;
}
