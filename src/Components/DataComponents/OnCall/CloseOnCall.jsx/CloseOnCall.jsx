import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Download, Eye, Filter, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../../../LoadingSpinner";

// Show a loader while fetching
function Loader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="CustomLoader"></span>
    </div>
  );
}

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function CloseOnCall() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingHubStock, setIsDownloadingHubStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 50; // Higher limit for customer grouping
  const navigate = useNavigate();

  // Fetch data with server-side search
  const fetchCustomersWithOnCalls = async (pg = page, query = searchQuery) => {
    setLoading(true);
    try {
      const params = {
        page: pg,
        limit: limit,
      };

      if (query && query.trim()) {
        params.q = query.trim();
      }

      // Use search API if query exists, otherwise use paginated API
      const endpoint =
        query && query.trim()
          ? "/phone/oncall/search"
          : "/phone/oncall/pagecall";
      const res = await api.get(endpoint, { params });

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];

      const filtered = rawData.filter(
        (item) =>
          item.onCallproposalstatus !== "Open" &&
          typeof item.discountPercentage === "number"
      );
      // Group by customer.customercodeid
      const grouped = {};
      filtered.forEach((oncall) => {
        const custId = oncall.customer?.customercodeid || "unknown";
        if (!grouped[custId]) {
          grouped[custId] = {
            customer: oncall.customer,
            oncalls: [],
          };
        }
        grouped[custId].oncalls.push(oncall);
      });

      const customerList = Object.values(grouped);
      setCustomers(customerList);

      // Update pagination from API response
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalRecords(
          res.data.pagination.totalRecords || customerList.length
        );
        setPage(res.data.pagination.currentPage || pg);
      } else {
        // Fallback for non-paginated response
        setTotalPages(1);
        setTotalRecords(customerList.length);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setTotalPages(1);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomersWithOnCalls(page, searchQuery);
    // eslint-disable-next-line
  }, [page]);

  // Handle search input change with auto-refresh on clear
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If search query is cleared, automatically refresh to show all data
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchCustomersWithOnCalls(1, ""); // Fetch all data when search is cleared
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchCustomersWithOnCalls(1, searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setPage(1);
    fetchCustomersWithOnCalls(1, "");
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePageClick = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== page) {
      setPage(pageNum);
    }
  };

  if (loading) return <Loader />;

  if (!customers.length)
    return (
      <div className="text-center py-16 text-lg font-semibold text-gray-400">
        {searchQuery
          ? "No customers found matching your search."
          : "No on-calls with discount > 5% found."}
      </div>
    );

  // Calculate total OnCalls for display
  const totalOnCalls = customers.reduce(
    (sum, { oncalls }) => sum + oncalls.length,
    0
  );

  return (
    <div className="">
      {/* Search Section */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
        {/* Top Row: Search and Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search OnCall, Customer, Product, Complaint ID..."
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={handleKeyPress}
                  onChange={handleSearchChange}
                  className="bg-gray-50 h-10 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
              </FormControl>
            </div>
            <button
              onClick={handleSearch}
              type="button"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 whitespace-nowrap"
            >
              Search
            </button>
          </div>
          <div className="flex gap-3">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter, Download */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing {totalOnCalls} OnCalls from {customers.length} customers
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              disabled={isDownloadingHubStock}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDownloadingHubStock
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
              }`}
            >
              {isDownloadingHubStock ? (
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
      </div>

      {/* Table Container with Fixed Height and Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-sm min-w-max">
              <thead className="sticky top-0 z-10 bg-blue-700">
                <tr className="border-b">
                  <th className="p-3 font-bold text-white text-left">
                    OnCall #
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Created By
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Product
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Customer Name
                  </th>
                  <th className="p-3 font-bold text-white text-left">City</th>
                  <th className="p-3 font-bold text-white text-left">Staus</th>

                  <th className="p-3 font-bold text-white text-left">
                    OnCall Date
                  </th>
                  <th className="p-3 font-bold text-white text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(({ customer, oncalls }) =>
                  oncalls.map((oncall, oncallIndex) => (
                    <tr
                      key={`${customer?.customercodeid}-${oncall._id}-${oncallIndex}`}
                      className={`hover:bg-gray-50 transition-colors ${
                        oncallIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3 font-semibold text-blue-700">
                        {oncall?.onCallNumber || "--"}
                      </td>
                      <td className="p-3">
                        <div className="max-w-28">
                          <div className="font-medium text-sm text-gray-800">
                            {oncall?.createdBy || "--"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {`${oncall?.createdByUser?.firstname} ${oncall?.createdByUser?.lastname}` || "Unknown User"}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-32">
                          <div
                            className="font-medium text-xs truncate"
                            title={
                              oncall?.productGroups?.[0]?.productPartNo ||
                              oncall?.complaint?.materialdescription
                            }
                          >
                            {oncall?.productGroups?.[0]?.productPartNo ||
                              oncall?.complaint?.materialdescription ||
                              "--"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {oncall?.complaint?.serialnumber
                              ? `S/N: ${oncall.complaint.serialnumber}`
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium capitalize">
                            {customer?.customername || "--"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {customer?.customercode || ""}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{customer?.city || "--"}</td>

                      <td className="flex items-center justify-center ">
                        <div className="px-3 py-2 rounded  bg-gray-300 mt-2 border">
                          {oncall?.onCallproposalstatus || "--"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <div>
                            {moment(oncall?.createdAt).format("MMM D, YYYY")}
                          </div>
                          <div className="text-gray-500">
                            {moment(oncall?.createdAt).format("h:mm A")}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          className="bg-blue-700 text-white px-4 py-1 rounded font-bold hover:bg-blue-800 transition-colors text-sm"
                          onClick={() =>
                            navigate(
                              `/close/on-call/customer/${customer?.customercodeid}`
                            )
                          }
                        >
                          <Eye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Page {page} of {totalPages} • {totalRecords} total records
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                page === 1
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    (p >= page - 2 && p <= page + 2)
                )
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p !== arr[idx - 1] + 1 && (
                      <span className="px-2 py-2 text-gray-400">…</span>
                    )}
                    <button
                      onClick={() => handlePageClick(p)}
                      className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                        p === page
                          ? "bg-blue-700 text-white border-blue-700"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      disabled={p === page}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <div className="sm:hidden text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                page === totalPages
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                  : "cursor-pointer bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
