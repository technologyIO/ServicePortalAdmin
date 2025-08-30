import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft, Eye, Edit, Download } from "lucide-react";
import ApprovalModal from "../ApprovalModal";
import ViewModal from "../ViewModal";

const TABS = [
  { id: 1, label: "Opportunity" },
  { id: 2, label: "Quote" },
  { id: 3, label: "Contract Note" },
];

const format = (v) =>
  typeof v === "number"
    ? `₹${Number.parseFloat(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`
    : v;

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function CloseCMCNCMCDetailPage() {
  const [tab, setTab] = useState(TABS[0].id);
  const [proposalList, setProposalList] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [userId, setUserId] = useState(null);
  const [totalProposals, setTotalProposals] = useState(0);
  const [pagination, setPagination] = useState(null);
  const { customerId } = useParams(); // Get customerId from URL
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData?.details?.id) setUserId(parsedData.details.id);
      } catch {}
    }
  }, []);

  useEffect(() => {
    async function fetchCustomerProposals() {
      if (!customerId) {
        setError("No customer ID provided");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching data for customer ID:", customerId);

        // Use the new customer-specific API endpoint
        const res = await api.get(`/phone/proposal/customer/${customerId}`, {
          params: {
            limit: 1000,
            minDiscount: 5, // Only get proposals with discount > 5%
            includeCompleted: false, // Exclude completed proposals
          },
        });

        console.log("API Response:", res.data);

        // Check if API response is successful
        if (res.data.success) {
          const proposals = res.data.data || [];
          const customerInfo = res.data.customer;
          const paginationInfo = res.data.pagination;

          console.log("Total Proposals fetched:", proposals.length);

          setProposalList(proposals);
          setCustomer(customerInfo);
          setTotalProposals(paginationInfo?.totalRecords || proposals.length);
          setPagination(paginationInfo);

          if (proposals.length === 0 && !customerInfo) {
            setError("Customer not found");
          }
        } else {
          // Handle API error response
          setError(res.data.message || "Failed to fetch proposals");
        }
      } catch (e) {
        console.error("Error fetching customer proposals:", e);

        // Handle different types of errors
        if (e.response?.status === 404) {
          setError("Customer not found or no proposals available");
        } else if (e.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            "Error fetching data: " + (e.response?.data?.message || e.message)
          );
        }
      }
      setLoading(false);
    }
    fetchCustomerProposals();
  }, [customerId]);

  const handleViewOpportunity = (proposal) => {
    let rev = null;
    if (Array.isArray(proposal.revisions) && proposal.revisions.length > 0) {
      rev =
        proposal.revisions.find(
          (r) => r.revisionNumber === proposal.currentRevision
        ) || proposal.revisions[proposal.revisions.length - 1];
    }
    const revisionData = rev
      ? {
          ...proposal,
          ...rev.changes,
          status: rev.status || proposal.status,
        }
      : proposal;
    setSelectedProposal(revisionData);
    setSelectedRevision(rev);
    setShowViewModal(true);
  };

  const handleViewRevision = (proposal, revision) => {
    const revisionData = {
      ...proposal,
      ...revision.changes,
      status: revision.status || proposal.status,
    };
    setSelectedProposal(revisionData);
    setSelectedRevision(revision);
    setShowViewModal(true);
  };

  const handleEditRevision = (proposal, revision) => {
    const proposalWithRevision = {
      ...proposal,
      ...revision.changes,
      revisionData: revision,
      isCurrentRevision: revision.revisionNumber === proposal.currentRevision,
      status: revision.status,
    };
    setSelectedProposal(proposalWithRevision);
    setShowApprovalModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
    setSelectedRevision(null);
  };

  const fetchProposals = async () => {
    // Refresh the data by reloading the component
    window.location.reload();
  };

  const handleDownloadQuote = (proposalId) => {
    navigate(`/quote-template/${proposalId}`);
  };

  const handleDownloadContractNote = (proposal) => {
    alert(`Download contract note for ${proposal.proposalNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-2xl text-blue-700 font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="CustomLoader"></div>
          <div>Loading customer proposals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-2xl text-red-700 font-semibold mb-4">{error}</div>
        <div className="text-gray-600 mb-6">Customer ID: {customerId}</div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold px-4 py-2 border border-blue-700 rounded"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-2xl text-red-700 font-semibold mb-4">
          Customer not found
        </div>
        <div className="text-gray-600 mb-6">Customer ID: {customerId}</div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold px-4 py-2 border border-blue-700 rounded"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Back Button and Customer Info */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back to List
        </button>
      </div>

      {/* Show message if no proposals with discount > 5% */}
      {proposalList.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <strong>Note:</strong> This customer has no proposals with discount
          greater than 5%.
        </div>
      )}

      {/* Tab Navigation */}
      <div className="shadow-xl rounded-lg mb-4">
        <div className="flex w-fit bg-gray-200 rounded-lg overflow-hidden">
          {TABS.map((tabItem, i) => (
            <div key={tabItem.id} className="relative">
              <button
                className={[
                  "px-8 py-3 text-base font-semibold transition-all relative z-10",
                  tab === tabItem.id
                    ? "bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-200",
                ].join(" ")}
                onClick={() => setTab(tabItem.id)}
              >
                {tabItem.label}
              </button>
              {/* Arrow design */}
              {i < TABS.length - 1 && (
                <>
                  <div
                    className={[
                      "absolute top-0 right-0 w-0 h-0 z-20",
                      tab === tabItem.id
                        ? "border-l-[20px] border-l-blue-700"
                        : "border-l-[20px] border-l-gray-200",
                      "border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent",
                    ].join(" ")}
                    style={{ transform: "translateX(100%)" }}
                  />
                  <div
                    className="absolute top-0 right-0 w-0 h-0 z-10"
                    style={{
                      borderLeft: "22px solid #e5e7eb",
                      borderTop: "25px solid transparent",
                      borderBottom: "25px solid transparent",
                      transform: "translateX(100%)",
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-0 overflow-x-auto">
        {/* OPPORTUNITY TAB */}
        {tab === 1 && (
          <div>
            {proposalList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No proposals found with discount greater than 5%
              </div>
            ) : (
              <table className="w-full border mb-4 min-w-[900px]">
                <thead>
                  <tr className="bg-blue-700 text-white text-lg">
                    <th className="p-3 font-bold">S.No</th>
                    <th className="p-3 font-bold">Proposal #</th>
                    <th className="p-3 font-bold">Customer</th>
                    <th className="p-3 font-bold">Discount</th>
                    <th className="p-3 font-bold">Final Amount</th>
                    <th className="p-3 font-bold">Created At</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalList.map((proposal, idx) => (
                    <tr
                      key={proposal._id}
                      className="bg-white border-b text-center hover:bg-gray-50"
                    >
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold">
                        {proposal.proposalNumber}
                      </td>
                      <td className="p-3 font-bold">
                        {proposal.customer?.customername}
                      </td>
                      <td className="p-3">{proposal.discountPercentage}%</td>
                      <td className="p-3">{format(proposal.finalAmount)}</td>
                      <td className="p-3">
                        {moment(proposal.createdAt).format("DD/MM/YYYY")}
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            proposal.status === "approved"
                              ? "bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-xs"
                              : proposal.status === "pending"
                              ? "bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold text-xs"
                              : proposal.status === "rejected"
                              ? "bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-xs"
                              : "bg-gray-200 px-3 py-1 rounded font-bold text-xs"
                          }
                        >
                          {proposal.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          className="bg-blue-700 rounded-lg p-2 text-white font-bold text-lg hover:bg-blue-800"
                          onClick={() => handleViewOpportunity(proposal)}
                        >
                          <Eye size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* QUOTE TAB */}
        {tab === 2 && (
          <div className="p-6">
            {proposalList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No proposals found with discount greater than 5%
              </div>
            ) : (
              proposalList.map((proposal, callIdx) => (
                <div className="mb-10 border-b pb-5" key={proposal._id}>
                  {/* Proposal Header Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-bold text-blue-700">
                      Proposal: {proposal.proposalNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Customer: {proposal.customer?.customername} | Final
                      Amount: {format(proposal.finalAmount)} | Discount:{" "}
                      {proposal.discountPercentage}%
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border mb-2 min-w-[1100px]">
                      <thead>
                        <tr className="bg-blue-700 text-white text-sm">
                          <th className="p-3 font-bold">S.No</th>
                          <th className="p-3 font-bold">Proposal Number</th>
                          <th className="p-3 font-bold">Customer</th>
                          <th className="p-3 font-bold">Discount</th>
                          <th className="p-3 font-bold">Net Amount</th>
                          <th className="p-3 font-bold">Status</th>
                          <th className="p-3 font-bold">Revision</th>
                          <th className="p-3 font-bold">Date</th>
                          <th className="p-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(proposal.revisions) &&
                        proposal.revisions.length ? (
                          proposal.revisions
                            .sort((a, b) => b.revisionNumber - a.revisionNumber)
                            .map((rev, idx) => (
                              <tr
                                key={rev.revisionNumber}
                                className="bg-white border-b hover:bg-gray-50"
                              >
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-mono text-sm font-bold">
                                  {proposal.proposalNumber}
                                </td>
                                <td className="p-3 text-sm">
                                  {proposal.customer?.customername}
                                </td>
                                <td className="p-3 font-bold">
                                  {rev.changes?.discountPercentage ||
                                    proposal.discountPercentage}
                                  %
                                </td>
                                <td className="p-3 font-bold">
                                  {format(
                                    rev.changes?.finalAmount ||
                                      proposal.finalAmount
                                  )}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={
                                      rev.status === "approved"
                                        ? "bg-green-100 text-green-800 px-2 py-1 rounded font-bold text-xs"
                                        : rev.status === "pending"
                                        ? "bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold text-xs"
                                        : rev.status === "rejected"
                                        ? "bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs"
                                        : "bg-gray-200 px-2 py-1 rounded font-bold text-xs"
                                    }
                                  >
                                    {rev.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-bold">
                                      Rev. {rev.revisionNumber}
                                    </span>
                                    {rev.revisionNumber ===
                                      proposal.currentRevision && (
                                      <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 font-bold">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-sm">
                                  {moment(rev.revisionDate).format("DD/MM/YY")}
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-1 flex-wrap">
                                    <button
                                      className="bg-blue-700 rounded p-1 text-white hover:bg-blue-800"
                                      onClick={() =>
                                        handleViewRevision(proposal, rev)
                                      }
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                    {rev.revisionNumber ===
                                      proposal.currentRevision && (
                                      <button
                                        className="bg-gray-500 rounded p-1 text-white hover:bg-gray-600"
                                        onClick={() =>
                                          handleDownloadQuote(proposal._id)
                                        }
                                        title="Download Quote"
                                      >
                                        <Download size={16} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td
                              className="p-3 text-gray-400 text-center"
                              colSpan={9}
                            >
                              No revisions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CONTRACT NOTE TAB */}
        {tab === 3 && (
          <div>
            {proposalList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No proposals found with discount greater than 5%
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border mb-6 text-lg min-w-[1000px]">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="p-3 font-bold">Proposal #</th>
                      <th className="p-3 font-bold">Contract ID</th>
                      <th className="p-3 font-bold">Discount</th>
                      <th className="p-3 font-bold">Final Amount</th>
                      <th className="p-3 font-bold">PO Number</th>
                      <th className="p-3 font-bold">Created Date</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalList.map((proposal, idx) => (
                      <tr
                        key={proposal._id}
                        className="bg-white border-b font-semibold hover:bg-gray-50"
                      >
                        <td className="p-3 font-bold">
                          {proposal.proposalNumber}
                        </td>
                        <td className="p-3">{proposal.CoNumber || "--"}</td>
                        <td className="p-3">{proposal.discountPercentage}%</td>
                        <td className="p-3">{format(proposal.finalAmount)}</td>
                        <td className="p-3">{proposal.poNumber || "--"}</td>
                        <td className="p-3">
                          {moment(proposal.createdAt).format("DD/MM/YYYY")}
                        </td>
                        <td className="p-3">
                          <span
                            className={
                              proposal.status === "approved"
                                ? "bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-xs"
                                : proposal.status === "pending"
                                ? "bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold text-xs"
                                : proposal.status === "rejected"
                                ? "bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-xs"
                                : "bg-gray-200 px-3 py-1 rounded font-bold text-xs"
                            }
                          >
                            {proposal.status?.toUpperCase()}
                          </span>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
    </div>
  );
}
