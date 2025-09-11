import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Download, Filter, Plus, RefreshCw, Upload, X, ChevronDown } from "lucide-react";
import { Modal, ModalDialog, Option, Select } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import BulkModal from "../../BulkUpload.jsx/BulkModal";
import ProductBulk from "./ProductBulk";
import LoadingSpinner from "../../../../LoadingSpinner";
import toast from "react-hot-toast";

function Product() {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [loader, setLoader] = useState(true);
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [cityList, setCityList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloadingProduct, setIsDownloadingProduct] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
  const [isSpinning, setIsSpinning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    productGroup: '',
    subGroup: '',
    installationChecklistStatus: '',
    pmChecklistStatus: '',
    launchDateStart: '',
    launchDateEnd: '',
    endOfSaleDateStart: '',
    endOfSaleDateEnd: ''
  });
  const [isFilterMode, setIsFilterMode] = useState(false);

  // Filter options
  const [availableProductGroups, setAvailableProductGroups] = useState([]);
  const [availableSubGroups, setAvailableSubGroups] = useState([]);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/product/filter-options`
      );
      const options = response.data;
      setAvailableProductGroups(options.productGroups || []);
      setAvailableSubGroups(options.subGroups || []);
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
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
    filterParams.append('page', pageNum);
    filterParams.append('limit', limit);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/product/filter?${filterParams}`
      );
      setData(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.totalProducts || 0);
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
      status: '',
      startDate: '',
      endDate: '',
      productGroup: '',
      subGroup: '',
      installationChecklistStatus: '',
      pmChecklistStatus: '',
      launchDateStart: '',
      launchDateEnd: '',
      endOfSaleDateStart: '',
      endOfSaleDateEnd: ''
    });
    setIsFilterMode(false);
    getData(1);
    setShowFilters(false);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== '');
  };

  const downloadProductExcel = async () => {
    setIsDownloadingProduct(true);
    try {
      let url = `${process.env.REACT_APP_BASE_URL}/excel/products/export-products`;
      const params = new URLSearchParams();
      
      // Add current search query if in search mode
      if (isSearchMode && searchQuery) {
        params.append('search', searchQuery);
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
        a.download = `products_data_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        toast.success("Excel file downloaded successfully!");
      } else {
        console.error("Download failed");
        toast.error("Failed to download Product Excel file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Error downloading file");
    } finally {
      setIsDownloadingProduct(false);
    }
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    if (typeof getData === "function") {
      getData();
    }
  };

  const getCities = () => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/collections/city`)
      .then((res) => {
        setCityList(res.data.city);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getCities();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/collections/product/${id}`,
        { status: newStatus }
      );

      if (response.status === 200) {
        toast.success(
          `Product ${
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

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedRows(data?.map((product) => product._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (productId) => {
    if (selectedRows.includes(productId)) {
      setSelectedRows(selectedRows.filter((id) => id !== productId));
    } else {
      setSelectedRows([...selectedRows, productId]);
    }
  };

  const handleCloseModal = () => {
    setShowModal((prev) => !prev);
    setEditModal(false);
    setCurrentData({});
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select products to delete");
      return;
    }

    Swal.fire({
      title: "Delete Selected Products?",
      text: `You are about to delete ${selectedRows.length} products permanently!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `${process.env.REACT_APP_BASE_URL}/collections/product/bulk`,
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
            getData();
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            Swal.fire({
              title: "Error!",
              text:
                error.response?.data?.message || "Failed to delete products",
              icon: "error",
            });
          });
      }
    });
  };

  const handleOpenModal = (product) => {
    setCurrentData(product);
    setEditModal(true);
    setShowModal(true);
  };

  const handleFormData = (name, value) => {
    setCurrentData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
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
          .delete(`${process.env.REACT_APP_BASE_URL}/collections/product/${id}`)
          .then((res) => {
            Swal.fire("Deleted!", "Product has been deleted.", "success");
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
    if (!searchQuery) {
      getData();
      return;
    }

    setLoader(true);
    setIsSearchMode(true);
    setIsFilterMode(false);
    setPage(pageNum);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/collections/searchProduct?q=${searchQuery}&page=${pageNum}&limit=${limit}`
      );

      setData(response.data.product || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalProducts(response.data.totalProducts || 0);
      setLoader(false);
    } catch (error) {
      console.error("Error searching products:", error);
      setData([]);
      setTotalPages(1);
      setTotalProducts(0);
      setLoader(false);
    }
  };

  const getData = (pageNum = page) => {
    setLoader(true);
    setIsSearchMode(false);
    setIsFilterMode(false);
    setSearchQuery("");
    setPage(pageNum);

    axios
      .get(
        `${process.env.REACT_APP_BASE_URL}/collections/productbypage?page=${pageNum}&limit=${limit}`
      )
      .then((res) => {
        setLoader(false);
        setData(res.data.product);
        setTotalPages(res.data.totalPages);
        setTotalProducts(res.data.totalProduct || 0);
      })
      .catch((error) => {
        setLoader(false);
        console.log(error);
        setData([]);
        setTotalPages(1);
        setTotalProducts(0);
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
        `${process.env.REACT_APP_BASE_URL}/collections/product`,
        currentData
      )
      .then((res) => {
        getData();
        toast.success("Product created successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to create product. Please try again.");
      });
  };

  const handleEditCountry = (id) => {
    axios
      .put(
        `${process.env.REACT_APP_BASE_URL}/collections/product/${id}`,
        currentData
      )
      .then((res) => {
        getData();
        toast.success("Product updated successfully!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Failed to update product. Please try again.");
      });
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

  return (
    <>
      {loader ? (
        <div className="flex items-center justify-center h-[60vh]">
          <span className="CustomLoader"></span>
        </div>
      ) : (
        <>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-2 shadow-sm">
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
                          handleSearch(1);
                        }
                      }}
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                  onClick={handleCloseModal}
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
                      {Object.values(filters).filter(v => v).length}
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
                  onClick={downloadProductExcel}
                  disabled={isDownloadingProduct}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isDownloadingProduct
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
                  }`}
                >
                  {isDownloadingProduct ? (
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
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Product Group Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Group
                    </label>
                    <select
                      value={filters.productGroup}
                      onChange={(e) => handleFilterChange('productGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Product Groups</option>
                      {availableProductGroups.map((group, index) => (
                        <option key={index} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Group Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Group
                    </label>
                    <select
                      value={filters.subGroup}
                      onChange={(e) => handleFilterChange('subGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Sub Groups</option>
                      {availableSubGroups.map((subGroup, index) => (
                        <option key={index} value={subGroup}>
                          {subGroup}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Installation Checklist Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Checklist
                    </label>
                    <select
                      value={filters.installationChecklistStatus}
                      onChange={(e) => handleFilterChange('installationChecklistStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  {/* PM Checklist Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PM Checklist
                    </label>
                    <select
                      value={filters.pmChecklistStatus}
                      onChange={(e) => handleFilterChange('pmChecklistStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>

                  {/* Created Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created End Date
                    </label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Launch Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Launch Date From
                    </label>
                    <input
                      type="date"
                      value={filters.launchDateStart}
                      onChange={(e) => handleFilterChange('launchDateStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Launch Date To
                    </label>
                    <input
                      type="date"
                      value={filters.launchDateEnd}
                      onChange={(e) => handleFilterChange('launchDateEnd', e.target.value)}
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
              {isSearchMode ? (
                <span>
                  Search Results:{" "}
                  <span className="font-semibold">{totalProducts}</span>{" "}
                  products found for "{searchQuery}"
                </span>
              ) : isFilterMode ? (
                <span>
                  Filtered Results:{" "}
                  <span className="font-semibold">{totalProducts}</span>{" "}
                  products found
                </span>
              ) : (
                <span>
                  Total Records:{" "}
                  <span className="font-semibold">{totalProducts}</span>{" "}
                  products
                </span>
              )}
            </div>
          </div>

          {/* Rest of your existing table code remains the same */}
          <div className="relative w-full overflow-x-auto">
            <table className="w-full border border min-w-max caption-bottom text-sm">
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
                    Part No
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Product Group
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Sub_GRp
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Frequency
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Date of Launch
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    End Of Sale
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    End of Support
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Ex-support avlb
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    installation checklist Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    PM checklist Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
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
                {data?.map((item, index) => (
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
                      {item?.partnoid}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.product}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.productgroup}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.subgrp}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {item?.frequency}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {moment(item?.dateoflaunch).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize align-middle whitespace-nowrap">
                      {moment(item?.endofsaledate).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {moment(item?.endofsupportdate).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {moment(item?.exsupportavlb).format("MMM D, YYYY")}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {item?.installationcheckliststatusboolean}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
                      {item?.pmcheckliststatusboolean}
                    </td>
                    <td className="p-4 font- text-md capitalize text-center align-middle whitespace-nowrap">
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
                ))}
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
                page === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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
                    p === 2 ||
                    p === 3 ||
                    p === totalPages ||
                    p === totalPages - 1 ||
                    p === totalPages - 2 ||
                    Math.abs(p - page) <= 1
                  );
                })
                .map((p, i, array) => (
                  <React.Fragment key={p}>
                    {i > 0 && p - 1 !== array[i - 1] && <span>...</span>}
                    <button
                      className={`border px-3 rounded ${
                        p === page ? "bg-blue-700 text-white" : ""
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              className={`border rounded p-1 ${
                page === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } hover:bg-blue-500 px-2 bg-blue-700 w-[100px] text-white font-semibold`}
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>

          {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 relative">
                <button
                  onClick={closeModal}
                  className="absolute top-0 text-3xl right-3 text-gray-400 hover:text-gray-600"
                >
                  &times;
                </button>
                <ProductBulk onClose={closeModal} isOpen={openModal} />
              </div>
            </div>
          )}

          <Modal
            open={showModal}
            onClose={handleCloseModal}
            className="z-[1] thin-scroll"
            size="lg"
          >
            <ModalDialog size="lg" className="p-2 thin-scroll">
              <div className="flex items-start justify-between p-2 border-b px-5 border-solid border-blueGray-200 rounded-t thin-scroll">
                <h3 className="text-xl font-semibold">
                  {editModal ? "Update Product" : "Create Product"}
                </h3>
                <div
                  onClick={() => handleCloseModal()}
                  className="border p-2 rounded-[4px] hover:bg-gray-200 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    className="bi bi-x-lg font-semibold"
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
                <div className="w-[300px] md:w-[500px] lg:w-[700px] border-b border-solid border-blueGray-200 p-3 flex-auto max-h-[380px] overflow-y-auto">
                  <div className="grid md:grid-cols-2 md:gap-6 w-full">
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Part No{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("partnoid", e.target.value)
                        }
                        id="name"
                        value={currentData?.partnoid}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Product{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("product", e.target.value)
                        }
                        id="name"
                        value={currentData?.product}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Product Group{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("productgroup", e.target.value)
                        }
                        id="name"
                        value={currentData?.productgroup}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Sub_GRp{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("subgrp", e.target.value)
                        }
                        id="name"
                        value={currentData?.subgrp}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Frequency{" "}
                        <span className="text-red-500 text-lg ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        onChange={(e) =>
                          handleFormData("frequency", e.target.value)
                        }
                        id="name"
                        value={currentData?.frequency}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Date of Launch
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("dateoflaunch", e.target.value)
                        }
                        id="name"
                        value={currentData?.dateoflaunch?.split("T")[0]}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        End Of Sale
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("endofsaledate", e.target.value)
                        }
                        id="name"
                        value={currentData?.endofsaledate?.split("T")[0]}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        End of Support
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("endofsupportdate", e.target.value)
                        }
                        id="name"
                        value={currentData?.endofsupportdate?.split("T")[0]}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        Ex-support avlb
                      </label>
                      <input
                        type="date"
                        onChange={(e) =>
                          handleFormData("exsupportavlb", e.target.value)
                        }
                        id="exsupportavlb"
                        value={currentData?.exsupportavlb?.split("T")[0]}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-[4px] focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      />
                    </div>
                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        installation checklist Status
                      </label>
                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        value={
                          currentData?.installationcheckliststatusboolean ===
                            true ||
                          currentData?.installationcheckliststatusboolean ===
                            "true"
                            ? "true"
                            : currentData?.installationcheckliststatusboolean ===
                                false ||
                              currentData?.installationcheckliststatusboolean ===
                                "false"
                            ? "false"
                            : ""
                        }
                        onChange={(e, value) =>
                          handleFormData(
                            "installationcheckliststatusboolean",
                            value === "true"
                              ? true
                              : value === "false"
                              ? false
                              : value
                          )
                        }
                      >
                        <Option value="">Select </Option>
                        <Option value="true">True</Option>
                        <Option value="false">False</Option>
                      </Select>
                    </div>

                    <div className="relative w-full mb-5 group">
                      <label className="block mb-2 text-sm font-medium text-gray-900">
                        PM checklist Status
                      </label>
                      <Select
                        variant="soft"
                        className="rounded-[4px] py-2 border"
                        value={
                          currentData?.pmcheckliststatusboolean === true ||
                          currentData?.pmcheckliststatusboolean === "true"
                            ? "true"
                            : currentData?.pmcheckliststatusboolean === false ||
                              currentData?.pmcheckliststatusboolean === "false"
                            ? "false"
                            : ""
                        }
                        onChange={(e, value) =>
                          handleFormData(
                            "pmcheckliststatusboolean",
                            value === "true"
                              ? true
                              : value === "false"
                              ? false
                              : value
                          )
                        }
                      >
                        <Option value="">Select </Option>
                        <Option value="true">True</Option>
                        <Option value="false">False</Option>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 justify-end mt-3 rounded-b">
                  <button
                    onClick={() => handleCloseModal()}
                    type="button"
                    className="focus:outline-none border h-8 shadow text-black flex items-center hover:bg-gray-200 font-medium rounded-[4px] text-sm px-5 py-2.5 me-2 mb-2"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleSubmit(currentData?._id)}
                    type="submit"
                    className="text-white bg-blue-700 h-8 hover:bg-blue-800 focus:ring-4 flex items-center px-8 focus:ring-blue-300 font-medium rounded-[4px] text-sm py-2.5 me-2 mb-2 :bg-blue-600 :hover:bg-blue-700 focus:outline-none :focus:ring-blue-800 me-2 mb-2"
                  >
                    {editModal ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            </ModalDialog>
          </Modal>
        </>
      )}
    </>
  );
}

export default Product;
