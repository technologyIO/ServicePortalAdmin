import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";
import ApprovalModal from "./ApprovalModal";
import ViewModal from "./ViewModal";

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
  const [proposals, setProposals] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [displayProposals, setDisplayProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
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

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/phone/proposal?page=${page}&limit=${limit}`);
      const filteredProposals = res.data.filter(
        (proposal) => proposal.discountPercentage > 5
      );
      setProposals(filteredProposals);
      setFilteredData(filteredProposals);
      setDisplayProposals(processProposals(filteredProposals));
      setTotalPages(Math.ceil(filteredProposals.length / limit));
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

  const processProposals = (proposals) => {
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
            items: proposal.items.map((item) => ({
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

  useEffect(() => {
    fetchProposals();
  }, [page]);

  const handleSearch = () => {
    if (!searchQuery) {
      setFilteredData(proposals);
      return;
    }

    const filtered = proposals.filter((item) => {
      return (
        item.cnoteNumber?.toString().includes(searchQuery) ||
        item.proposalNumber?.toString().includes(searchQuery) ||
        item.customer.customername?.toString().includes(searchQuery) ||
        item.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    setFilteredData(filtered);
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
      items: proposal.items.map((item) => {
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
            />
          </FormControl>
          <button
            onClick={handleSearch}
            type="button"
            className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 mb-2"
          >
            Search
          </button>
        </div>

        <div className="flex gap-3 ">
          <button
            type="button"
            className="text-white w-full col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center mb-2"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <table className="w-full border min-w-max caption-bottom text-sm">
          <thead className="[&amp;_tr]:border-b bg-blue-700 ">
            <tr className="border-b transition-colors text-white hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                  />
                  <label htmlFor="checkbox-all-search" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Proposal #
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Revision
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Customer
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Discount
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Final Amount
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Created Date
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="[&amp;_tr:last-child]:border-0">
            {filteredData
              .filter((proposal) => proposal.discountPercentage > 5)
              .sort((a, b) => {
                const dateA = new Date(
                  a.revisionData?.revisionDate || a.createdAt
                );
                const dateB = new Date(
                  b.revisionData?.revisionDate || b.createdAt
                );
                return dateB - dateA;
              })
              .map((proposal) => (
                <tr
                  key={`${proposal._id}-${
                    proposal.revisionData?.revisionNumber || 0
                  }`}
                  className="border-b transition-colors data-[state=selected]:bg-muted"
                >
                  <th scope="col" className="p-4">
                    <div className="flex items-center">
                      <input
                        id={`checkbox-${proposal._id}`}
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`checkbox-${proposal._id}`}
                        className="sr-only"
                      >
                        checkbox
                      </label>
                    </div>
                  </th>
                  <td className="p-4 font-bold text-md capitalize align-middle whitespace-nowrap">
                    {proposal.proposalNumber}
                  </td>
                  <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                    {proposal.revisionData?.revisionNumber > 0 ? (
                      <>
                        Rev. {proposal.revisionData.revisionNumber}
                        {proposal.isCurrentRevision && (
                          <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            Current
                          </span>
                        )}
                      </>
                    ) : (
                      "Original"
                    )}
                  </td>
                  <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                    {proposal.customer?.customername}
                  </td>
                  <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                    {proposal.discountPercentage}%
                  </td>
                  <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                    ₹{proposal.finalAmount?.toFixed(2)}
                  </td>
                  <td className="p-4 text-md capitalize align-middle whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        proposal.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : proposal.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap">
                    {moment(
                      proposal.revisionData?.revisionDate || proposal.createdAt
                    ).format("MMM D, YYYY")}
                  </td>
                  <td className="p-4 align-middle whitespace-nowrap">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleOpenViewModal(proposal)}
                        className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500"
                      >
                        View
                      </button>
                      {proposal.isCurrentRevision && (
                        <button
                          onClick={() => handleOpenApprovalModal(proposal)}
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
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter((p) => {
              return (
                p === 1 || p === totalPages || (p >= page - 3 && p <= page + 3)
              );
            })
            .map((p, i, array) => (
              <React.Fragment key={p}>
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
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <ApprovalModal
        open={showApprovalModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        setProposal={setSelectedProposal}
        userId={userId}
        fetchProposals={fetchProposals}
      />

      <ViewModal
        open={showViewModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        revision={selectedRevision}
      />
    </>
  );
}

export default QuoteApproval;
