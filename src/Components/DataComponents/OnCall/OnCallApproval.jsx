import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import OnCallViewModal from "./OnCallViewModal";
import OnCallApprovalModal from "./OnCallApprovalModal";
import { Download, Filter, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../../LoadingSpinner";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function OnCallApproval() {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [selectedOncall, setSelectedOncall] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [isDownloadingGeo, setIsDownloadingGeo] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData?.details?.id) {
          setUserId(parsedData.details.id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Process OnCalls for revisions
  const processOnCalls = (oncalls = []) => {
    const rows = [];
    oncalls.forEach((oncall) => {
      if (
        oncall.revisions &&
        Array.isArray(oncall.revisions) &&
        oncall.revisions.length > 0
      ) {
        oncall.revisions.forEach((rev) => {
          rows.push({
            ...oncall,
            revisionData: rev,
            isCurrentRevision: rev.revisionNumber === oncall.currentRevision,
            ...rev.changes,
            status: rev.status,
          });
        });
      } else {
        rows.push({
          ...oncall,
          revisionData: {
            revisionNumber: 0,
            status: oncall.status,
            revisionDate: oncall.createdAt,
          },
          isCurrentRevision: true,
        });
      }
    });
    return rows;
  };

  // Fetch paginated, optionally filtered OnCalls
  const fetchOnCalls = async (pg = page, query = searchQuery) => {
    setLoading(true);
    try {
      const params = {
        page: pg,
        limit: limit,
      };
      if (query && query.trim()) params.q = query.trim();

      const res = await api.get("/phone/oncall/search", { params });
      const rows = res.data?.data?.filter(item => 
        typeof item.discountPercentage === "number" &&
        !Number.isNaN(item.discountPercentage) &&
        item.discountPercentage > 5
      ) || [];
      
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setPage(res.data?.pagination?.currentPage || 1);
      setTotalRecords(res.data?.pagination?.totalRecords || rows.length);
      setDisplayedRows(processOnCalls(rows));
    } catch (error) {
      console.error("Fetch OnCalls error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch oncalls",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnCalls(page, searchQuery);
    // eslint-disable-next-line
  }, [page]);

  // Handle search input change with auto-refresh on clear
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search query is cleared, automatically refresh to show all data
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchOnCalls(1, ""); // Fetch all data when search is cleared
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setPage(1);
      fetchOnCalls(1, ""); // Fetch all data if empty search
    } else {
      setPage(1);
      fetchOnCalls(1, searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleOpenApprovalModal = (oncall) => {
    setSelectedOncall(oncall);
    setShowApprovalModal(true);
  };

  const handleOpenViewModal = (oncall) => {
    const revisionData = {
      ...oncall,
      ...oncall.revisionData?.changes,
      status: oncall.revisionData?.status || oncall.status,
    };
    setSelectedOncall(revisionData);
    setSelectedRevision(oncall.revisionData);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedOncall(null);
    setSelectedRevision(null);
  };

  // Pagination Controls
  const onPaginationClick = (p) => {
    if (p >= 1 && p <= totalPages && p !== page) setPage(p);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="CustomLoader"></span>
      </div>
    );
  }

  return (
    <div className="">
      {/* Search Section */}
      <div className="bg-gray-100 border mb-2 border-gray-200 rounded-lg p-4 shadow-sm">
        {/* Top Row: Search and Main Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search records, users, or data..."
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
            {/* Refresh Button Always Visible */}
            <button
              onClick={() => fetchOnCalls(1, searchQuery)}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-md font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter, Download Excel */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            disabled={isDownloadingGeo}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDownloadingGeo
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white shadow-lg hover:bg-blue-50 text-gray-700 focus:ring-gray-500/20"
            }`}
          >
            {isDownloadingGeo ? (
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

      {/* Table Container with Fixed Height and Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-sm min-w-max">
              <thead className="sticky top-0 z-10 bg-blue-700">
                <tr className="border-b">
                  <th scope="col" className="p-3 md:p-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    OnCall #
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Revision
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Customer
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Discount
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Final Amount
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Status
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Created Date
                  </th>
                  <th className="h-12 px-3 md:px-4 text-left align-middle font-medium text-white whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedRows
                  .sort((a, b) => {
                    const dateA = new Date(
                      a.revisionData?.revisionDate || a.createdAt
                    );
                    const dateB = new Date(
                      b.revisionData?.revisionDate || b.createdAt
                    );
                    return dateB - dateA;
                  })
                  .map((oncall, index) => (
                    <tr
                      key={`${oncall._id}-${
                        oncall.revisionData?.revisionNumber || 0
                      }`}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3 md:p-4">
                        <input
                          id={`checkbox-${oncall._id}`}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                      </td>
                      <td className="p-3 md:p-4 font-bold text-blue-700 whitespace-nowrap">
                        {oncall.onCallNumber}
                      </td>
                      <td className="p-3 md:p-4 whitespace-nowrap">
                        {oncall.revisionData?.revisionNumber > 0 ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-sm">
                              Rev. {oncall.revisionData.revisionNumber}
                            </span>
                            {oncall.isCurrentRevision && (
                              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 w-fit">
                                Current
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            Original
                          </span>
                        )}
                      </td>
                      <td className="p-3 md:p-4 capitalize">
                        <div className="max-w-[120px] md:max-w-none truncate">
                          {oncall.customer?.customername}
                        </div>
                      </td>
                      <td className="p-3 md:p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-sm font-medium rounded bg-orange-100 text-orange-800">
                          {oncall.discountPercentage}%
                        </span>
                      </td>
                      <td className="p-3 md:p-4 font-semibold text-green-700 whitespace-nowrap">
                        ₹{oncall.finalAmount?.toFixed(2)}
                      </td>
                      <td className="p-3 md:p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                            oncall.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : oncall.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : oncall.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {oncall.status}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-sm whitespace-nowrap">
                        {moment(
                          oncall.revisionData?.revisionDate || oncall.createdAt
                        ).format("MMM D, YYYY")}
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleOpenViewModal(oncall)}
                            className="inline-flex items-center gap-1 p-2 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 transition-colors"
                            title="View"
                          >
                            <VisibilityIcon className="text-white" fontSize="small" />
                          </button>
                          {oncall.isCurrentRevision && (
                            <button
                              onClick={() => handleOpenApprovalModal(oncall)}
                              className="inline-flex items-center gap-1 p-2 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 transition-colors"
                              title="Edit"
                            >
                              <EditIcon className="text-white" fontSize="small" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Showing {Math.min((page - 1) * limit + 1, totalRecords)} to {Math.min(page * limit, totalRecords)} of {totalRecords} results
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
              page === 1
                ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                : "cursor-pointer bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => onPaginationClick(page - 1)}
            disabled={page === 1}
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
              .map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && p !== arr[i - 1] + 1 && (
                    <span className="px-2 py-2 text-gray-400">...</span>
                  )}
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded border transition-colors ${
                      p === page
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => onPaginationClick(p)}
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
            className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
              page === totalPages
                ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                : "cursor-pointer bg-blue-700 text-white border-blue-700 hover:bg-blue-800"
            }`}
            onClick={() => onPaginationClick(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <OnCallApprovalModal
        open={showApprovalModal}
        onClose={handleCloseModal}
        proposal={selectedOncall}
        setProposal={setSelectedOncall}
        userId={userId}
        fetchProposals={() => fetchOnCalls(page, searchQuery)}
      />

      <OnCallViewModal
        open={showViewModal}
        onClose={handleCloseModal}
        proposal={selectedOncall}
        revision={selectedRevision}
      />
    </div>
  );
}

export default OnCallApproval;
