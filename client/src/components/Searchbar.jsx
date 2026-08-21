import { useState } from "react";
import "../styles/user.css";

const SearchBar = ({ placeholder = "Search routes by name or stop..." }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedSearchTerm = searchTerm.trim();

    if (!trimmedSearchTerm) {
      return;
    }

    console.log("Searching for:", trimmedSearchTerm);
  };

  return (
    <form
  className="search-bar"
  onSubmit={handleSearch}
  aria-label="Route search"
>
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>

        <input
         type="text"
         id="route-search"
         name="route-search"
         placeholder={placeholder}
         value={searchTerm}
         onChange={(e) => setSearchTerm(e.target.value)}
         aria-label="Search routes"
         autoComplete="off"
         />
      {searchTerm && (
        <button
          type="button"
          className="clear-search"
          onClick={() => setSearchTerm("")}
          aria-label="Clear search"
        >
          ×
        </button>
      </form>

      <button
        type="submit"
        className="search-button"
        aria-label="Search routes"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;