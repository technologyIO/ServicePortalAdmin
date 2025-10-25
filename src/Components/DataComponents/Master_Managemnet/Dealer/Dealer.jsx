import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import moment from "moment";
import LoadingSpinner from "../../../../LoadingSpinner";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { FormControl, Input } from "@mui/joy";
import {
  Download,
  Filter,
  Plus,
  RefreshCw,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";
import DealerBulk from "./DealerBulk";

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
  const [totalDealers, setTotalDealers] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  const [isSpinning, setIsSpinning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    state: "",
    city: "",
    personResponsible: "",
  });
  const [isFilterMode, setIsFilterMode] = useState(false);

  // Filter options
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availablePersons, setAvailablePersons] = useState([]);

  // Data states
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [isbulkOpen, setIsbulkOpen] = useState(false);

  // Location / dropdown data
  const [state, setState] = useState([]);
  const [allCities, setAllCities] = useState([]);

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

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/excel/dealers/filter-options`
      );
      const options = response.data;
      setAvailableStates(options.states || []);
      setAvailableCities(options.cities || []);
      setAvailablePersons(options.persons || []);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const applyFilters = async (pageNum = 1) => {
    setLoader(true);
    setIsFilterMode(true);
    setIsSearchMode(false);
    setPage(pageNum);

    const filterParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filterParams.append(key, value);
      }
    });
    filterParams.append("page", pageNum);
    filterParams.append("limit", limit);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/excel/dealers/filter?${filterParams}`
      );
      setData(response.data.dealers || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalDealers(response.data.totalDealers || 0);
      setLoader(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      setLoader(false);
      toast.error("Error applying filters");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      state: "",
      city: "",
      personResponsible: "",
    });
    setIsFilterMode(false);
    getData(1);
    setShowFilters(false);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== "");
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Dealer ${
            newStatus === "Active" ? "activated" : "deactivated"
          } successfully!`
        );
        getData();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const downloadDealerExcel = async () => {
    setIsDownloadingDealer(true);
    try {
      let url = `${process.env.REACT_APP_BASE_URL}/excel/dealers/export-dealers`;
      const params = new URLSearchParams();

      // Add current search query if in search mode
      if (isSearchMode && searchQuery) {
        params.append("search", searchQuery);
      }

      // Add current filters if in filter mode
      if (isFilterMode) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `dealers_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success("Excel file downloaded successfully!");
      } else {
        console.error("Download failed");
        toast.error("Failed to download Dealer Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
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

    const filteredOptions = searchable
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const allFilteredSelected =
      filteredOptions.length &&
      filteredOptions.every((option) =>
        selectedItems.some((sel) => sel.id === option.id)
      );

    const handleSelectAll = () => {
      if (allFilteredSelected) {
        onSelectionChange(
          selectedItems.filter(
            (item) => !filteredOptions.some((opt) => opt.id === item.id)
          )
        );
      } else {
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

  const getData = (pageNum = page) => {
    setLoader(true);
    setIsSearchMode(false);
    setIsFilterMode(false);
    setPage(pageNum);
    setSearchQuery("");

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/dealer?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.dealers || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalDealers(res.data.totalDealers || 0);
      })
      .catch(() => {
        setLoader(false);
        setData([]);
        setTotalPages(1);
        setTotalDealers(0);
      });
  };

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchMode) {
      handleSearch(page);
    } else if (isFilterMode) {
      applyFilters(page);
    } else {
      getData(page);
    }
  }, [page]);

  // Dealer search
  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      getData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setIsFilterMode(false);
    setPage(pageNum);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/excel/dealers/searchdealer?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(res.data.dealers || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalDealers(res.data.totalDealers || 0);
      setLoader(false);
    } catch (error) {
      console.error("Search error:", error);
      setData([]);
      setTotalPages(1);
      setTotalDealers(0);
      setLoader(false);
    }
  };

  // Select all/deselect all rows toggle
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select dealers to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected Dealers?",
      text: `You are about to delete ${selectedRows.length} dealers permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/dealer/bulk`, {
            data: { ids: selectedRows },
          })
          .then((response) => {
            Swal.fire({
              title: "Deleted!",
              text: response.data.message,
              icon: "success",
            });
            setSelectedRows([]);
            setSelectAll(false);
            getData();
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text: error.response?.data?.message || "Failed to delete dealers",
              icon: "error",
            });
          });
      }
    });
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
    const selectedStateArr = dealer.state
      ? Array.isArray(dealer.state)
        ? dealer.state
        : [dealer.state]
      : [];
    const selectedStateObjects = state.filter((s) =>
      selectedStateArr.includes(s.label)
    );
    setSelectedStates(selectedStateObjects);

    const selectedCityArr = dealer.city
      ? Array.isArray(dealer.city)
        ? dealer.city
        : [dealer.city]
      : [];
    const selectedCityObjects = allCities
      .filter((city) => selectedCityArr.includes(city.name))
      .map((city) => ({ label: city.name, id: city._id }));
    setSelectedCities(selectedCityObjects);

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
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/dealer/${id}`)
          .then(() => {
            getData();
            Swal.fire("Deleted!", "Dealer has been deleted.", "success");
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              "Error!",
              "Failed to delete dealer. Please try again.",
              "error"
            );
          });
      }
    });
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
        toast.success("Dealer created successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create dealer. Please try again.");
      });
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
        toast.success("Dealer updated successfully!");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update dealer. Please try again.");
      });
  };

  // Pagination controls
  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
    }
  };

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  // Bulk upload modals
  const openBulkModal = () => setIsbulkOpen(true);
  const onClose = () => {
    setIsbulkOpen(false);
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
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
                <div className="relative flex-1">
                  <FormControl sx={{ flex: 1 }} size="sm">
                    <Input
                      size="sm"
                      placeholder="Search records, users, or data..."
                      startDecorator={
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
                      }
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value) {
                          getData();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearch(1);
                        }
                      }}
                      className="bg-gray-50 h-10 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                    />
                  </FormControl>
                </div>

                <button
                  onClick={() => handleSearch(1)}
                  type="button"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
                >
                  Search
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSpinning(true);
                    getData();
                    setTimeout(() => setIsSpinning(false), 1000);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={openCreateModal}
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>

                {selectedRows?.length > 0 &&
                  currentUserRole === "Super Admin" && (
                    <div className="animate-in slide-in-from-right-2 duration-300">
                      <button
                        onClick={handleBulkDelete}
                        type="button"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 whitespace-nowrap"
                      >
                        <span className="hidden sm:inline">
                          Delete Selected
                        </span>
                        <span className="sm:hidden">Delete</span>
                        <span className="ml-1 bg-red-700/30 px-2 py-0.5 rounded-full text-xs">
                          ({selectedRows.length})
                        </span>
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {/* Filter Toggle and Action Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    hasActiveFilters() || showFilters
                      ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20"
                      : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                  {hasActiveFilters() && (
                    <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs">
                      {Object.values(filters).filter((v) => v).length}
                    </span>
                  )}
                </button>

                {hasActiveFilters() && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={openBulkModal}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>

                <button
                  onClick={downloadDealerExcel}
                  disabled={isDownloadingDealer}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDownloadingDealer
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                  }`}
                >
                  {isDownloadingDealer ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span className="hidden sm:inline">Downloading...</span>
                      <span className="sm:hidden">...</span>
                    </div>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download Excel</span>
                      
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      value={filters.state}
                      onChange={(e) =>
                        handleFilterChange("state", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All States</option>
                      {availableStates.map((state, index) => (
                        <option key={index} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Cities</option>
                      {availableCities.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Person Responsible Filter */}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => applyFilters(1)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status Display */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isSearchMode ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalDealers}</span> dealers
                  found for "{searchQuery}"
                </span>
              ) : isFilterMode ? (
                <span>
                  Filtered Results:{" "}
                  <span className="font-semibold">{totalDealers}</span> dealers
                  found
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalDealers}</span> dealers
                </span>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="relative w-full overflow-x-auto">
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
                    className={`border-b transition-colors ${
                      selectedRows.includes(item._id)
                        ? "bg-gray-300"
                        : "hover:bg-gray-50"
                    }`}
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
                        {currentUserRole === "Super Admin" && (
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
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item?.status === "Active"}
                            onChange={() =>
                              handleToggleStatus(item?._id, item?.status)
                            }
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute pt-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
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
                        onClick={() => handlePageClick(p)}
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
        </>
      )}
      {isbulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 relative">
            <DealerBulk getData={getData} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  );
}

export default Dealer;
