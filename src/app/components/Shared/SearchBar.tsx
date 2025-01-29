"use client";

import { ChangeEvent } from "react";

interface SearchBarProps<T> {
  searchTerm: string;
  placeholder: string;
  buttonText: string;
  onResetSearch: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar = <T,>({
  searchTerm,
  placeholder = "Start typing to search...",
  buttonText = "Reset Search",
  onResetSearch,
  onChange,
}: SearchBarProps<T>) => {
  return (
    <div className="search-bar-container">
      <input
        className="search-bar-input"
        type="text"
        value={searchTerm}
        placeholder={placeholder}
        onChange={onChange}
        autoFocus
      />
      <button className="search-bar-reset" onClick={onResetSearch}>
        {buttonText}
      </button>
    </div>
  );
};
