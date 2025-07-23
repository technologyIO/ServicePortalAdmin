import React, { useEffect, useState } from "react";
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

// Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function OpenOnCallOrder() {
  const [onCalls, setOnCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOnCall, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [coNumber, setCoNumber] = useState("");
  const limit = 10;
  const navigate = useNavigate();
  // Fetch open OnCalls
  const fetchOnCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/phone/oncall/pagecall?page=${page}&limit=${limit}`
      );
      const rows = res.data.data || res.data;
      const pages = res.data.totalPages || Math.ceil(rows.length / limit);

      // exclude completed/issued
      const open = rows.filter(
        (r) =>
          r.status.toLowerCase() !== "issued" &&
          r.status.toLowerCase() !== "completed"
      );
      setOnCalls(open);
      setTotalPages(pages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch OnCall orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnCalls();
  }, [page]);

  // Search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return fetchOnCalls();
    }
    setLoading(true);
    try {
      const res = await api.get(`/phone/oncall/search?q=${searchQuery}`);
      const rows = res.data.data || res.data;
      setOnCalls(rows);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = (oc) => {
    setSelected(oc);
    setCoNumber("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Complete order
  const handleComplete = async () => {
    if (!coNumber.trim()) {
      return toast.error("Enter valid CO Number");
    }
    try {
      await api.put(`/phone/oncall/${selectedOnCall._id}/update-conumber`, {
        CoNumber: coNumber,
      });
      toast.success("Order completed");
      closeModal();
      fetchOnCalls();
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete order");
    }
  };
  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  // Status styling
  const getStatusColor = (status) => {
    const colorMap = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      issued: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return colorMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Pagination handlers
  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="CustomLoader" />
      </div>
    );
  }
  const handleDownloadQuote = (proposalId) => {
    navigate(`/quote-template/${proposalId}`);
  };
  return (
    <>
      {/* TOP-BAR */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex gap-3 w-full md:w-auto">
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search OnCall / Customer / Device / Complaint..."
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
              <th className="p-3 text-left font-medium">OnCall No.</th>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Device</th>
              <th className="p-3 text-left font-medium">Complaint ID</th>
              <th className="p-3 text-left font-medium">Status</th>
              <th className="p-3 text-left font-medium">Discount %</th>
              <th className="p-3 text-left font-medium">Final Amount</th>
              <th className="p-3 text-left font-medium">Created</th>
              <th className="p-3 text-left font-medium">CNote PDF</th>
              <th className="p-3 text-left font-medium">Quote PDF</th>
              <th className="p-3 text-left font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {onCalls.map((oc, idx) => (
              <tr key={oc._id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>

                <td className="p-3 font-bold text-blue-600">
                  {oc.onCallNumber}
                </td>

                <td className="p-3">
                  <div>
                    <div className="font-medium capitalize">
                      {oc.customer?.customername}
                    </div>
                    <div className="text-xs text-gray-500">
                      {oc.customer?.city}
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <div className="max-w-32">
                    <div
                      className="font-medium text-xs truncate"
                      title={oc.complaint?.materialdescription}
                    >
                      {oc.complaint?.materialdescription}
                    </div>
                    <div className="text-xs text-gray-500">
                      S/N: {oc.complaint?.serialnumber}
                    </div>
                  </div>
                </td>

                <td className="p-3 font-mono text-xs">
                  {oc.complaint?.notification_complaintid}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      oc.status
                    )}`}
                  >
                    {oc.status}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                    {oc.discountPercentage?.toFixed(1)}%
                  </span>
                </td>

                <td className="p-3 font-semibold text-green-600">
                  ₹{oc.finalAmount?.toLocaleString("en-IN") || "0"}
                </td>

                <td className="p-3">
                  <div className="text-xs">
                    <div>{moment(oc.createdAt).format("MMM D, YYYY")}</div>
                    <div className="text-gray-500">
                      {moment(oc.createdAt).format("h:mm A")}
                    </div>
                  </div>
                </td>

                <td className="p-3">
                  <button
                    onClick={() =>
                      window.open(
                        `${process.env.REACT_APP_BASE_URL}/phone/oncall-cnote/${oc.onCallNumber}/pdf`,
                        "_blank"
                      )
                    }
                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                    title="Download CNote PDF"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      className="bi bi-download"
                      viewBox="0 0 16 16"
                    >
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                    </svg>
                  </button>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => handleDownloadQuote(oc?._id)}
                    className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                    title="Download Quote PDF"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      className="bi bi-file-earmark-text"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                    </svg>
                  </button>
                </td>

                <td className="p-3">
                  <button
                    onClick={() => openModal(oc)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                    title="Complete OnCall Order"
                  >
                    <Edit size={20} />
                  </button>
                </td>
              </tr>
            ))}

            {onCalls.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center py-8 text-gray-500">
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
                    <p>No Open OnCall Orders found</p>
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

      {/* COMPLETE ORDER MODAL */}
      <Modal open={showModal} onClose={closeModal}>
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: 900,
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
                Complete OnCall Order
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                OnCall #{selectedOnCall?.onCallNumber}
              </p>
            </div>
            <button
              onClick={closeModal}
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
            {/* Customer Info Card */}
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
                    {selectedOnCall?.customer.customername}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedOnCall?.customer.city}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedOnCall?.customer.telephone}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedOnCall?.customer.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Spare Parts Table */}
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Spare Parts (
                  {
                    (selectedOnCall?.productGroups || []).flatMap(
                      (g) => g.spares
                    ).length
                  }{" "}
                  items)
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Description
                      </th>
                      <th className="p-3 text-left font-medium text-gray-700">
                        Part Number
                      </th>
                      <th className="p-3 text-right font-medium text-gray-700">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOnCall?.productGroups || [])
                      .flatMap((g) => g.spares)
                      .map((sp, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-gray-900">
                            {sp.Description}
                          </td>
                          <td className="p-3 font-mono text-gray-700">
                            {sp.PartNumber}
                          </td>
                          <td className="p-3 text-right font-semibold text-green-600">
                            ₹{sp.Rate?.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CO Number Input & Action */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CO Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter CO Number to complete order"
                  value={coNumber}
                  onChange={(e) => setCoNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                >
                  Complete Order
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
      </Modal>
    </>
  );
}

export default OpenOnCallOrder;
