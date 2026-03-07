import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({
  value = [],
  onChange,
  placeholder = "Add tags separated by commas or enter",
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 border border-[var(--border)] rounded-md p-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-[var(--button)]/10 text-[var(--button)] px-2 py-1 rounded-full text-xs"
          >
            {tag}
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
            if (e.key === "Backspace" && input === "") {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 && input === "" ? placeholder : ""}
          className="flex-1 outline-none bg-transparent text-sm"
        />
      </div>
    </div>
  );
}
