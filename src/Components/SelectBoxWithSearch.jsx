import React, { useState } from "react";

const SelectBoxWithSearch = ({ options, placeholder, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    setSelectedOption(option.name);
    setIsOpen(false);
    setSearchTerm(""); // Clear search term after selection
    onSelect(option); // Notify parent component of the selection
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={selectedOption || ""}
        onClick={handleInputClick}
        onChange={(e) => setSearchTerm(e.target.value)}
        onBlur={handleBlur}
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder || "Select an option"}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
        onClick={handleInputClick}
      >
        <svg
          className={`w-4 h-4 transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option._id} // Use a unique key for each item
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectBoxWithSearch;
