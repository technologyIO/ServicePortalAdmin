import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import OnCallViewModal from "./OnCallViewModal";
import OnCallApprovalModal from "./OnCallApprovalModal";
// import ApprovalModal from "./ApprovalModal";
// import ViewModal from "./ViewModal";

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
  const [oncallList, setOncallList] = useState([]);
  const [filteredOncallList, setFilteredOncallList] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [selectedOncall, setSelectedOncall] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);

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

  const fetchOnCalls = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/phone/oncall/pagecall?page=${page}&limit=${limit}`
      );
      // setOncallList to full array (will filter later)
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setOncallList(data);
      setFilteredOncallList(data); // We filter for table later
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch oncalls",
        "error"
      );
    }
  };
  const filteredDiscountOnCalls = oncallList.filter(
    (item) =>
      typeof item.discountPercentage === "number" &&
      !Number.isNaN(item.discountPercentage) &&
      item.discountPercentage > 5
  );

  // Processing for showing flattened list with revisions
  const processOnCalls = (oncalls) => {
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
// After fetching all data:
useEffect(() => {
  // get only >5% discount OnCalls, recalculate page
  const filtered = oncallList.filter(
    (item) =>
      typeof item.discountPercentage === "number" &&
      !Number.isNaN(item.discountPercentage) &&
      item.discountPercentage > 5
  );
  setFilteredOncallList(filtered);
  setTotalPages(Math.ceil(filtered.length / limit));
  // Set what rows to show on this page
  setDisplayedRows(processOnCalls(filtered.slice((page - 1) * limit, page * limit)));
}, [oncallList, page]);

  useEffect(() => {
    fetchOnCalls();
    // eslint-disable-next-line
  }, [page]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // default: filter for discount > 5
      const filtered = oncallList.filter(
        (item) =>
          typeof item.discountPercentage === "number" &&
          !Number.isNaN(item.discountPercentage) &&
          item.discountPercentage > 5
      );
      setFilteredOncallList(filtered);
      setTotalPages(Math.ceil(filtered.length / limit));
      setDisplayedRows(
        processOnCalls(filtered.slice((page - 1) * limit, page * limit))
      );
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    // Filter by search and by discount > 5
    const searchFiltered = oncallList.filter(
      (item) =>
        (item.onCallNumber?.toString().toLowerCase().includes(query) ||
          item.customer?.customername
            ?.toString()
            .toLowerCase()
            .includes(query) ||
          item.status?.toLowerCase().includes(query)) &&
        typeof item.discountPercentage === "number" &&
        !Number.isNaN(item.discountPercentage) &&
        item.discountPercentage > 5
    );
    setFilteredOncallList(searchFiltered);
    setTotalPages(Math.ceil(searchFiltered.length / limit));
    setDisplayedRows(
      processOnCalls(searchFiltered.slice((page - 1) * limit, page * limit))
    );
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
    // Flatten latest revision data for use in modal
    const revisionData = {
      ...oncall,
      ...oncall.revisionData?.changes,
      status: oncall.revisionData?.status || oncall.status,
      // You may pass more if required
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="CustomLoader"></span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3 justify-center">
          <FormControl sx={{ flex: 1 }} size="sm">
            <Input
              size="sm"
              placeholder="Search"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </FormControl>
          <button
            onClick={handleSearch}
            type="button"
            className="text-white w-full px-5 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center"
          >
            Search
          </button>
        </div>
        <div className="flex gap-3 ">
          <button
            type="button"
            className="text-white w-full px-5 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <table className="w-full border min-w-max caption-bottom text-sm">
          <thead className="[&>tr]:border-b bg-blue-700 ">
            <tr className="border-b transition-colors text-white">
              <th scope="col" className="p-4"></th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                OnCall #
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Revision
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Customer
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Discount
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Final Amount
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Created Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
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
              .map((oncall) => (
                <tr
                  key={`${oncall._id}-${
                    oncall.revisionData?.revisionNumber || 0
                  }`}
                  className="border-b"
                >
                  <td className="p-4">
                    <input
                      id={`checkbox-${oncall._id}`}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />
                  </td>
                  <td className="p-4 font-bold text-md capitalize">
                    {oncall.onCallNumber}
                  </td>
                  <td className="p-4 text-md">
                    {oncall.revisionData?.revisionNumber > 0 ? (
                      <>
                        Rev. {oncall.revisionData.revisionNumber}
                        {oncall.isCurrentRevision && (
                          <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </>
                    ) : (
                      "Original"
                    )}
                  </td>
                  <td className="p-4 text-md capitalize">
                    {oncall.customer?.customername}
                  </td>
                  <td className="p-4 text-md">{oncall.discountPercentage}%</td>
                  <td className="p-4 text-md">
                    ₹{oncall.finalAmount?.toFixed(2)}
                  </td>
                  <td className="p-4 text-md capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
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
                  <td className="p-4">
                    {moment(
                      oncall.revisionData?.revisionDate || oncall.createdAt
                    ).format("MMM D, YYYY")}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenViewModal(oncall)}
                        className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
                      >
                        View
                      </button>
                      {oncall.isCurrentRevision && (
                        <button
                          onClick={() => handleOpenApprovalModal(oncall)}
                          className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between py-3">
        <button
          className={`border rounded p-1 ${
            page === 1 ? "cursor-not-allowed" : "cursor-pointer"
          } w-[100px] hover:bg-gray-300 px-2 bg-gray-100 font-semibold`}
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || (p >= page - 3 && p <= page + 3)
            )
            .map((p, i, arr) => (
              <React.Fragment key={p}>
                {i > 0 && p !== arr[i - 1] + 1 && <span>...</span>}
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
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Place your ApprovalModal and ViewModal as required */}

      <OnCallApprovalModal
        open={showApprovalModal}
        onClose={handleCloseModal}
        proposal={selectedOncall}
        setProposal={setSelectedOncall}
        userId={userId}
        fetchProposals={fetchOnCalls}
      />

      <OnCallViewModal
        open={showViewModal}
        onClose={handleCloseModal}
        proposal={selectedOncall}
        revision={selectedRevision}
      />
    </>
  );
}

export default OnCallApproval;
