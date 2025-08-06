import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import LoadingSpinner from "../../../../LoadingSpinner";

function Dealer() {
  // Modal & UI states
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loader, setLoader] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // Data states
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});

  // Location / dropdown data
  const [state, setState] = useState([]); // all states options [{label, id, ...}]
  const [allCities, setAllCities] = useState([]); // all cities raw

  // Filtered data and selections
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  // Person responsible
  const [allUsers, setAllUsers] = useState([]);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [personSearchQuery, setPersonSearchQuery] = useState("");

  // Dropdown states for multi-selects
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const limit = 10;
  const [isDownloadingDealer, setIsDownloadingDealer] = useState(false);

  const downloadDealerExcel = async () => {
    setIsDownloadingDealer(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/dealers/export-dealers`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dealers_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Dealer Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingDealer(false);
    }
  };

  // Reusable MultiSelectDropdown with Select All/Deselect All
  const MultiSelectDropdown = ({
    options,
    selectedItems,
    onSelectionChange,
    placeholder,
    isOpen,
    setIsOpen,
    disabled = false,
    searchable = true,
  }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Filtering options as per search term
    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    // Are all currently shown filtered items selected
    const allFilteredSelected =
      filteredOptions.length &&
      filteredOptions.every((option) =>
        selectedItems.some((sel) => sel.id === option.id)
      );

    // Select or Deselect All
    const handleSelectAll = () => {
      if (allFilteredSelected) {
        // Deselect all filtered
        onSelectionChange(
          selectedItems.filter(
            (item) => !filteredOptions.some((opt) => opt.id === item.id)
          )
        );
      } else {
        // Select all filtered, add any not already in selection
        const newSelected = [
          ...selectedItems,
          ...filteredOptions.filter(
            (opt) => !selectedItems.some((item) => item.id === opt.id)
          ),
        ];
        onSelectionChange(newSelected);
      }
    };

    const handleToggleItem = (item) => {
      const isSelected = selectedItems.some(
        (selected) => selected.id === item.id
      );
      if (isSelected) {
        onSelectionChange(
          selectedItems.filter((selected) => selected.id !== item.id)
        );
      } else {
        onSelectionChange([...selectedItems, item]);
      }
    };

    const removeItem = (itemToRemove) => {
      onSelectionChange(
        selectedItems.filter((item) => item.id !== itemToRemove.id)
      );
    };

    return (
      <div className="relative dropdown-container">
        {/* Dropdown Input */}
        <div
          className={`w-full p-2.5 border border-gray-300 rounded cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedItems.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {item.label}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                  >
                    <svg
                      className="w-2 h-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                <>
                  <div
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer border-b font-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAll();
                    }}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={allFilteredSelected}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {allFilteredSelected ? "Deselect All" : "Select All"}
                    </span>
                  </div>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedItems.some(
                      (item) => item.id === option.id
                    );
                    return (
                      <div
                        key={option.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleToggleItem(option)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reusable Single select (for status)
  const SingleSelectDropdown = ({
    options,
    selectedValue,
    onSelectionChange,
    placeholder,
    isOpen,
    setIsOpen,
  }) => {
    return (
      <div className="relative dropdown-container">
        <div
          className="w-full p-2.5 border border-gray-300 rounded cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>
            {options.find((opt) => opt.value === selectedValue)?.label ||
              placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  onClick={() => {
                    onSelectionChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/alluser`
        );
        let users = res.data.users || res.data;
        if (!Array.isArray(users)) {
          if (users && typeof users === "object") {
            users = Object.values(users);
          } else {
            users = [];
          }
        }
        // Filter out users missing required fields
        users = users.filter(
          (user) =>
            user &&
            typeof user === "object" &&
            user.firstname &&
            user.lastname &&
            user.employeeid
        );
        setAllUsers(users);
      } catch (error) {
        setAllUsers([]);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by personSearchQuery for Person Responsible dropdown
  const filteredUsers = useMemo(() => {
    if (!personSearchQuery.trim()) return allUsers;
    const q = personSearchQuery.toLowerCase();
    return allUsers.filter((user) => {
      const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
      return fullName.includes(q) || user.employeeid.toLowerCase().includes(q);
    });
  }, [personSearchQuery, allUsers]);

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allstate`
        );
        if (Array.isArray(res.data)) {
          const statesMapped = res.data.map((s) => ({
            label: s.name,
            id: s._id,
            country: s.country,
            status: s.status,
            stateId: s.stateId,
          }));
          setState(statesMapped);
        } else {
          setState([]);
        }
      } catch (err) {
        setState([]);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcitybystate`
        );
        let cities = Array.isArray(res.data) ? res.data : [];
        setAllCities(cities);
      } catch (err) {
        setAllCities([]);
      }
    };
    fetchCities();
  }, []);

  // Filter cities based on selected states
  useEffect(() => {
    if (!Array.isArray(allCities)) {
      setFilteredCities([]);
      setSelectedCities([]);
      return;
    }
    if (!selectedStates.length) {
      setFilteredCities([]);
      setSelectedCities([]);
      handleFormData("city", []);
      return;
    }
    const selectedStateLabels = selectedStates.map((s) => s.label);
    const filteredCityList = allCities.filter((city) =>
      selectedStateLabels.includes(city.state)
    );
    setFilteredCities(filteredCityList);

    // Clear selected cities that are no longer valid
    setSelectedCities((prevSelectedCities) => {
      const validCities = prevSelectedCities.filter((city) =>
        filteredCityList.some((c) => c.name === city.label)
      );
      handleFormData(
        "city",
        validCities.map((city) => city.label)
      );
      return validCities;
    });
  }, [selectedStates, allCities]);

  // Fetch dealers with pagination
  const getData = () => {
    setLoader(true);
    setSearchQuery(""); // Reset on fetch
    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/dealer?page=${page}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.dealers || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {
        setLoader(false);
      });
  };

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery, page]);

  // Dealer search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      getData();
      return;
    }
    setLoader(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchdealer?q=${searchQuery}`
      );
      let searchData = [];
      if (Array.isArray(res.data)) {
        searchData = res.data;
      } else if (res.data.results && Array.isArray(res.data.results)) {
        searchData = res.data.results;
      } else if (res.data.message === "No results found") {
        searchData = [];
      } else if (res.data._id) {
        searchData = [res.data];
      }
      setData(searchData);
      setTotalPages(1);
      setPage(1);
    } catch (error) {
      setData([]);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);
  // Select all/deselect all rows toggle
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };

  // Select/Deselect single row
  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((i) => i !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setCurrentData({});
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedPersons([]);
    setEditModal(false);
    setShowModal(true);
  };

  // Open edit modal with populated form
  const openEditModal = (dealer) => {
    setCurrentData(dealer || {});
    // Pre-fill selected states array [{label,id}] for Autocomplete
    const selectedStateArr = dealer.state
      ? Array.isArray(dealer.state)
        ? dealer.state
        : [dealer.state]
      : [];
    const selectedStateObjects = state.filter((s) =>
      selectedStateArr.includes(s.label)
    );
    setSelectedStates(selectedStateObjects);

    // Pre-fill selected cities array [{label,id}]
    const selectedCityArr = dealer.city
      ? Array.isArray(dealer.city)
        ? dealer.city
        : [dealer.city]
      : [];
    // Map to city objects matching labels
    const selectedCityObjects = allCities
      .filter((city) => selectedCityArr.includes(city.name))
      .map((city) => ({ label: city.name, id: city._id }));
    setSelectedCities(selectedCityObjects);

    // Persons responsible (array or empty)
    setSelectedPersons(
      Array.isArray(dealer.personresponsible) ? dealer.personresponsible : []
    );
    setEditModal(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
    setSelectedStates([]);
    setSelectedCities([]);
    setSelectedPersons([]);
    setStateDropdownOpen(false);
    setCityDropdownOpen(false);
    setPersonDropdownOpen(false);
    setStatusDropdownOpen(false);
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({ ...prev, [name]: value }));
  };

  // Delete single dealer
  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this dealer? You won't be able to revert this!"
      )
    ) {
      axios
        .delete(`${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`)
        .then(() => {
          alert("Dealer has been deleted.");
          getData();
        })
        .catch(console.error);
    }
  };

  // Submit form (create or update)
  const handleSubmit = (id) => {
    if (editModal && id) {
      handleEditDealer(id);
    } else {
      handleCreateDealer();
    }
  };

  // Create dealer
  const handleCreateDealer = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/collections/dealer`, currentData)
      .then(() => {
        getData();
        handleCloseModal();
      })
      .catch(console.error);
  };

  // Edit dealer
  const handleEditDealer = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`,
        currentData
      )
      .then(() => {
        getData();
        handleCloseModal();
      })
      .catch(console.error);
  };

  // Pagination controls
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  // Bulk upload modals
  const openBulkModal = () => setIsOpen(true);
  const closeBulkModal = () => {
    setIsOpen(false);
    getData();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setStateDropdownOpen(false);
        setCityDropdownOpen(false);
        setPersonDropdownOpen(false);
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Select Person Responsible: use MultiSelectDropdown
  const personOptions = filteredUsers.map((user) => ({
    label: `${user.firstname} ${user.lastname} (${user.employeeid})`,
    id: user.employeeid,
  }));

  const personSelectedItems = selectedPersons.map((person) => ({
    label: `${person.name} (${person.employeeid})`,
    id: person.employeeid,
  }));

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
        </div>
      ) : (
        <>
          {/* Search & Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 justify-center flex-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                type="button"
                className="text-white px-5 bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center"
              >
                Search
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openBulkModal}
                type="button"
                className="text-white px-5 bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center"
              >
                Upload
              </button>
              <button
                onClick={openCreateModal}
                type="button"
                className="text-white px-5 bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center"
              >
                Create
              </button>
              <button
                type="button"
                className="text-white px-5 bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center"
              >
                Filter
              </button>
              <button
                className={`text-white px-5 text-nowrap bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center ${
                  isDownloadingDealer
                    ? "bg-gray-500 cursor-not-allowed"
                    : "text-white px-5 bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-md text-sm py-2 text-center"
                }`}
                onClick={downloadDealerExcel}
                disabled={isDownloadingDealer}
              >
                {isDownloadingDealer ? (
                  <>
                    <div className="flex items-center">
                      <LoadingSpinner />
                      Downloading...
                    </div>
                  </>
                ) : (
                  <>Download Excel</>
                )}
              </button>
            </div>
          </div>

          {/* Delete Selected Button */}
          {/* {selectedRows?.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-md text-sm px-5 py-2.5 text-center"
                // Add bulk delete logic here if needed
              >
                Delete Selected ({selectedRows.length})
              </button>
            </div>
          )} */}

          {/* Data Table */}
          <div className="relative w-full overflow-x-auto mt-4">
            <table className="w-full border min-w-max caption-bottom text-sm">
              <thead className="bg-blue-700">
                <tr className="border-b transition-colors text-white">
                  <th className="p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left font-medium">Dealer ID</th>
                  <th className="h-12 px-4 text-left font-medium">Name</th>
                  <th className="h-12 px-4 text-left font-medium">Email</th>
                  <th className="h-12 px-4 text-left font-medium">
                    Person Responsible
                  </th>
                  <th className="h-12 px-4 text-left font-medium">Status</th>
                  <th className="h-12 px-4 text-left font-medium">
                    Created Date
                  </th>
                  <th className="h-12 px-4 text-left font-medium">
                    Modified Date
                  </th>
                  <th className="h-12 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b transition-colors hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        <input
                          id={`checkbox-${index}`}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedRows.includes(item._id)}
                          onChange={() => handleRowSelect(item._id)}
                        />
                        <label
                          htmlFor={`checkbox-${index}`}
                          className="sr-only"
                        >
                          checkbox
                        </label>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-md capitalize align-middle whitespace-nowrap">
                      {item.dealercode}
                    </td>
                    <td className="p-4 font-medium text-md capitalize align-middle whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="p-4 font-medium text-md align-middle whitespace-nowrap">
                      {item.email}
                    </td>
                    <td className="p-4 font-medium text-md capitalize align-middle whitespace-nowrap">
                      {Array.isArray(item.personresponsible)
                        ? item.personresponsible.map((p) => p.name).join(", ")
                        : item.personresponsible}
                    </td>
                    <td className="p-4 font-medium text-md capitalize align-middle whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                          item.status === "Active"
                            ? "bg-green-100 text-green-800 border-green-400"
                            : item.status === "Inactive"
                            ? "bg-red-100 text-red-800 border-red-400"
                            : "bg-orange-100 text-orange-800 border-orange-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(item.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {moment(item.modifiedAt).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path
                              fillRule="evenodd"
                              d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <button
              className={`border rounded px-4 py-2 font-semibold ${
                page === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "cursor-pointer hover:bg-gray-200 bg-white text-gray-700"
              }`}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 3 && p <= page + 3)
                )
                .map((p, i, arr) => {
                  const prevPage = i > 0 ? arr[i - 1] : null;
                  return (
                    <React.Fragment key={p}>
                      {i > 0 && p !== prevPage + 1 && (
                        <span className="px-2 py-2">...</span>
                      )}
                      <button
                        className={`border px-3 py-2 rounded font-medium ${
                          p === page
                            ? "bg-blue-700 text-white border-blue-700"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setPage(p)}
                        disabled={p === page}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              className={`border rounded px-4 py-2 font-semibold ${
                page === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                  : "cursor-pointer hover:bg-blue-800 bg-blue-700 text-white"
              }`}
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>

          {/* Dealer modal (create/edit) */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {editModal ? "Update Dealer" : "Create Dealer"}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(currentData._id);
                  }}
                  className="overflow-y-auto max-h-[calc(90vh-120px)]"
                >
                  <div className="grid md:grid-cols-2 md:gap-6 p-6">
                    {/* Dealer Name */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Dealer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) => handleFormData("name", e.target.value)}
                        value={currentData.name || ""}
                        placeholder="Enter Dealer Name"
                        className="w-full p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* Dealer Code */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Dealer Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("dealercode", e.target.value)
                        }
                        value={currentData.dealercode || ""}
                        placeholder="Enter Dealer Code"
                        className="w-full p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        onChange={(e) =>
                          handleFormData("email", e.target.value)
                        }
                        value={currentData.email || ""}
                        placeholder="Enter Dealer Email"
                        className="w-full p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* State (multiple select) */}
                    <div className="dropdown-container">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        State <span className="text-red-500">*</span>
                      </label>
                      <MultiSelectDropdown
                        options={state}
                        selectedItems={selectedStates}
                        onSelectionChange={(newSelection) => {
                          setSelectedStates(newSelection);
                          handleFormData(
                            "state",
                            newSelection.map((v) => v.label)
                          );
                        }}
                        placeholder="Select State(s)"
                        isOpen={stateDropdownOpen}
                        setIsOpen={setStateDropdownOpen}
                      />
                    </div>
                    {/* City (multiple select filtered by state selections) */}
                    <div className="dropdown-container">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        City <span className="text-red-500">*</span>
                      </label>
                      <MultiSelectDropdown
                        options={filteredCities.map((city) => ({
                          label: city.name,
                          id: city._id,
                        }))}
                        selectedItems={selectedCities}
                        onSelectionChange={(newSelection) => {
                          setSelectedCities(newSelection);
                          handleFormData(
                            "city",
                            newSelection.map((v) => v.label)
                          );
                        }}
                        placeholder={
                          selectedStates.length === 0
                            ? "Select states first"
                            : "Select City(s)"
                        }
                        isOpen={cityDropdownOpen}
                        setIsOpen={setCityDropdownOpen}
                        disabled={selectedStates.length === 0}
                      />
                    </div>
                    {/* Pincode */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("pincode", e.target.value)
                        }
                        value={currentData.pincode || ""}
                        placeholder="Enter Dealer Pincode"
                        className="w-full p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {/* Status */}
                    <div className="dropdown-container">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Status
                      </label>
                      <SingleSelectDropdown
                        options={[
                          { value: "", label: "Select Status" },
                          { value: "Active", label: "Active" },
                          { value: "Inactive", label: "Inactive" },
                        ]}
                        selectedValue={currentData.status || ""}
                        onSelectionChange={(value) =>
                          handleFormData("status", value)
                        }
                        placeholder="Select Status"
                        isOpen={statusDropdownOpen}
                        setIsOpen={setStatusDropdownOpen}
                      />
                    </div>
                    {/* Person Responsible */}
                    <div className="md:col-span-2 dropdown-container">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Person Responsible{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <MultiSelectDropdown
                        options={personOptions}
                        selectedItems={personSelectedItems}
                        onSelectionChange={(items) => {
                          setSelectedPersons(
                            items.map((item) => ({
                              name: item.label.replace(/\s\(.+\)$/, ""),
                              employeeid: item.id,
                            }))
                          );
                          handleFormData(
                            "personresponsible",
                            items.map((i) => ({
                              name: i.label.replace(/\s\(.+\)$/, ""),
                              employeeid: i.id,
                            }))
                          );
                        }}
                        placeholder="Select Person Responsible(s)"
                        isOpen={personDropdownOpen}
                        setIsOpen={setPersonDropdownOpen}
                        searchable={true}
                      />
                      {/* Search input for user filtering */}
                      {/* <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={personSearchQuery}
                        onChange={(e) => setPersonSearchQuery(e.target.value)}
                        className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      /> */}
                    </div>
                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        onChange={(e) =>
                          handleFormData("address", e.target.value)
                        }
                        value={currentData.address || ""}
                        placeholder="Enter Dealer Address"
                        className="w-full p-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-2.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {editModal ? "Update Dealer" : "Create Dealer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bulk upload modal */}
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 w-[80vh] relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Bulk Upload</h3>
                  <button
                    onClick={closeBulkModal}
                    className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Upload your CSV file to bulk import dealers.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Drop files here or click to upload
                      </span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".csv"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">CSV files only</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={closeBulkModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Upload
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Dealer;
