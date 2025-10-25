import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import SearchIcon from "@mui/icons-material/Search";
import {
  Download,
  RefreshCw,
  UserPlus,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import LoadingSpinner from "../../../LoadingSpinner";

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

export default function CMCNCMCAssign() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [technicians, setTechnicians] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [bulkSelection, setBulkSelection] = useState([]);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const limit = 50;
  const navigate = useNavigate();

  // Fetch technicians/assignees
  const fetchTechnicians = async () => {
    try {
      const res = await api.get("/collections/user/technicians");
      setTechnicians(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      setTechnicians([]);
    }
  };

  // Fetch CMC/NCMC proposals with filters
  const fetchProposals = async (
    pg = page,
    query = searchQuery,
    status = statusFilter
  ) => {
    setLoading(true);
    try {
      const params = {
        page: pg,
        limit: limit,
      };

      if (query && query.trim()) {
        params.q = query.trim();
      }
      if (status !== "all") {
        params.status = status;
      }

      const endpoint = "/phone/proposal/assign-list";
      const res = await api.get(endpoint, { params });
      console.log(res);

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];
      setProposals(rawData);

      // Update pagination from API response
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalRecords(res.data.pagination.totalRecords || rawData.length);
        setPage(res.data.pagination.currentPage || pg);
      } else {
        setTotalPages(1);
        setTotalRecords(rawData.length);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setProposals([]);
      setTotalPages(1);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTechnicians();
    fetchProposals(page, searchQuery, statusFilter);
    // eslint-disable-next-line
  }, [page]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchProposals(1, "", statusFilter);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchProposals(1, searchQuery, statusFilter);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
    setBulkSelection([]);
    fetchProposals(1, "", "all");
  };

  // Filter handlers
  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(1);
    fetchProposals(1, searchQuery, newValue);
  };

  // Assignment handlers
  const handleAssignClick = (proposal) => {
    setSelectedProposal(proposal);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (technicianId, notes = "") => {
    try {
      await api.post(`/phone/proposal/${selectedProposal._id}/assign`, {
        assignedTo: technicianId,
        notes,
      });

      // Refresh the list
      fetchProposals(page, searchQuery, statusFilter);
      setShowAssignModal(false);
      setSelectedProposal(null);

      // Show success message
      console.log("Proposal assigned successfully");
    } catch (error) {
      console.error("Error assigning proposal:", error);
    }
  };

  // Bulk selection handlers
  const handleBulkSelect = (proposalId) => {
    setBulkSelection((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  };

  const handleSelectAll = () => {
    if (bulkSelection.length === proposals.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(proposals.map((p) => p._id));
    }
  };

  const handleBulkAssign = async (technicianId) => {
    try {
      await api.post("/phone/proposal/bulk-assign", {
        proposalIds: bulkSelection,
        assignedTo: technicianId,
      });

      fetchProposals(page, searchQuery, statusFilter);
      setBulkSelection([]);
      setShowBulkAssign(false);

      console.log(`${bulkSelection.length} proposals assigned successfully`);
    } catch (error) {
      console.error("Error bulk assigning proposals:", error);
    }
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

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      orphaned_deactivated: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      orphaned_expired: { color: "bg-orange-100 text-orange-800", icon: AlertCircle },
      orphaned_user_not_found: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
      active: { color: "bg-green-100 text-green-800", icon: CheckCircle2 }
    };

    const config = statusConfig[status] || statusConfig.orphaned_user_not_found;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3" />
        {status?.replace("_", " ").toUpperCase() || "ORPHANED"}
      </span>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              CMC/NCMC Assignment Center
            </h1>
            <p className="text-green-100">
              Manage and assign CMC/NCMC proposals to technicians
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{totalRecords}</div>
              <div className="text-sm text-green-200">Total Proposals</div>
            </div>
            <Users className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
        {/* Top Row: Search and Filters */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="relative flex-1 lg:max-w-md">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search Proposal, Customer, Serial Number..."
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={handleKeyPress}
                  onChange={handleSearchChange}
                  className="bg-white h-10 border border-gray-300 rounded-lg text-sm"
                />
              </FormControl>
            </div>

            <button
              onClick={handleSearch}
              type="button"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              Search
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Bulk Actions and Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {proposals.length} of {totalRecords} proposals
            </div>

            {bulkSelection.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">
                  {bulkSelection.length} selected
                </span>
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Bulk Assign
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              disabled={isDownloading}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isDownloading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
              }`}
            >
              {isDownloading ? (
                <>
                  <LoadingSpinner />
                  <span className="hidden sm:inline">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-sm min-w-max">
              <thead className="sticky top-0 z-10 bg-green-700">
                <tr className="border-b">
                  <th className="p-3 font-bold text-white text-left">
                    <input
                      type="checkbox"
                      checked={
                        bulkSelection.length === proposals.length &&
                        proposals.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Proposal #
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Serial Number
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Customer Name
                  </th>
                  <th className="p-3 font-bold text-white text-left">Status</th>
                  <th className="p-3 font-bold text-white text-left">City</th>
                  <th className="p-3 font-bold text-white text-left">
                    Final Amount
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Created Date
                  </th>
                  <th className="p-3 font-bold text-white text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proposals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-lg font-semibold text-gray-400"
                    >
                      {searchQuery || statusFilter !== "all"
                        ? "No proposals found matching your filters."
                        : "No proposals available for assignment."}
                    </td>
                  </tr>
                ) : (
                  proposals.map((proposal, index) => (
                    <tr
                      key={proposal._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={bulkSelection.includes(proposal._id)}
                          onChange={() => handleBulkSelect(proposal._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3 font-semibold text-green-700">
                        {proposal?.proposalNumber || "--"}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-sm">
                          {proposal?.serialNumber || "--"}
                        </div>
                      </td>
                      <td className="p-3 font-medium capitalize truncate">
                        {proposal?.customer?.customername || "--"}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(proposal?.assignmentStatus)}
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {proposal?.customer?.city || ""}
                      </td>
                      <td className="p-3 font-medium text-green-600">
                        ₹{proposal?.finalAmount?.toFixed(2) || "--"}
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <div>
                            {moment(proposal?.createdAt).format("MMM D, YYYY")}
                          </div>
                          <div className="text-gray-500">
                            {moment(proposal?.createdAt).format("h:mm A")}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            onClick={() => handleAssignClick(proposal)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
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
                          ? "bg-green-700 text-white border-green-700"
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
                  : "cursor-pointer bg-green-700 text-white border-green-700 hover:bg-green-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedProposal && (
        <AssignmentModal
          proposal={selectedProposal}
          technicians={technicians}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedProposal(null);
          }}
          onAssign={handleAssignSubmit}
        />
      )}

      {/* Bulk Assignment Modal */}
      {showBulkAssign && (
        <BulkAssignModal
          selectedCount={bulkSelection.length}
          technicians={technicians}
          onClose={() => setShowBulkAssign(false)}
          onAssign={handleBulkAssign}
        />
      )}
    </div>
  );
}

// Assignment Modal Component
function AssignmentModal({ proposal, technicians, onClose, onAssign }) {
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTechnician) {
      onAssign(selectedTechnician, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assign Proposal #{proposal.proposalNumber}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Technician
              </label>
              <FormControl fullWidth size="sm">
                <Select
                  placeholder="Select user..."
                  value={selectedTechnician}
                  onChange={(event, newValue) =>
                    setSelectedTechnician(newValue)
                  }
                  required
                >
                  {technicians.map((tech) => (
                    <Option key={tech.employeeid} value={tech.employeeid}>
                      {tech.name} ({tech.role})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="3"
                placeholder="Add any special instructions..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Bulk Assignment Modal Component
function BulkAssignModal({ selectedCount, technicians, onClose, onAssign }) {
  const [selectedTechnician, setSelectedTechnician] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTechnician) {
      onAssign(selectedTechnician);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bulk Assign {selectedCount} Proposals
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Technician
              </label>
              <FormControl fullWidth size="sm">
                <Select
                  placeholder="Select user..."
                  value={selectedTechnician}
                  onChange={(event, newValue) =>
                    setSelectedTechnician(newValue)
                  }
                  required
                >
                  {technicians.map((tech) => (
                    <Option key={tech.employeeid} value={tech.employeeid}>
                      {tech.name} ({tech.role})
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                This will assign all {selectedCount} selected proposals to the
                chosen technician.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Assign All
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}