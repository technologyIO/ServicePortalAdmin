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

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    if (typeof getData === "function") {
      getData();
    }
  };
  const [selectedRows, setSelectedRows] = useState([]);

  // For cascading selects
  const [countryOptions, setCountryOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [isDownloadingCustomer, setIsDownloadingCustomer] = useState(false);

  const downloadCustomerExcel = async () => {
    setIsDownloadingCustomer(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/excel/customers/export-customers`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customers_data_${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed");
        alert("Failed to download Customer Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    } finally {
      setIsDownloadingCustomer(false);
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
          `${process.env.REACT_APP_BASE_URL}/collections/api/allregion`
        );
        const regionsData = res.data.regions.map((reg) => ({
          label: reg.regionName,
          id: reg._id,
          country: reg.country,
          status: reg.status,
        }));
        setRegionOptions(regionsData);
      } catch (err) {
        console.error(err);
      }
    }
    getRegions();
  }, []);

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
          selectedCountries.some((country) => region.country === country.label)
        )
      );
    }
    setSelectedRegions([]);
    setFilteredCities([]);
    setSelectedCities([]);
    setCurrentData((prev) => ({
      ...prev,
      country: selectedCountries.map((c) => c.label).join(", "),
      region: "",
      city: "",
    }));
    // eslint-disable-next-line
  }, [selectedCountries, regionOptions]);

  useEffect(() => {
    if (!selectedRegions.length) {
      setFilteredCities(cityOptions);
    } else {
      setFilteredCities(
        cityOptions.filter((city) =>
          selectedRegions.some((region) => city.region === region.label)
        )
      );
    }
    setSelectedCities([]);
    setCurrentData((prev) => ({
      ...prev,
      region: selectedRegions.map((r) => r.label).join(", "),
      city: "",
    }));
    // eslint-disable-next-line
  }, [selectedRegions, cityOptions]);

  useEffect(() => {
    setCurrentData((prev) => ({
      ...prev,
      city: selectedCities.map((c) => c.label).join(", "),
    }));
    // eslint-disable-next-line
  }, [selectedCities]);

  // Table and CRUD Logic (no removal)

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((country) => country._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (countryId) => {
    if (selectedRows.includes(countryId)) {
      setSelectedRows(selectedRows.filter((id) => id !== countryId));
    } else {
      setSelectedRows([...selectedRows, countryId]);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditModal(false);
    setCurrentData({});
    setSelectedCountries([]);
    setSelectedRegions([]);
    setSelectedCities([]);
  };

  const handleOpenModal = (country) => {
    setCurrentData(country);
    setEditModal(true);
    setShowModal(true);

    // autofill cascading fields for edit
    // Country
    const foundCountries = countryOptions.filter((c) =>
      (country?.country || "").split(", ").includes(c.label)
    );
    setSelectedCountries(foundCountries);
    // Region
    const rOptions = regionOptions.filter((r) =>
      foundCountries.map((c) => c.label).includes(r.country)
    );
    setFilteredRegions(rOptions);
    const foundRegions = rOptions.filter((r) =>
      (country?.region || "").split(", ").includes(r.label)
    );
    setSelectedRegions(foundRegions);
    // City
    const cOptions = cityOptions.filter((c) =>
      foundRegions.map((r) => r.label).includes(c.region)
    );
    setFilteredCities(cOptions);
    const foundCities = cOptions.filter((c) =>
      (country?.city || "").split(", ").includes(c.label)
    );
    setSelectedCities(foundCities);
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
            Swal.fire("Deleted!", "Countrys has been deleted.", "success");
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
    setPage(pageNum);

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
    } else if (!isSearchMode) {
      getData(page);
    }
  }, [page]); // Only trigger on page changes

  useEffect(() => {
    if (!searchQuery) {
      getData();
    }
  }, [searchQuery]);

  const handleSubmit = (id) => {
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
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1); // Let useEffect handle the data loading
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1); // Let useEffect handle the data loading
    }
  };

  // --- Select All logic for cascaded fields ---
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
          <span class="CustomLoader"></span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-3 justify-center">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search"
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (searchQuery.trim()) {
                        handleSearch(1);
                      } else {
                        // If Enter is pressed with empty search, reset to normal data
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

                    // If input is completely cleared, automatically refresh data
                    if (value === "" && isSearchMode) {
                      setIsSearchMode(false);
                      setPage(1);
                      getData(1);
                    }
                  }}
                />
              </FormControl>
              <button
                onClick={() => handleSearch(1)}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 mb-2"
              >
                Search
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={openModal}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Upload
              </button>
              <button
                onClick={handleShowCreateModal}
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Create
              </button>
              <button
                type="button"
                className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br  focus:outline-none  font-medium rounded-[3px] text-sm  py-1.5 text-center  mb-2"
              >
                Filter
              </button>
              <button
                className={`text-white w-full text-nowrap col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2 ${
                  isDownloadingCustomer
                    ? "bg-gray-500 cursor-not-allowed"
                    : "text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
                }`}
                onClick={downloadCustomerExcel}
                disabled={isDownloadingCustomer}
              >
                {isDownloadingCustomer ? (
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
          {/* {selectedRows?.length > 0 && (
            <div className="flex justify-center">
              <button
                type="button"
                class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 :focus:ring-red-800 font-medium rounded-[4px] text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Delete Selected
              </button>
            </div>
          )} */}
          {/* Add this div before the table */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {isSearchMode && searchQuery ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalCustomers}</span>{" "}
                  customers found for "{searchQuery}"
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
            <table className="w-full  border  min-w-max caption-bottom text-sm">
              <thead className="[&amp;_tr]:border-b bg-blue-700 ">
                <tr className="border-b transition-colors  text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
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
                  {/* <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    State
                  </th> */}
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
              <tbody className="[&amp;_tr:last-child]:border-0  ">
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr
                      key={item?._id}
                      className="border-b transition-colors  data-[state=selected]:bg-muted"
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
                      {/* <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.state}
                    </td> */}
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
                              ? "bg-red-100 text-red-800  border-red-400"
                              : "bg-orange-100 text-orange-800  border-orange-400"
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
                        <div className="flex gap-4 ">
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
                                fill-rule="evenodd"
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
                              className="bi bi-trash3-fill"
                              viewBox="0 0 16 16"
                            >
                              <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="20" className="text-center p-4">
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
                  // Show the first page, last page, and pages around the current page
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 3 && p <= page + 3)
                  );
                })
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {/* Add ellipsis for skipped ranges */}
                    {i > 0 && p !== array[i - 1] + 1 && <span>...</span>}
                    <button
                      className={`border px-3 rounded ${
                        p === page ? "bg-blue-700 text-white" : ""
                      }`}
                      onClick={() => setPage(p)} // Change this line
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

          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2  thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Customer" : "Create Customer"}
                </h3>
                <div
                  onClick={() => handleCloseModal()}
                  className=" border p-2 rounded-[4px] hover:bg-gray-200 cursor-pointer "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg font-semibold "
                    viewBox="0 0 16 16"
                  >
                    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                  </svg>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCloseModal();
                }}
                className="thin-scroll"
              >
                <div className=" w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div class="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Customer Code (ID)
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("customercodeid", e.target.value)
                        }
                        id="customercodeid"
                        value={currentData?.customercodeid}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Customer Name{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("customername", e.target.value)
                        }
                        id="customername"
                        value={currentData?.customername}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Hospital Name{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("hospitalname", e.target.value)
                        }
                        id="hospitalname"
                        value={currentData?.hospitalname}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Country
                        </label>
                        <button
                          type="button"
                          className="ml-2 px-3 py-1 border rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
                          onClick={handleCountrySelectAll}
                        >
                          {selectedCountries.length === countryOptions.length
                            ? "Clear All"
                            : "Select All"}
                        </button>
                      </div>
                      <Autocomplete
                        multiple
                        className=" w-full"
                        options={countryOptions}
                        value={selectedCountries}
                        getOptionLabel={(option) =>
                          option ? option.label : ""
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="country"
                            label="Select country"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) => setSelectedCountries(value)}
                        disableCloseOnSelect
                      />
                    </div>
                    {/* REGION FIELD + BUTTON */}
                    <div className="relative w-full mb-5 group">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          Region
                        </label>
                        <button
                          type="button"
                          className="ml-2 px-3 py-1 border rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
                          onClick={handleRegionSelectAll}
                          disabled={!filteredRegions.length}
                        >
                          {selectedRegions.length === filteredRegions.length
                            ? "Clear All"
                            : "Select All"}
                        </button>
                      </div>
                      <Autocomplete
                        multiple
                        className=" w-full"
                        options={filteredRegions}
                        value={selectedRegions}
                        getOptionLabel={(option) =>
                          option ? option.label : ""
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="region"
                            label="Select region"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) => setSelectedRegions(value)}
                        disableCloseOnSelect
                        disabled={!selectedCountries.length}
                      />
                    </div>
                    {/* CITY FIELD + BUTTON */}
                    <div className="relative w-full mb-5 group">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block mb-2 text-sm font-medium text-gray-900 ">
                          City
                        </label>
                        <button
                          type="button"
                          className="ml-2 px-3 py-1 border rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs"
                          onClick={handleCitySelectAll}
                          disabled={!filteredCities.length}
                        >
                          {selectedCities.length === filteredCities.length
                            ? "Clear All"
                            : "Select All"}
                        </button>
                      </div>
                      <Autocomplete
                        multiple
                        className=" w-full"
                        options={filteredCities}
                        value={selectedCities}
                        getOptionLabel={(option) =>
                          option ? option.label : ""
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="city"
                            label="Select city"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) => setSelectedCities(value)}
                        disableCloseOnSelect
                        disabled={!selectedRegions.length}
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Street{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("street", e.target.value)
                        }
                        id="street"
                        value={currentData?.street}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Postal Code{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("postalcode", e.target.value)
                        }
                        id="postalcode"
                        value={currentData?.postalcode}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        District{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("district", e.target.value)
                        }
                        id="district"
                        value={currentData?.district}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    {/* <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        State{" "}
                      </label>
                      <Autocomplete
                        className="h-10 w-full"
                        options={state} // Data from API
                        getOptionLabel={(option) => option.label} // Display the country name
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            name="state"
                            label="state State"
                          />
                        )}
                        sx={{ width: 300 }}
                        onChange={(event, value) =>
                          handleFormData("state", value ? value.label : "")
                        }
                      />
                    </div> */}

                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Telephone{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("telephone", e.target.value)
                        }
                        id="telephone"
                        value={currentData?.telephone}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Tax Number1{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("taxnumber1", e.target.value)
                        }
                        id="taxnumber1"
                        value={currentData?.taxnumber1}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Tax Number2{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("taxnumber2", e.target.value)
                        }
                        id="taxnumber2"
                        value={currentData?.taxnumber2}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div className="relative  w-full mb-5 group">
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Email{" "}
                      </label>
                      <input
                        type="text"
                        onChange={(e) =>
                          handleFormData("email", e.target.value)
                        }
                        id="email"
                        value={currentData?.email}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5      "
                      />
                    </div>
                    <div>
                      <label class="block mb-2 text-sm font-medium text-gray-900 ">
                        Status
                      </label>

                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        defaultValue={currentData?.status || ""}
                        onChange={(e, value) => handleFormData("status", value)}
                      >
                        <Option value="">Select Status</Option>
                        <Option value="Active">Active</Option>
                        <Option value="Pending">Pending</Option>
                        <Option value="Inactive">Inactive</Option>
                      </Select>
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Customer Type
                      </label>
                      <select
                        id="customertype"
                        value={currentData?.customertype}
                        onChange={(e) =>
                          handleFormData("customertype", e.target.value)
                        }
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      >
                        <option value="">Select Customer Type </option>
                        <option value="Government">Government</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    class=" focus:outline-none border h-8  shadow text-black flex items-center hover:bg-gray-200  font-medium rounded-[4px] text-sm px-5 py-2.5    me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4  flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm  py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Customer" : "Create Customer"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              {/* Modal Content */}
              <div className=" ">
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
