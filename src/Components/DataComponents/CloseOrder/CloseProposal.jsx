import React, { useEffect, useState, useCallback } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Modal, ModalDialog, Typography, Box, Divider } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function CloseProposal() {
  /* ───────────────────────── STATES ───────────────────────── */
  const [showViewModal, setShowViewModal] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);

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

  /* ───────────────────────── API CALLS ───────────────────────── */
  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/phone/proposal/all?page=${page}&limit=${limit}`
      );

      const data = res.data.records || [];
      const pagesCount =
        res.data.totalPages || Math.ceil((data.length || 0) / limit);

      // Filter only completed proposals
      const filteredProposals = (data || []).filter(
        (proposal) =>
          // proposal.status?.toLowerCase() === "completed" ||
          proposal.Cmcncmcsostatus !== "Open"
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
        row.CoNumber?.toLowerCase().includes(query) ||
        row.status?.toLowerCase().includes(query)
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
  const handleOpenViewModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowViewModal(false);
    setSelectedProposal(null);
  };

  const getStatusColor = (status) => {
    const colorMap = {
      closed_won: "bg-green-100 text-green-800",
      open: "bg-blue-100 text-blue-800",
      completed: "bg-purple-100 text-purple-800", // add more if needed
      draft: "bg-yellow-100 text-yellow-800",
    };
    return colorMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
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
              placeholder="Search Proposal / Customer / CO Number..."
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

        <button className="px-5 py-1.5 bg-blue-700 text-white rounded text-sm font-medium">
          Filter
        </button>
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
              <th className="p-3 text-left font-medium">CO Number</th>
              <th className="p-3 text-left font-medium">Discount %</th>
              <th className="p-3 text-left font-medium">Final Amount</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((proposal, idx) => (
              <tr key={proposal._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>

                <td className="p-3 font-bold text-blue-600">
                  {proposal?.proposalNumber}
                </td>
                <td className="p-3 font-bold text-gray-600">
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

                <td className="p-3">
                  <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                    {proposal.CoNumber || "—"}
                  </code>
                </td>

                <td className="p-3 text-center">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                    {proposal.discountPercentage?.toFixed(1)}%
                  </span>
                </td>

                <td className="p-3 font-semibold text-green-600">
                  ₹{proposal.finalAmount?.toLocaleString("en-IN") || "0"}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      proposal.Cmcncmcsostatus
                    )}`}
                  >
                    {proposal.Cmcncmcsostatus}
                  </span>
                </td>

                <td className="p-3">
                  <div className="text-xs">
                    <div>
                      {moment(proposal.createdAt).format("MMM D, YYYY")}
                    </div>
                    <div className="text-gray-500">
                      {moment(proposal.createdAt).format("h:mm A")}
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenViewModal(proposal)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="View Proposal Details"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-eye"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                    </button>

                    {/* <button
                      onClick={() =>
                        window.open(
                          `${process.env.REACT_APP_BASE_URL}/phone/proposal/${proposal.proposalNumber}/pdf`,
                          "_blank"
                        )
                      }
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      title="Download PDF"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-download"
                        viewBox="0 0 16 16"
                      >
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                      </svg>
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
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
                    <p>No completed proposals found</p>
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

      {/* VIEW DETAILS MODAL */}
      <Modal open={showViewModal} onClose={handleCloseModal}>
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 800,
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
                Completed Proposal
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Proposal #{selectedProposal?.proposalNumber}
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
          <div className="p-4 space-y-4">
            {/* Proposal Summary */}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Proposal Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
                  <span className="font-medium text-gray-700">CO Number:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {selectedProposal?.CoNumber || "—"}
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
                <div>
                  <span className="font-medium text-gray-700">Discount:</span>
                  <span className="ml-2 text-orange-600 font-semibold">
                    {selectedProposal?.discountPercentage?.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {moment(selectedProposal?.createdAt).format("MMM D, YYYY")}
                  </span>
                </div>
              </div>
            </div>

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
              </div>
            </div>

            {/* Additional Info if needed */}
            {selectedProposal?.description && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 text-sm">
                  {selectedProposal.description}
                </p>
              </div>
            )}
          </div>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default CloseProposal;
