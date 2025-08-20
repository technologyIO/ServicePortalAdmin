import React, { useEffect, useState, useCallback } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Download, Filter, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function CNoteDelete() {
  // ───────────────────────── STATES ─────────────────────────
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  // ──────────────────────── API CALLS ────────────────────────
  const getAllData = useCallback(async (pg = page, query = searchQuery) => {
    setLoader(true);
    try {
      const params = { page: pg, limit };
      if (query && query.trim()) params.q = query.trim();

      // Choose API according to search
      const apiUrl = query && query.trim() ? "/phone/cnote/search" : "/phone/cnote/paginated";
      const res = await api.get(apiUrl, { params });
      
      setLoader(false);
      const rows = res.data.data || [];
      setData(rows);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalRecords(res.data.pagination?.totalRecords || rows.length);
      setPage(res.data.pagination?.currentPage || pg);
    } catch (err) {
      console.error(err);
      setLoader(false);
      Swal.fire("Error!", "Failed to fetch data.", "error");
    }
  }, [page, searchQuery, limit]);

  useEffect(() => {
    getAllData(page, searchQuery);
    // eslint-disable-next-line
  }, [page]);

  // ─────────────── DELETE ───────────────
  const handleDelete = (cnoteNumber) => {
    Swal.fire({
      title: "Delete Permanently?",
      text: `CNote ${cnoteNumber} will be removed!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/phone/cnote/${cnoteNumber}`)
          .then(() => {
            Swal.fire("Deleted!", "CNote has been deleted.", "success");
            getAllData(page, searchQuery);
          })
          .catch((error) => {
            console.log(error);
            Swal.fire("Error!", "Failed to delete CNote.", "error");
          });
      }
    });
  };

  // ─────────────── SEARCH ───────────────
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Refresh data when search is cleared
    if (value === "" || value.trim() === "") {
      setPage(1);
      getAllData(1, "");
    }
  };

  const handleSearch = () => {
    setPage(1);
    getAllData(1, searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ─────────────── HELPERS ───────────────
  const getRevisionStatus = (row) => {
    if (!row?.revisions || row?.revisions.length === 0) {
      return {
        status: row?.status || "draft",
        color: "bg-gray-100 text-gray-800",
      };
    }
    const currentRev = row?.revisions.find(
      (r) => r.revisionNumber === row?.currentRevision
    );
    const status = currentRev?.status || row?.status || "draft";
    const colorMap = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      issued: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return { status, color: colorMap[status] || "bg-gray-100 text-gray-800" };
  };

  const getTotalItems = (items) => items?.length || 0;

  const getApprovalStatus = (row) => {
    const rsh = row?.RSHApproval?.approved;
    const nsh = row?.NSHApproval?.approved;
    if (rsh && nsh) return { text: "Both Approved", color: "text-green-600" };
    if (rsh) return { text: "RSH Only", color: "text-orange-600" };
    if (nsh) return { text: "NSH Only", color: "text-orange-600" };
    return { text: "Pending", color: "text-red-600" };
  };

  // ─────────────── PAGINATION ───────────────
  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);
  const handlePageClick = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== page) {
      setPage(pageNum);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setPage(1);
    getAllData(1, "");
  };

  // ─────────────── RENDER ───────────────
  return loader ? (
    <div className="flex items-center justify-center h-[60vh]">
      <span className="CustomLoader" />
    </div>
  ) : (
    <>
      {/* TOP-BAR */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search CNote / Proposal / Customer / Equipment..."
                  startDecorator={<SearchIcon />}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
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
          {/* Primary Action Buttons */}
          <div className="flex gap-3">
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
        {/* Secondary Actions Row */}
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white shadow-lg hover:bg-blue-50 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </div>

      {/* TABLE with Fixed Height and Scrolling */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse text-sm min-w-max">
              <thead className="sticky top-0 z-10 bg-blue-700">
                <tr className="border-b">
                  <th className="p-3 text-left">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">CNote No.</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Serial No</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Proposal No.</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Customer</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Items</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Current Rev</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Status</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Approvals</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Final Amount</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Created</th>
                  <th className="p-3 text-left font-medium text-white whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, index) => {
                  const revisionStatus = getRevisionStatus(row);
                  const approvalStatus = getApprovalStatus(row);
                  return (
                    <tr
                      key={row?._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        {row?.cnoteNumber}
                      </td>
                      <td className="p-3 font-bold text-gray-600">
                        {row?.serialNumber}
                      </td>
                      <td className="p-3 font-semibold">{row?.proposalNumber}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium capitalize">
                            {row?.customer?.customername}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row?.customer?.city}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {getTotalItems(row?.items)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                          Rev {row?.currentRevision || 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${revisionStatus.color}`}
                        >
                          {revisionStatus.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-medium ${approvalStatus.color}`}
                        >
                          {approvalStatus.text}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-green-600">
                        ₹{row?.finalAmount?.toLocaleString("en-IN") || "0"}
                      </td>
                      <td className="p-3">
                        <div className="text-xs">
                          <div>{moment(row?.createdAt).format("MMM D, YYYY")}</div>
                          <div className="text-gray-500">
                            {moment(row?.createdAt).format("h:mm A")}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(row?.cnoteNumber)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            title="Delete CNote"
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
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500">
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
                        <p>No CNotes found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          Showing {Math.min((page - 1) * limit + 1, totalRecords)} to{" "}
          {Math.min(page * limit, totalRecords)} of {totalRecords} results
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <button
            onClick={handlePrev}
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
            onClick={handleNext}
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
    </>
  );
}

export default CNoteDelete;
