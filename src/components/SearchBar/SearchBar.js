import React, { useState } from "react";
import "./SearchBar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const SearchBar = ({ onSearchSubmit }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(searchQuery); // Pass the search query to the parent component on submit
  };

  return (
    <div className="search-component">
      <form onSubmit={handleSearchSubmit}>
        <div className="search-input-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
