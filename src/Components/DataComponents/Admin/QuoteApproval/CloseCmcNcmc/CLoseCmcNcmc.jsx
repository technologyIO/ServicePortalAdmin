import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Download, Eye, Filter, RefreshCw, View } from "lucide-react";
import LoadingSpinner from "../../../../../LoadingSpinner";

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

export default function CLoseCmcNcmc() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDownloadingGeo, setIsDownloadingGeo] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 50;
  const navigate = useNavigate();

  const fetchProposals = async (pg = page, query = searchQuery) => {
    setLoading(true);
    try {
      const params = { page: pg, limit };
      if (query && query.trim()) params.q = query.trim();

      const endpoint =
        query && query.trim()
          ? "/phone/proposal/search"
          : "/phone/proposal/paginated";

      const res = await api.get(endpoint, { params });

      const rawData = Array.isArray(res.data?.data) ? res.data.data : [];

      // ✅ Filter: only "Open" + discountPercentage > 5
      const filtered = rawData.filter(
        (item) =>
          item.Cmcncmcsostatus !== "Open" 
          // && typeof item.discountPercentage === "number" &&
          // item.discountPercentage > 5
      );

      setProposals(filtered);

      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalRecords(res.data.pagination.totalRecords || filtered.length);
        setPage(res.data.pagination.currentPage || pg);
      } else {
        setTotalPages(1);
        setTotalRecords(filtered.length);
        setPage(1);
      }
    } catch (error) {
      setProposals([]);
      setTotalPages(1);
      setTotalRecords(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals(page, searchQuery);
  }, [page]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value === "" || value.trim() === "") {
      setPage(1);
      fetchProposals(1, "");
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProposals(1, searchQuery);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setPage(1);
    fetchProposals(1, "");
  };

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

  if (!proposals.length)
    return (
      <div className="text-center py-16 text-lg font-semibold text-gray-400">
        {searchQuery
          ? "No proposals found matching your search."
          : "No proposals with discount > 5% found."}
      </div>
    );

  const totalProposalRows = proposals.length;

  return (
    <div>
      {/* Search Section */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <FormControl sx={{ flex: 1 }} size="sm">
                <Input
                  size="sm"
                  placeholder="Search Proposal, Customer, Product..."
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
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm text-gray-600">
            Showing {totalProposalRows} proposals
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

      {/* Table Container */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-max">
            <thead className="sticky top-0 z-10 bg-blue-700">
              <tr className="border-b">
                <th className="p-3 font-bold text-white text-left">
                  Proposal #
                </th>
                <th className="p-3 font-bold text-white text-left">
                  Created By
                </th>
                <th className="p-3 font-bold text-white text-left">
                  Serial Number
                </th>
                <th className="p-3 font-bold text-white text-left">Customer</th>
                <th className="p-3 font-bold text-white text-left">City</th>
                <th className="p-3 font-bold text-white text-left">Discount</th>
                <th className="p-3 font-bold text-white text-left">
                  Final Amount
                </th>
                <th className="p-3 font-bold text-white text-left">Status</th>
                <th className="p-3 font-bold text-white text-left">
                  Created At
                </th>
                <th className="p-3 font-bold text-white text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proposals.map((proposal, idx) => (
                <tr
                  key={`${proposal._id}-${idx}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="p-3 font-semibold text-blue-700">
                    {proposal.proposalNumber || "--"}
                  </td>
                  <td className="p-3">
                    <div className="max-w-28">
                      <div className="font-medium text-sm text-gray-800">
                        {proposal?.createdBy || "--"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {`${proposal?.createdByUser?.firstname || ""} ${
                          proposal?.createdByUser?.lastname || ""
                        }`.trim() || "Unknown User"}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-semibold text-blue-700">
                    {proposal?.serialNumber || "--"}
                  </td>
                  <td className="p-3">
                    <div className="font-medium capitalize">
                      {proposal.customer?.customername || "--"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {proposal.customer?.customercode || ""}
                    </div>
                  </td>
                  <td className="p-3">{proposal.customer?.city || "--"}</td>
                  <td className="p-3">{proposal.discountPercentage}%</td>
                  <td className="p-3">
                    ₹{proposal.finalAmount?.toFixed(2) || "--"}
                  </td>

                  <td className="flex items-center justify-center ">
                    <div className="px-3 py-2 rounded  bg-gray-300 mt-2 border">
                      {proposal.Cmcncmcsostatus}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      {moment(proposal.createdAt).format("MMM D, YYYY")}
                    </div>
                    <div className="text-gray-500">
                      {moment(proposal.createdAt).format("h:mm A")}
                    </div>
                  </td>
                  <td className="p-3">
                    <button
                      className="bg-blue-700 text-white p-1 rounded font-bold hover:bg-blue-800 transition-colors text-sm"
                      onClick={() =>
                        navigate(
                          `/close/cmcncmc/customer/${proposal.customer?.customercodeid}`
                        )
                      }
                    >
                      <Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
