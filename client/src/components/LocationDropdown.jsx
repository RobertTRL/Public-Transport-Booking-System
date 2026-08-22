import { useState, useRef, useEffect } from "react";

function LocationDropdown({ label, options, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(option) {
    onChange(option);
    setQuery("");
    setOpen(false);
  }

  function handleFocus() {
    setOpen(true);
    setQuery("");
  }

  // Closed: show the selected stop's name as real text.
  // Open: show whatever the user is typing to search.
  const displayValue = open ? query : value ? value.name : "";

  return (
    <div className="location-dropdown" ref={containerRef}>
      <label>{label}</label>

      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={handleFocus}
      />

      {open && (
        <ul className="location-dropdown-list">
          {filteredOptions.length === 0 && (
            <li className="location-dropdown-empty">No matches</li>
          )}

          {filteredOptions.map((option) => (
            <li
              key={option.id}
              className={value?.id === option.id ? "selected" : ""}
              onClick={() => handleSelect(option)}
            >
              <span>{option.name}</span>
              <span className="location-dropdown-route">{option.routeName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationDropdown;