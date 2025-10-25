import React, { useEffect, useState, useCallback } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Modal, ModalDialog, Typography, Box, Divider } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusDateCell from "./StatusDateCell";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function OpenProposal() {
  /* ───────────────────────── STATES ───────────────────────── */
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const [coNumber, setCoNumber] = useState(""); // Single CO number for entire proposal
  const navigate = useNavigate();
  const limit = 10;

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
  const handleProposalStatusUpdate = (proposalId, newStatus, remark) => {
    // Update local state
    setProposals((prevProposals) =>
      prevProposals.map((p) =>
        p._id === proposalId
          ? {
              ...p,
              Cmcncmcsostatus: newStatus,
              ...(remark && { proposalRemark: remark }),
            }
          : p
      )
    );

    console.log(`Proposal status updated to ${newStatus}`);
  };
  /* ───────────────────────── API CALLS ───────────────────────── */
  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/phone/proposal/all?page=${page}&limit=${limit}`
      );

      const data = res.data.records || [];
      const pagesCount = res.data.totalPages || 1;

      // Filter out completed proposals
      const filteredProposals = data.filter(
        (proposal) => proposal.Cmcncmcsostatus === "Open"
      );

      setProposals(filteredProposals);
      setFilteredData(filteredProposals);
      setTotalPages(pagesCount);
    } catch (error) {
      console.error("Fetch proposals error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch proposals");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  /* ───────────────────────── SEARCH ───────────────────────── */
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredData(proposals);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filtered = proposals.filter((row) => {
      return (
        row.proposalNumber?.toLowerCase().includes(query) ||
        row.customer?.customername?.toLowerCase().includes(query) ||
        row.status?.toLowerCase().includes(query) ||
        row.items?.some(
          (item) =>
            item.equipment?.materialdescription
              ?.toLowerCase()
              .includes(query) ||
            item.equipment?.materialcode?.toLowerCase().includes(query)
        )
      );
    });

    setFilteredData(filtered);
  };
  useEffect(() => {
    if (!searchQuery) {
      fetchProposals();
    }
  }, [searchQuery]);
  /* ───────────────────────── MODALS ───────────────────────── */
  const handleOpenApprovalModal = (proposal) => {
    setSelectedProposal(proposal);
    setCoNumber(""); // Reset CO number
    setShowApprovalModal(true);
  };

  const handleOpenViewModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
    setCoNumber("");
  };

  /* ───────────────────────── ACTIONS ───────────────────────── */
  const handleCloseProposal = async () => {
    try {
      // Validate CoNumber
      if (!coNumber || coNumber.trim() === "") {
        toast.error("Please enter a valid CO Number");
        return;
      }

      // Make API call to update CoNumber and status
      await api.put(`/phone/proposal/${selectedProposal._id}/update-conumber`, {
        CoNumber: coNumber,
      });

      toast.success("Proposal closed successfully");
      fetchProposals();
      handleCloseModal();
    } catch (error) {
      console.error("Error closing proposal:", error);
      toast.error(error.response?.data?.message || "Failed to close proposal");
    }
  };
  const handleDownloadQuote = (proposalId) => {
    navigate(`/quote-template/${proposalId}`);
  };
  /* ───────────────────────── HELPERS ───────────────────────── */
  const getStatusColor = (status) => {
    const colorMap = {
      closed_won: "bg-green-100 text-green-800",
      open: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800", // add more if needed
      draft: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getRevisionBadgeColor = (revisionNumber) => {
    if (revisionNumber <= 1) return "bg-blue-100 text-blue-800";
    if (revisionNumber === 2) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getTotalItems = (items) => {
    return items?.length || 0;
  };

  const getApprovalStatus = (items) => {
    if (!items || items.length === 0)
      return { text: "No Items", color: "text-gray-600" };

    const totalItems = items.length;
    const rshApproved = items.filter(
      (item) => item.RSHApproval?.approved
    ).length;
    const nshApproved = items.filter(
      (item) => item.NSHApproval?.approved
    ).length;

    if (rshApproved === totalItems && nshApproved === totalItems) {
      return { text: "Fully Approved", color: "text-green-600" };
    }
    if (rshApproved > 0 || nshApproved > 0) {
      return { text: "Partially Approved", color: "text-orange-600" };
    }
    return { text: "Pending Approval", color: "text-red-600" };
  };
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  /* ───────────────────────── PAGINATION ───────────────────────── */
  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  /* ───────────────────────── RENDER ───────────────────────── */
  return loading ? (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="CustomLoader" />
    </div>
  ) : (
    <>
      {/* TOP-BAR */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex gap-3 w-full md:w-auto">
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search Proposal / Customer / Equipment / Material Code..."
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </FormControl>
          <button
            onClick={handleSearch}
            className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-medium"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <button className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-medium">
            Filter
          </button>
          <button
            onClick={fetchProposals}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium"
            title="Refresh"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative w-full overflow-x-auto border rounded shadow-sm">
        <table className="w-full text-sm min-w-max">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="p-3 text-left">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="p-3 text-left font-medium">Proposal Number</th>
              <th className="p-3 text-left font-medium">Serial Number</th>
              <th className="p-3 text-left font-medium">Cnote Number</th>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Items</th>
              <th className="p-3 text-left font-medium">Revision</th>
              <th className="p-3 text-left font-medium">Discount %</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Final Amount</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">CNote PDF</th>
              <th className="p-3 text-left font-medium">Quote PDF</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((proposal, idx) => {
              const approvalStatus = getApprovalStatus(proposal.items);

              return (
                <tr key={proposal._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </td>

                  <td className="p-3 font-bold text-gray-600">
                    {proposal?.proposalNumber}
                  </td>
                  <td className="p-3 font-bold text-blue-600">
                    {proposal?.serialNumber}
                  </td>
                  <td className="p-3 font-bold text-gray-600">
                    {proposal?.cnoteNumber}
                  </td>

                  <td className="p-3">
                    <div>
                      <div className="font-medium capitalize">
                        {proposal.customer?.customername}
                      </div>
                      <div className="text-xs text-gray-500">
                        {proposal.customer?.city}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                      {getTotalItems(proposal.items)} items
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRevisionBadgeColor(
                        proposal.currentRevision
                      )}`}
                    >
                      Rev {proposal.currentRevision || 0}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      {proposal.discountPercentage?.toFixed(1)}%
                    </span>
                  </td>

                  <td className="p-3">
                    <StatusDateCell
                      cnoteNumber={proposal.cnoteNumber}
                      fetchProposals={fetchProposals}
                      proposal={proposal}
                      onStatusUpdate={handleProposalStatusUpdate}
                    />
                  </td>
                  <td className="p-3 font-semibold text-green-600">
                    ₹{proposal.finalAmount?.toLocaleString("en-IN") || "0"}
                  </td>

                  <td className="p-3">
                    <div>
                      {moment(proposal.createdAt).format("MMM D, YYYY")}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        window.open(
                          `${process.env.REACT_APP_BASE_URL}/phone/cnote/proposal/${proposal.proposalNumber}/cnote-pdf`,
                          "_blank"
                        )
                      }
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="Download CNote PDF"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 1-.708.708l3 3z" />
                      </svg>
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDownloadQuote(proposal?._id)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      title="Download Quote PDF"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                        <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                      </svg>
                    </button>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenApprovalModal(proposal)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                        title="Close Proposal"
                      >
                        <Edit size={20} />
                      </button>

                      <button
                        onClick={() => handleOpenViewModal(proposal)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        title="View Details"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p>No open proposals found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
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
                p === 1 || p === totalPages || (p >= page - 3 && p <= page + 3)
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

      {/* CLOSE PROPOSAL MODAL */}
      <Modal open={showApprovalModal} onClose={handleCloseModal}>
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 1200,
            width: "95%",
            bgcolor: "white",
            borderRadius: "8px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Close Proposal
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProposal?.proposalNumber} • Rev{" "}
                {selectedProposal?.currentRevision || 0}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Customer Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.customername}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Code:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {selectedProposal?.customer?.customercodeid}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.city}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.telephone}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.email}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Postal Code:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.postalcode}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Equipment Items ({getTotalItems(selectedProposal?.items)}{" "}
                  items)
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Equipment
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Material Code
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Warranty
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        Years
                      </th>
                      <th className="p-3 text-right font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        RSH
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        NSH
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProposal?.items || []).map((item, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div
                            className="font-medium text-gray-900 max-w-xs"
                            title={item.equipment?.materialdescription}
                          >
                            {item.equipment?.materialdescription?.substring(
                              0,
                              50
                            )}
                            {item.equipment?.materialdescription?.length > 50 &&
                              "..."}
                          </div>
                          <div className="text-xs text-gray-500">
                            Dealer: {item.equipment?.dealer}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-700">
                          {item.equipment?.materialcode}
                        </td>
                        <td className="p-3">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {item.warrantyType}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {item.years}
                        </td>
                        <td className="p-3 text-right font-semibold text-green-600">
                          ₹{item.subtotal?.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-center">
                          {item.RSHApproval?.approved ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.NSHApproval?.approved ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Financial Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Subtotal</div>
                  <div className="font-semibold">
                    ₹{selectedProposal?.grandSubTotal?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    Discount ({selectedProposal?.discountPercentage}%)
                  </div>
                  <div className="font-semibold text-orange-600">
                    -₹
                    {selectedProposal?.discountAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    TDS ({selectedProposal?.tdsPercentage}%)
                  </div>
                  <div className="font-semibold text-red-600">
                    -₹{selectedProposal?.tdsAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    GST ({selectedProposal?.gstPercentage}%)
                  </div>
                  <div className="font-semibold text-blue-600">
                    +₹{selectedProposal?.gstAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Final Amount:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{selectedProposal?.finalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* CO Number Input & Action */}
            <div className="bg-gray-50 p-4 rounded-lg border sticky bottom-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CO Number for Entire Proposal{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter CO Number for this proposal"
                  value={coNumber}
                  onChange={(e) => setCoNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleCloseProposal}
                  disabled={!coNumber.trim()}
                  className={`px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    coNumber.trim()
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Close Proposal
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
      </Modal>

      {/* VIEW DETAILS MODAL */}
      <Modal open={showViewModal} onClose={handleCloseModal}>
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 1000,
            width: "95%",
            bgcolor: "white",
            borderRadius: "8px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Proposal Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProposal?.proposalNumber} • Rev{" "}
                {selectedProposal?.currentRevision || 0}
              </p>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* View Modal Content */}
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Proposal Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Proposal Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      selectedProposal?.status
                    )}`}
                  >
                    {selectedProposal?.status}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Items:</span>
                  <span className="ml-2 text-gray-900">
                    {getTotalItems(selectedProposal?.items)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Discount:</span>
                  <span className="ml-2 text-orange-600 font-semibold">
                    {selectedProposal?.discountPercentage?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Final Amount:
                  </span>
                  <span className="ml-2 text-green-600 font-semibold">
                    ₹{selectedProposal?.finalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.customername}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Code ID:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {selectedProposal?.customer?.customercodeid}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.city}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Postal:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.postalcode}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.telephone}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedProposal?.customer?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 text-gray-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Equipment Items ({getTotalItems(selectedProposal?.items)}{" "}
                  items)
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Equipment
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Material Code
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Warranty
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        Years
                      </th>
                      <th className="p-3 text-right font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        RSH
                      </th>
                      <th className="p-3 text-center font-medium text-gray-700">
                        NSH
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedProposal?.items || []).map((item, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div
                            className="font-medium text-gray-900"
                            title={item.equipment?.materialdescription}
                          >
                            {item.equipment?.materialdescription?.substring(
                              0,
                              40
                            )}
                            {item.equipment?.materialdescription?.length > 40 &&
                              "..."}
                          </div>
                          <div className="text-xs text-gray-500">
                            Dealer: {item.equipment?.dealer}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs text-gray-700">
                          {item.equipment?.materialcode}
                        </td>
                        <td className="p-3">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {item.warrantyType}
                          </span>
                        </td>
                        <td className="p-3 text-center font-semibold">
                          {item.years}
                        </td>
                        <td className="p-3 text-right font-semibold text-green-600">
                          ₹{item.subtotal?.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-center">
                          {item.RSHApproval?.approved ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {item.NSHApproval?.approved ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-red-600 text-lg">✗</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-gray-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Financial Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">Subtotal</div>
                  <div className="font-semibold">
                    ₹{selectedProposal?.grandSubTotal?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    Discount ({selectedProposal?.discountPercentage}%)
                  </div>
                  <div className="font-semibold text-orange-600">
                    -₹
                    {selectedProposal?.discountAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    TDS ({selectedProposal?.tdsPercentage}%)
                  </div>
                  <div className="font-semibold text-red-600">
                    -₹{selectedProposal?.tdsAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">
                    GST ({selectedProposal?.gstPercentage}%)
                  </div>
                  <div className="font-semibold text-blue-600">
                    +₹{selectedProposal?.gstAmount?.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    Final Amount:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{selectedProposal?.finalAmount?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Revision History */}
            {selectedProposal?.revisions &&
              selectedProposal.revisions.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Revision History
                  </h3>
                  <div className="space-y-2">
                    {selectedProposal.revisions.map((revision, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border text-sm"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            Revision {revision.revisionNumber}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              revision.status
                            )}`}
                          >
                            {revision.status}
                          </span>
                        </div>
                        <div className="text-gray-600">
                          <div>
                            Date:{" "}
                            {moment(revision.revisionDate).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </div>
                          {revision.changes?.remark && (
                            <div>Remark: {revision.changes.remark}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Current Remarks */}
            {selectedProposal?.remark && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Current Remarks
                </h3>
                <p className="text-gray-700 text-sm">
                  {selectedProposal.remark}
                </p>
              </div>
            )}
          </div>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default OpenProposal;
