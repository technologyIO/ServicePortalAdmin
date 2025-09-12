import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Modal, ModalDialog, Option, Select, TextField } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import { Autocomplete } from "@mui/joy";
import CustomerBulk from "./CustomerBulk";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../../LoadingSpinner";
import {
  Download,
  Filter,
  Plus,
  RefreshCw,
  Upload,
  X,
  ChevronDown,
} from "lucide-react";

function Customer() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState({ customers: [] });
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const limit = 10;
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSpinning, setisSpinning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadingCustomer, setIsDownloadingCustomer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    customercodeid: "",
    customername: "",
    hospitalname: "",
    street: "",
    city: "",
    postalcode: "",
    district: "",
    region: "",
    country: "",
    telephone: "",
    taxnumber1: "",
    taxnumber2: "",
    email: "",
    status: "",
    customertype: "",
    createdStartDate: "",
    createdEndDate: "",
    modifiedStartDate: "",
    modifiedEndDate: "",
  });
  const [isFilterMode, setIsFilterMode] = useState(false);

  // Filter options
  const [availableCustomerCodes, setAvailableCustomerCodes] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  // For cascading selects
  const [countryOptions, setCountryOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    if (typeof getData === "function") {
      getData();
    }
  };

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/filter-options`
      );
      const options = response.data;
      setAvailableCustomerCodes(options.customerCodes || []);
      setAvailableCities(options.cities || []);
      setAvailableRegions(options.regions || []);
      setAvailableCountries(options.countries || []);
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
        `${process.env.REACT_APP_BASE_URL}/collections/customer/filter?${filterParams}`
      );
      setData(response.data.customers || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCustomers(response.data.totalCustomers || 0);
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
      customercodeid: "",
      customername: "",
      hospitalname: "",
      street: "",
      city: "",
      postalcode: "",
      district: "",
      region: "",
      country: "",
      telephone: "",
      taxnumber1: "",
      taxnumber2: "",
      email: "",
      status: "",
      customertype: "",
      createdStartDate: "",
      createdEndDate: "",
      modifiedStartDate: "",
      modifiedEndDate: "",
    });
    setIsFilterMode(false);
    getData(1);
    setShowFilters(false);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== "");
  };

  const downloadCustomerExcel = async () => {
    setIsDownloadingCustomer(true);
    try {
      let url = `${process.env.REACT_APP_BASE_URL}/excel/customers/export-customers`;
      const params = new URLSearchParams();

      // Add current search query if in search mode
      if (isSearchMode && searchQuery.trim()) {
        params.append("search", searchQuery.trim());
        console.log("Adding search parameter:", searchQuery.trim());
      }

      // Add current filters if in filter mode
      if (isFilterMode) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });
        console.log("Adding filter parameters:", filters);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("Download URL:", url);

      const response = await fetch(url, {
        method: "GET",
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `customers_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success("Excel file downloaded successfully!");
      } else {
        const errorText = await response.text();
        console.error("Download failed:", errorText);
        toast.error("Failed to download Customer Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    } finally {
      setIsDownloadingCustomer(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Customer ${
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

  // --- Data Fetch ---
  useEffect(() => {
    async function getCountry() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allCountries`
        );
        const Country = res.data.map((country) => ({
          label: country.name,
          id: country._id,
          status: country.status,
        }));
        setCountryOptions(Country);
      } catch (err) {
        console.error(err);
      }
    }
    getCountry();
  }, []);

  useEffect(() => {
    async function getRegions() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/api/region`
        );

        const regionsData = res.data.data.regionDropdown
          .filter((reg) => reg.stateId !== null)
          .map((reg) => ({
            label: reg.stateId || reg.regionName,
            value: reg.regionName,
            id: reg._id,
            country: reg.country,
            regionName: reg.regionName,
            stateId: reg.stateId,
          }))
          .filter((reg) => reg.label && reg.value);

        setRegionOptions(regionsData);
        console.log("Regions loaded:", regionsData);
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    }
    getRegions();
  }, []);

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select customers to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected Customers?",
      text: `You are about to delete ${selectedRows.length} customers permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${process.env.REACT_APP_BASE_URL}/collections/customer/bulk`,
            {
              data: { ids: selectedRows },
            }
          )
          .then((response) => {
            Swal.fire({
              title: "Deleted!",
              text: response.data.message,
              icon: "success",
            });
            setSelectedRows([]);
            setSelectAll(false);
            if (isSearchMode && searchQuery.trim()) {
              handleSearch(page);
            } else {
              getData();
            }
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message || "Failed to delete customers",
              icon: "error",
            });
          });
      }
    });
  };

  useEffect(() => {
    async function getCities() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/collections/allcitybystate`
        );
        const cities = Array.isArray(res.data)
          ? res.data.map((city) => ({
              label: city.name,
              id: city._id,
              region: city.region,
              state: city.state,
              status: city.status,
            }))
          : [];
        setCityOptions(cities);
      } catch (err) {
        console.error(err);
        setCityOptions([]);
      }
    }
    getCities();
  }, []);

  // --- Cascading Selects ---
  useEffect(() => {
    if (!selectedCountries.length) {
      setFilteredRegions(regionOptions);
    } else {
      setFilteredRegions(
        regionOptions.filter((region) =>
          selectedCountries.some(
            (country) =>
              region.country &&
              region.country.toLowerCase() === country.label.toLowerCase()
          )
        )
      );
    }

    if (!editModal) {
      setSelectedRegions([]);
      setFilteredCities([]);
      setSelectedCities([]);
    }

    setCurrentData((prev) => ({
      ...prev,
      country: selectedCountries.map((c) => c.label).join(", "),
    }));
  }, [selectedCountries, regionOptions, editModal]);

  useEffect(() => {
    if (!selectedRegions.length) {
      setFilteredCities(cityOptions);
    } else {
      setFilteredCities(
        cityOptions.filter((city) =>
          selectedRegions.some((region) => city.region === region.value)
        )
      );
    }

    if (!editModal) {
      setSelectedCities([]);
    }

    setCurrentData((prev) => ({
      ...prev,
      region: selectedRegions.map((r) => r.label).join(", "),
    }));
  }, [selectedRegions, cityOptions, editModal]);

  useEffect(() => {
    setCurrentData((prev) => ({
      ...prev,
      city: selectedCities.map((c) => c.label).join(", "),
    }));
  }, [selectedCities]);

  // Helper function to find matching options from API data
  const findMatchingRegions = (regionString, allRegions) => {
    if (!regionString || !allRegions.length) return [];

    const regionCodes = regionString
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r !== "");

    return allRegions.filter((region) =>
      regionCodes.some(
        (code) =>
          region.stateId === code ||
          region.label === code ||
          region.regionName === code
      )
    );
  };

  const findMatchingCities = (cityString, allCities) => {
    if (!cityString || !allCities.length) return [];

    const cityNames = cityString
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");

    return allCities.filter((city) =>
      cityNames.some((name) => city.label === name || city.name === name)
    );
  };

  // Table and CRUD Logic
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((customer) => customer._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (customerId) => {
    if (selectedRows.includes(customerId)) {
      setSelectedRows(selectedRows.filter((id) => id !== customerId));
    } else {
      setSelectedRows([...selectedRows, customerId]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
    setSelectedCountries([]);
    setSelectedRegions([]);
    setSelectedCities([]);
    setFilteredRegions(regionOptions);
    setFilteredCities(cityOptions);
  };

  const handleOpenModal = async (customer) => {
    setCurrentData(customer);
    setEditModal(true);
    setShowModal(true);

    if (!regionOptions.length || !cityOptions.length) {
      setTimeout(() => handleOpenModal(customer), 100);
      return;
    }

    const countryValue = customer?.country || "";
    const customerCountries = countryValue
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c !== "");

    const foundCountries = countryOptions.filter((c) =>
      customerCountries.some(
        (customerCountry) =>
          customerCountry.toLowerCase() === c.label.toLowerCase()
      )
    );
    setSelectedCountries(foundCountries);

    const matchingRegions = findMatchingRegions(
      customer?.region || "",
      regionOptions
    );
    setSelectedRegions(matchingRegions);

    const filteredRegionsForCountries = regionOptions.filter((region) =>
      foundCountries.some(
        (country) =>
          region.country &&
          region.country.toLowerCase() === country.label.toLowerCase()
      )
    );
    setFilteredRegions(
      filteredRegionsForCountries.length
        ? filteredRegionsForCountries
        : regionOptions
    );

    const matchingCities = findMatchingCities(
      customer?.city || "",
      cityOptions
    );
    setSelectedCities(matchingCities);

    const filteredCitiesForRegions = cityOptions.filter((city) =>
      matchingRegions.some((region) => city.region === region.value)
    );
    setFilteredCities(
      filteredCitiesForRegions.length ? filteredCitiesForRegions : cityOptions
    );
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Permanently?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${process.env.REACT_APP_BASE_URL}/collections/customer/${id}`
          )
          .then((res) => {
            Swal.fire("Deleted!", "Customer has been deleted.", "success");
          })
          .then((res) => {
            getData();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  };

  const handleSearch = async (pageNum = 1) => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setIsFilterMode(false);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchcustomer?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.customers || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalCustomers(response.data.totalCustomers || 0);
      setLoader(false);
    } catch (error) {
      console.error("Error searching customers:", error);
      setData([]);
      setTotalPages(1);
      setTotalCustomers(0);
      setLoader(false);
    }
  };

  const getData = (pageNum = page) => {
    console.log("getData called with page:", pageNum);
    setLoader(true);
    setIsSearchMode(false);
    setIsFilterMode(false);
    setPage(pageNum);
    setSearchQuery("");

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/customer?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        console.log("Full API Response:", res.data);

        if (
          res.data &&
          res.data.customers &&
          Array.isArray(res.data.customers)
        ) {
          setData(res.data.customers);
          setTotalPages(res.data.totalPages || 1);
          setTotalCustomers(res.data.totalCustomers || 0);
          console.log("Data set successfully:", res.data.customers);
        } else {
          console.warn("Unexpected response structure:", res.data);
          setData([]);
          setTotalPages(1);
          setTotalCustomers(0);
        }

        setLoader(false);
      })
      .catch((error) => {
        setLoader(false);
        console.error("API Error:", error);
        setData([]);
        setTotalPages(1);
        setTotalCustomers(0);
      });
  };

  useEffect(() => {
    if (isSearchMode && searchQuery) {
      handleSearch(page);
    } else if (isFilterMode) {
      applyFilters(page);
    } else if (!isSearchMode) {
      getData(page);
    }
  }, [page]);

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  const handleSubmit = (id) => {
    if (selectedCountries.length === 0) {
      toast.error("Please select at least one country");
      return;
    }

    if (selectedRegions.length === 0) {
      toast.error("Please select at least one region");
      return;
    }

    if (selectedCities.length === 0) {
      toast.error("Please select at least one city");
      return;
    }

    if (editModal && id) {
      handleEditCountry(id);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/collections/customer`,
        currentData
      )
      .then((res) => {
        toast.success("Customer created successfully!");
        handleCloseModal();
        getData();
      })
      .catch((error) => {
        console.error(error);
        const message =
          error.response?.data?.message || "Failed to create customer.";
        toast.error(message);
      });
  };

  const handleEditCountry = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/customer/${id}`,
        currentData
      )
      .then((res) => {
        toast.success("Customer updated successfully!");
        handleCloseModal();
        getData();
      })
      .catch((error) => {
        console.error(error);
        const message =
          error.response?.data?.message || "Failed to update customer.";
        toast.error(message);
      });
  };

  const handleShowCreateModal = () => {
    setEditModal(false);
    setCurrentData({});
    setShowModal(true);
    setSelectedCountries([]);
    setSelectedRegions([]);
    setSelectedCities([]);
    setFilteredRegions(regionOptions);
    setFilteredCities(cityOptions);
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handleCountrySelectAll = () => {
    if (selectedCountries.length === countryOptions.length) {
      setSelectedCountries([]);
    } else {
      setSelectedCountries([...countryOptions]);
    }
  };

  const handleRegionSelectAll = () => {
    if (selectedRegions.length === filteredRegions.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions([...filteredRegions]);
    }
  };

  const handleCitySelectAll = () => {
    if (selectedCities.length === filteredCities.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities([...filteredCities]);
    }
  };

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span className="CustomLoader"></span>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
                <div className="relative flex-1">
                  <FormControl sx={{ flex: 1 }} size="sm">
                    <Input
                      size="sm"
                      placeholder="Search records, users, or data..."
                      startDecorator={<SearchIcon />}
                      value={searchQuery}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (searchQuery.trim()) {
                            handleSearch(1);
                          } else {
                            setIsSearchMode(false);
                            setSearchQuery("");
                            setPage(1);
                            getData(1);
                          }
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        if (value === "" && isSearchMode) {
                          setIsSearchMode(false);
                          setPage(1);
                          getData(1);
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
                    setisSpinning(true);
                    getData();
                    setTimeout(() => setisSpinning(false), 1000);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleShowCreateModal}
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
                  onClick={openModal}
                  type="button"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>

                <button
                  onClick={downloadCustomerExcel}
                  disabled={isDownloadingCustomer}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDownloadingCustomer
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                  }`}
                >
                  {isDownloadingCustomer ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner />
                      <span className="hidden sm:inline">Downloading...</span>
                      <span className="sm:hidden">...</span>
                    </div>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download Excel</span>
                      <span className="sm:inline hidden">Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Customer Name Filter */}
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
                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <select
                      value={filters.region}
                      onChange={(e) =>
                        handleFilterChange("region", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Regions</option>
                      {availableRegions.map((region, index) => (
                        <option key={index} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Country Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) =>
                        handleFilterChange("country", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Countries</option>
                      {availableCountries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  {/* Customer Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Type
                    </label>
                    <select
                      value={filters.customertype}
                      onChange={(e) =>
                        handleFilterChange("customertype", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  {/* Created Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.createdStartDate}
                      onChange={(e) =>
                        handleFilterChange("createdStartDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created End Date
                    </label>
                    <input
                      type="date"
                      value={filters.createdEndDate}
                      onChange={(e) =>
                        handleFilterChange("createdEndDate", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
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
              {isSearchMode && searchQuery ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalCustomers}</span>{" "}
                  customers found for "{searchQuery}"
                </span>
              ) : isFilterMode ? (
                <span>
                  Filtered Results:{" "}
                  <span className="font-semibold">{totalCustomers}</span>{" "}
                  customers found
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalCustomers}</span>{" "}
                  customers
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <table className="w-full border min-w-max caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-blue-700">
                <tr className="border-b transition-colors text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <label htmlFor="checkbox-all-search" className="sr-only">
                        checkbox
                      </label>
                    </div>
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer Code (ID)
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Hospital Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Street
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    City
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PostalCode
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    District
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Region
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Country
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Telephone
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Tax Number1
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Tax Number2
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Customer Type
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Modified Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item?._id}
                      className={`border-b transition-colors ${
                        selectedRows?.includes(item?._id)
                          ? "bg-gray-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <th scope="col" className="p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${index}`}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            checked={selectedRows?.includes(item?._id)}
                            onChange={() => handleRowSelect(item?._id)}
                          />
                          <label
                            htmlFor={`checkbox-${index}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </th>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.customercodeid}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.customername}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.hospitalname}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.street}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.city}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.postalcode}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.district}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.region}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.country}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.telephone}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.taxnumber1}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.taxnumber2}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.email}
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded border ${
                            item?.status === "Active"
                              ? "bg-green-100 text-green-800 border-green-400"
                              : item?.status === "Inactive"
                              ? "bg-red-100 text-red-800 border-red-400"
                              : "bg-orange-100 text-orange-800 border-orange-400"
                          }`}
                        >
                          {item?.status}
                        </span>
                      </td>
                      <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                        {item?.customertype}
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        {moment(item?.createdAt).format("MMM D, YYYY")}
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        {moment(item?.modifiedAt).format("MMM D, YYYY")}
                      </td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              handleOpenModal(item);
                            }}
                            className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-pencil-square"
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
                                className="bi bi-trash3-fill"
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="19" className="text-center p-4">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            className="Pagination-laptopUp"
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px",
            }}
          >
            <button
              className={`border rounded p-1 ${
                page === 1 ? "cursor-not-allowed" : "cursor-pointer"
              } w-[100px] hover:bg-gray-300 px-2 bg-gray-100 font-semibold`}
              onClick={handlePreviousPage}
              disabled={page === 1}
            >
              Previous
            </button>
            <div style={{ display: "flex", gap: "8px" }}>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 3 && p <= page + 3)
                  );
                })
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {i > 0 && p !== array[i - 1] + 1 && <span>...</span>}
                    <button
                      className={`border px-3 rounded ${
                        p === page ? "bg-blue-700 text-white" : ""
                      }`}
                      onClick={() => setPage(p)}
                      disabled={p === page}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              className="border rounded p-1 cursor-pointer hover:bg-blue-500 px-2 bg-blue-700 w-[100px] text-white font-semibold"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>

          {/* Modal and Bulk Upload remain the same as your existing code... */}
          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            {/* Your existing modal content */}
          </Modal>

          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="">
                <CustomerBulk isOpen={isOpen} onClose={closeModal} />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Customer;
