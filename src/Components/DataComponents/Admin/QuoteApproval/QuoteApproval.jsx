import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import ApprovalModal from "./ApprovalModal";
import ViewModal from "./ViewModal";
import { Download, Filter, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../../../LoadingSpinner";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function QuoteApproval() {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [displayProposals, setDisplayProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const limit = 10;
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

  // Utility: process proposal+revision into table row format
  const processProposals = (proposals = []) => {
    const displayData = [];
    proposals.forEach((proposal) => {
      if (proposal.revisions && proposal.revisions.length > 0) {
        proposal.revisions.forEach((rev) => {
          displayData.push({
            ...proposal,
            revisionData: rev,
            isCurrentRevision: rev.revisionNumber === proposal.currentRevision,
            ...rev.changes,
            status: rev.status,
            items: proposal.items?.map((item) => ({
              ...item,
              ...(rev.changes?.items?.find((i) => i._id === item._id) || {}),
            })),
          });
        });
      } else {
        displayData.push({
          ...proposal,
          revisionData: {
            revisionNumber: 0,
            status: proposal.status,
            revisionDate: proposal.createdAt,
          },
          isCurrentRevision: true,
        });
      }
    });
    return displayData;
  };

  // Fetch paginated, optionally filtered proposals
  const fetchProposals = async (pg = page, query = searchQuery) => {
    setLoading(true);
    try {
      const params = {
        page: pg,
        limit: limit,
      };
      if (query && query.trim()) params.q = query.trim();

      const res = await api.get("/phone/proposal/search", { params });
      const rows = res.data?.data?.filter(p => p.discountPercentage > 5) || [];
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setPage(res.data?.pagination?.currentPage || 1);
      setTotalRecords(res.data?.pagination?.totalRecords || rows.length);
      setDisplayProposals(processProposals(rows));
    } catch (error) {
      console.error("Fetch proposals error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch proposals",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(page, searchQuery);
    // eslint-disable-next-line
  }, [page]);

  // Handle search input change with auto-refresh on clear
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search query is cleared, automatically refresh to show all data
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchProposals(1, ""); // Fetch all data when search is cleared
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setPage(1);
      fetchProposals(1, ""); // Fetch all data if empty search
    } else {
      setPage(1);
      fetchProposals(1, searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleOpenApprovalModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowApprovalModal(true);
  };

  const handleOpenViewModal = (proposal) => {
    const revisionData = {
      ...proposal,
      ...proposal.revisionData?.changes,
      status: proposal.revisionData?.status || proposal.status,
      items: proposal.items?.map((item) => {
        return {
          ...item,
          ...(proposal.revisionData?.changes?.items?.find(
            (i) => i._id === item._id
          ) || {}),
        };
      }),
    };

    setSelectedProposal(revisionData);
    setSelectedRevision(proposal.revisionData);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
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
    <div className="min-h-screen ">
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
              onClick={() => fetchProposals(1, searchQuery)}
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
                
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table Container with Fixed Height and Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
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
                    Proposal #
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
                {displayProposals
                  .sort((a, b) => {
                    const dateA = new Date(
                      a.revisionData?.revisionDate || a.createdAt
                    );
                    const dateB = new Date(
                      b.revisionData?.revisionDate || b.createdAt
                    );
                    return dateB - dateA;
                  })
                  .map((proposal, index) => (
                    <tr
                      key={`${proposal._id}-${
                        proposal.revisionData?.revisionNumber || 0
                      }`}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3 md:p-4">
                        <input
                          id={`checkbox-${proposal._id}`}
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                      </td>
                      <td className="p-3 md:p-4 font-bold text-blue-700 whitespace-nowrap">
                        {proposal.proposalNumber}
                      </td>
                      <td className="p-3 md:p-4 whitespace-nowrap">
                        {proposal.revisionData?.revisionNumber > 0 ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-sm">
                              Rev. {proposal.revisionData.revisionNumber}
                            </span>
                            {proposal.isCurrentRevision && (
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
                          {proposal.customer?.customername}
                        </div>
                      </td>
                      <td className="p-3 md:p-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 text-sm font-medium rounded bg-orange-100 text-orange-800">
                          {proposal.discountPercentage}%
                        </span>
                      </td>
                      <td className="p-3 md:p-4 font-semibold text-green-700 whitespace-nowrap">
                        ₹{proposal.finalAmount?.toFixed(2)}
                      </td>
                      <td className="p-3 md:p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                            proposal.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : proposal.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : proposal.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-sm whitespace-nowrap">
                        {moment(
                          proposal.revisionData?.revisionDate ||
                            proposal.createdAt
                        ).format("MMM D, YYYY")}
                      </td>
                      <td className="p-3 md:p-4">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handleOpenViewModal(proposal)}
                            className="inline-flex items-center gap-1 p-2 bg-blue-700 text-white text-xs rounded hover:bg-blue-800 transition-colors"
                            title="View"
                          >
                            <VisibilityIcon className="text-white" fontSize="small" />
                          </button>
                          {proposal.isCurrentRevision && (
                            <button
                              onClick={() => handleOpenApprovalModal(proposal)}
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
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((p) =>
                p === 1 ||
                p === totalPages ||
                (p >= page - 2 && p <= page + 2)
              )
              .map((p, i, array) => (
                <React.Fragment key={p}>
                  {i > 0 && p !== array[i - 1] + 1 && (
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
      <ApprovalModal
        open={showApprovalModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        setProposal={setSelectedProposal}
        userId={userId}
        fetchProposals={() => fetchProposals(page, searchQuery)}
      />

      <ViewModal
        open={showViewModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        revision={selectedRevision}
      />
    </div>
  );
}

export default QuoteApproval;
