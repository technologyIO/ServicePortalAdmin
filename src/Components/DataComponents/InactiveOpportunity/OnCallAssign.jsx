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

export default function OnCallAssign() {
  const [onCalls, setOnCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [technicians, setTechnicians] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOnCall, setSelectedOnCall] = useState(null);
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

  // Fetch OnCalls with filters
  const fetchOnCalls = async (
    pg = page,
    query = searchQuery,
    status = statusFilter,
    assignee = assigneeFilter
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
      if (assignee !== "all") {
        params.assignee = assignee;
      }

      const endpoint = "/phone/oncall/assign-list";
      const res = await api.get(endpoint, { params });
      console.log(res);

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];
      setOnCalls(rawData);

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
      console.error("Error fetching OnCalls:", error);
      setOnCalls([]);
      setTotalPages(1);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTechnicians();
    fetchOnCalls(page, searchQuery, statusFilter, assigneeFilter);
    // eslint-disable-next-line
  }, [page]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchOnCalls(1, "", statusFilter, assigneeFilter);
    }
  };

  // Handle search
  const handleSearch = () => {
    setPage(1);
    fetchOnCalls(1, searchQuery, statusFilter, assigneeFilter);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setAssigneeFilter("all");
    setPage(1);
    setBulkSelection([]);
    fetchOnCalls(1, "", "all", "all");
  };

  // Filter handlers
  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(1);
    fetchOnCalls(1, searchQuery, newValue, assigneeFilter);
  };

  const handleAssigneeFilterChange = (event, newValue) => {
    setAssigneeFilter(newValue);
    setPage(1);
    fetchOnCalls(1, searchQuery, statusFilter, newValue);
  };

  // Assignment handlers
  const handleAssignClick = (onCall) => {
    setSelectedOnCall(onCall);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (
    technicianId,
    notes = ""
  ) => {
    try {
      await api.post(`/phone/oncall/${selectedOnCall._id}/assign`, {
        assignedTo: technicianId,
        notes,
      });

      // Refresh the list
      fetchOnCalls(page, searchQuery, statusFilter, assigneeFilter);
      setShowAssignModal(false);
      setSelectedOnCall(null);

      // Show success message
      console.log("OnCall assigned successfully");
    } catch (error) {
      console.error("Error assigning OnCall:", error);
    }
  };

  // Bulk selection handlers
  const handleBulkSelect = (onCallId) => {
    setBulkSelection((prev) =>
      prev.includes(onCallId)
        ? prev.filter((id) => id !== onCallId)
        : [...prev, onCallId]
    );
  };

  const handleSelectAll = () => {
    if (bulkSelection.length === onCalls.length) {
      setBulkSelection([]);
    } else {
      setBulkSelection(onCalls.map((oc) => oc._id));
    }
  };

  const handleBulkAssign = async (technicianId) => {
    try {
      await api.post("/phone/oncall/bulk-assign", {
        onCallIds: bulkSelection,
        assignedTo: technicianId,
      });

      fetchOnCalls(page, searchQuery, statusFilter, assigneeFilter);
      setBulkSelection([]);
      setShowBulkAssign(false);

      console.log(`${bulkSelection.length} OnCalls assigned successfully`);
    } catch (error) {
      console.error("Error bulk assigning OnCalls:", error);
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
      unassigned: { color: "bg-red-100 text-red-800", icon: AlertCircle },
      assigned: { color: "bg-blue-100 text-blue-800", icon: Clock },
      in_progress: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    };

    const config = statusConfig[status] || statusConfig.unassigned;
    const IconComponent = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3 h-3" />
        {status?.replace("_", " ").toUpperCase() || "UNASSIGNED"}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: "bg-red-100 text-red-800",
      normal: "bg-blue-100 text-blue-800",
      low: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          priorityConfig[priority] || priorityConfig.normal
        }`}
      >
        {priority?.toUpperCase() || "NORMAL"}
      </span>
    );
  };

  if (loading) return <Loader />;

  // if (!onCalls.length)
  //   return (
  //     <div className="text-center py-16 text-lg font-semibold text-gray-400">
  //       {searchQuery || statusFilter !== "all" || assigneeFilter !== "all"
  //         ? "No OnCalls found matching your filters."
  //         : "No OnCalls available for assignment."}
  //     </div>
  //   );

  return (
    <div className="">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              OnCall Assignment Center
            </h1>
            <p className="text-blue-100">
              Manage and assign OnCall tickets to technicians
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{totalRecords}</div>
              <div className="text-sm text-blue-200">Total OnCalls</div>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
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
                  placeholder="Search OnCall, Customer, Product..."
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onKeyDown={handleKeyPress}
                  onChange={handleSearchChange}
                  className="bg-white h-10 border border-gray-300 rounded-lg text-sm"
                />
              </FormControl>
            </div>

            {/* <div className="flex flex-col sm:flex-row gap-3">
              <FormControl size="sm" sx={{ minWidth: 120 }}>
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  size="sm"
                >
                  <Option value="all">All Status</Option>
                  <Option value="unassigned">Unassigned</Option>
                  <Option value="assigned">Assigned</Option>
                  <Option value="in_progress">In Progress</Option>
                  <Option value="completed">Completed</Option>
                </Select>
              </FormControl>

              <FormControl size="sm" sx={{ minWidth: 140 }}>
                <Select
                  placeholder="Assignee"
                  value={assigneeFilter}
                  onChange={handleAssigneeFilterChange}
                  size="sm"
                >
                  <Option value="all">All Assignees</Option>
                  <Option value="unassigned">Unassigned</Option>
                  {technicians.map(tech => (
                    <Option key={tech._id} value={tech._id}>
                      {tech.name}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </div> */}

            <button
              onClick={handleSearch}
              type="button"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap"
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
              Showing {onCalls.length} of {totalRecords} OnCalls
            </div>

            {bulkSelection.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">
                  {bulkSelection.length} selected
                </span>
                <button
                  onClick={() => setShowBulkAssign(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Bulk Assign
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {/* <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              More Filters
            </button> */}

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
              <thead className="sticky top-0 z-10 bg-blue-700">
                <tr className="border-b">
                  <th className="p-3 font-bold text-white text-left">
                    <input
                      type="checkbox"
                      checked={
                        bulkSelection.length === onCalls.length &&
                        onCalls.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    OnCall #
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Product
                  </th>
                  <th className="p-3 font-bold text-white text-left">
                    Customer Name
                  </th>
                  <th className="p-3 font-bold text-white text-left">Status</th>
                  {/* <th className="p-3 font-bold text-white text-left">Assigned To</th>
                  <th className="p-3 font-bold text-white text-left">Priority</th> */}
                  <th className="p-3 font-bold text-white text-left">City</th>
                  <th className="p-3 font-bold text-white text-left">
                    OnCall Date
                  </th>
                  <th className="p-3 font-bold text-white text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {onCalls.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-12 text-lg font-semibold text-gray-400"
                    >
                      {searchQuery ||
                      statusFilter !== "all" ||
                      assigneeFilter !== "all"
                        ? "No OnCalls found matching your filters."
                        : "No OnCalls available for assignment."}
                    </td>
                  </tr>
                ) : (
                  onCalls.map((onCall, index) => (
                    <tr
                      key={onCall._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={bulkSelection.includes(onCall._id)}
                          onChange={() => handleBulkSelect(onCall._id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="p-3 font-semibold text-blue-700">
                        {onCall?.onCallNumber || "--"}
                      </td>
                      <td className="p-3">
                        <div className="max-w-32">
                          <div
                            className="font-medium text-xs truncate"
                            title={onCall?.productGroups?.[0]?.productPartNo}
                          >
                            {onCall?.productGroups?.[0]?.productPartNo || "--"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {onCall?.complaint?.serialnumber
                              ? `S/N: ${onCall.complaint.serialnumber}`
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-medium capitalize truncate">
                        {onCall?.customer?.customername || "--"}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(onCall?.assignmentStatus)}
                      </td>
                      <td className="p-3 text-sm text-gray-800">
                        {onCall?.customer?.city || ""}
                      </td>
                      {/* <td className="p-3">
                      {onCall?.assignedTo ? (
                        <div>
                          <div className="font-medium text-sm">
                            {onCall.assignedTo.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {onCall.assignedTo.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td> */}
                      {/* <td className="p-3">
                      {getPriorityBadge(onCall?.priority)}
                    </td> */}
                      <td className="p-3">
                        <div className="text-xs">
                          <div>
                            {moment(onCall?.createdAt).format("MMM D, YYYY")}
                          </div>
                          <div className="text-gray-500">
                            {moment(onCall?.createdAt).format("h:mm A")}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                            onClick={() => handleAssignClick(onCall)}
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                          {/* <button
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          onClick={() =>
                            navigate(`/on-call/details/${onCall._id}`)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </button> */}
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

      {/* Assignment Modal */}
      {showAssignModal && selectedOnCall && (
        <AssignmentModal
          onCall={selectedOnCall}
          technicians={technicians}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedOnCall(null);
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
function AssignmentModal({ onCall, technicians, onClose, onAssign }) {
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [priority, setPriority] = useState("normal");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTechnician) {
      onAssign(selectedTechnician, priority, notes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Assign OnCall #{onCall.onCallNumber}
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
                Priority
              </label>
              <FormControl fullWidth size="sm">
                <Select
                  value={priority}
                  onChange={(event, newValue) => setPriority(newValue)}
                >
                  <Option value="low">Low</Option>
                  <Option value="normal">Normal</Option>
                  <Option value="high">High</Option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
            Bulk Assign {selectedCount} OnCalls
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
                This will assign all {selectedCount} selected OnCalls to the
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
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
