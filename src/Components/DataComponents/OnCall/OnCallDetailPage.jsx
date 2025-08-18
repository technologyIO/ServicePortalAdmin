"use client";

import { useEffect, useState } from "react";
import { Eye, Download, Edit, ArrowLeft } from "lucide-react";
import moment from "moment";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import OnCallViewModal from "./OnCallViewModal";
import OnCallApprovalModal from "./OnCallApprovalModal";

// Currency formatting utility
const format = (v) =>
  typeof v === "number"
    ? `₹${Number.parseFloat(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      })}`
    : v;

const TABS = [
  { id: 1, label: "Opportunity" },
  { id: 2, label: "Quote" },
  { id: 3, label: "Contract Note" },
];

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function OnCallCustomerDetailTabs() {
  const [tab, setTab] = useState(TABS[0].id);
  const [onCallList, setOnCallList] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOncall, setSelectedOncall] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [userId, setUserId] = useState(null);
  const { customerId } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    async function fetchCustomerOnCalls() {
      if (!customerId) {
        setError("No customer ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching data for customer ID:", customerId);
        const res = await api.get(`/phone/oncall/pagecall?limit=1000`);
        console.log("API Response:", res.data);

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        console.log("Total OnCalls fetched:", data.length);

        // Filter by customercodeid and discount > 5%
        const filtered = data.filter((item) => {
          console.log("Checking item:", {
            customercodeid: item.customer?.customercodeid,
            discountPercentage: item.discountPercentage,
            matches: item.customer?.customercodeid === customerId,
            hasDiscount:
              typeof item.discountPercentage === "number" &&
              item.discountPercentage > 5,
          });

          return (
            item.customer?.customercodeid === customerId &&
            typeof item.discountPercentage === "number" &&
            item.discountPercentage > 5
          );
        });

        console.log("Filtered OnCalls:", filtered.length);

        if (filtered.length > 0) {
          setOnCallList(filtered);
          setCustomer(filtered[0].customer);
          console.log("Customer found:", filtered.customer);
        } else {
          // Try to find any oncall with this customer ID (even without discount filter)
          const anyOncall = data.find(
            (item) => item.customer?.customercodeid === customerId
          );
          if (anyOncall) {
            console.log("Customer found but no oncalls with >5% discount");
            setCustomer(anyOncall.customer);
            setOnCallList([]);
          } else {
            console.log("Customer not found at all");
            setError("Customer not found");
          }
        }
      } catch (e) {
        console.error("Error fetching customer oncalls:", e);
        setError("Error fetching data: " + e.message);
      }
      setLoading(false);
    }

    fetchCustomerOnCalls();
  }, [customerId]);
  const handleViewOpportunity = (oncall) => {
    // If there are revisions, find the current one; else fallback to oncall itself
    let rev = null;
    if (Array.isArray(oncall.revisions) && oncall.revisions.length > 0) {
      rev =
        oncall.revisions.find(
          (r) => r.revisionNumber === oncall.currentRevision
        ) || oncall.revisions[oncall.revisions.length - 1];
    }
    // Compose a revisionData merged object like in the quote tab
    const revisionData = rev
      ? {
          ...oncall,
          ...rev.changes,
          status: rev.status || oncall.status,
        }
      : oncall;
    setSelectedOncall(revisionData);
    setSelectedRevision(rev);
    setShowViewModal(true);
  };

  const handleViewRevision = (oncall, revision) => {
    console.log("View revision:", revision, "for oncall:", oncall.onCallNumber);
    // Flatten latest revision data for use in modal
    const revisionData = {
      ...oncall,
      ...revision.changes,
      status: revision.status || oncall.status,
    };
    setSelectedOncall(revisionData);
    setSelectedRevision(revision);
    setShowViewModal(true);
  };

  const handleEditRevision = (oncall, revision) => {
    console.log(
      "[v0] Edit revision clicked:",
      revision,
      "for oncall:",
      oncall.onCallNumber
    );
    console.log("[v0] Revision status:", revision.status);
    console.log("[v0] Current revision:", oncall.currentRevision);
    console.log("[v0] Revision number:", revision.revisionNumber);

    // Prepare oncall data with revision changes for editing
    const oncallWithRevision = {
      ...oncall,
      ...revision.changes,
      revisionData: revision,
      isCurrentRevision: revision.revisionNumber === oncall.currentRevision,
      status: revision.status,
    };
    console.log("[v0] Setting selected oncall:", oncallWithRevision);
    setSelectedOncall(oncallWithRevision);
    setShowApprovalModal(true);
    console.log("[v0] Modal should open now");
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedOncall(null);
    setSelectedRevision(null);
  };

  const fetchOnCalls = async () => {
    // Refresh the data after modal operations
    window.location.reload(); // Simple refresh, you can make this more sophisticated
  };

  const handleOpenDetail = (oncall) => {
    console.log("Open detail for:", oncall.onCallNumber);
    alert(`Open detail for ${oncall.onCallNumber}`);
  };

  const handleDownloadQuote = (proposalId) => {
    navigate(`/quote-template/${proposalId}`);
  };
  const handleDownloadContractNote = (oncall) => {
    console.log("Download contract note for:", oncall.onCallNumber);
    alert(`Download contract note for ${oncall.onCallNumber}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-2xl text-blue-700 font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="CustomLoader"></div>
          <div>Loading customer data...</div>
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
          Back to Customer List
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
          Back to Customer List
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Back Button and Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back to Customer List
        </button>
      </div>

      {/* Show message if no oncalls with discount > 5% */}
      {onCallList.length === 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <strong>Note:</strong> This customer has no OnCalls with discount
          greater than 5%.
        </div>
      )}

      {/* Tab Header */}
      <div className="flex w-fit bg-white shadow-lg rounded-lg overflow-hidden mb-4">
        {TABS.map((tabItem, i) => (
          <div key={tabItem.id} className="relative">
            <button
              className={[
                "px-8 py-3 text-base font-semibold transition-all relative z-10",
                tab === tabItem.id
                  ? "bg-blue-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50",
              ].join(" ")}
              onClick={() => setTab(tabItem.id)}
            >
              {tabItem.label}
            </button>
            {/* Arrow for design */}
            {i < TABS.length - 1 && (
              <>
                <div
                  className={[
                    "absolute top-0 right-0 w-0 h-0 z-20",
                    tab === tabItem.id
                      ? "border-l-[20px] border-l-blue-700"
                      : "border-l-[20px] border-l-white",
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

      <div className="bg-white rounded-lg shadow-lg p-0 overflow-x-auto">
        {/* Opportunity Tab */}
        {tab === 1 && (
          <div className="">
            {onCallList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No OnCalls found with discount greater than 5%
              </div>
            ) : (
              <table className="w-full border mb-4 min-w-[900px]">
                <thead>
                  <tr className="bg-blue-700 text-white text-lg">
                    <th className="p-3 font-bold">S.No</th>
                    <th className="p-3 font-bold">OnCall #</th>
                    <th className="p-3 font-bold">Customer</th>
                    <th className="p-3 font-bold">Product</th>
                    <th className="p-3 font-bold">Quantity</th>
                    <th className="p-3 font-bold">Final Amount</th>
                    <th className="p-3 font-bold">Created At</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {onCallList.map((oncall, idx) => (
                    <tr
                      key={oncall._id}
                      className="bg-white border-b text-center hover:bg-gray-50"
                    >
                      <td className="p-3">{idx + 1}</td>
                      <td className="p-3 font-bold">{oncall.onCallNumber}</td>
                      <td className="p-3 font-bold">
                        {oncall.customer.customername}
                      </td>
                      <td className="p-3 uppercase">
                        {oncall.productGroups?.[0]?.productPartNo}
                      </td>
                      <td className="p-3">
                        {oncall.productGroups?.[0]?.totalSpares}
                      </td>
                      <td className="p-3">{format(oncall.finalAmount)}</td>
                      <td className="p-3">
                        {moment(oncall.createdAt).format("DD/MM/YYYY")}
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            oncall.status === "approved"
                              ? "bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-xs"
                              : oncall.status === "pending"
                              ? "bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold text-xs"
                              : oncall.status === "rejected"
                              ? "bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-xs"
                              : "bg-gray-200 px-3 py-1 rounded font-bold text-xs"
                          }
                        >
                          {oncall.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          className="bg-blue-700 rounded-lg p-2 text-white font-bold text-lg hover:bg-blue-800"
                          onClick={() => handleViewOpportunity(oncall)}
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

        {/* Quote Tab: Show revision-wise quote table like Approval Page */}
        {tab === 2 && (
          <div className="p-6">
            {onCallList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No OnCalls found with discount greater than 5%
              </div>
            ) : (
              onCallList.map((oncall, callIdx) => (
                <div className="mb-10 border-b pb-5" key={oncall._id}>
                  {/* OnCall Header Info */}

                  <div className="overflow-x-auto">
                    <table className="w-full border mb-2 min-w-[1100px]">
                      <thead>
                        <tr className="bg-blue-700 text-white text-sm">
                          <th className="p-3 font-bold">S.No</th>
                          <th className="p-3 font-bold">OnCall Number</th>
                          <th className="p-3 font-bold">Material Code</th>
                          <th className="p-3 font-bold">Discount</th>
                          <th className="p-3 font-bold">Net Amount</th>
                          <th className="p-3 font-bold">Status</th>
                          <th className="p-3 font-bold">Revision</th>
                          <th className="p-3 font-bold">Date</th>
                          <th className="p-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(oncall.revisions) &&
                        oncall.revisions.length ? (
                          oncall.revisions
                            .sort((a, b) => b.revisionNumber - a.revisionNumber)
                            .map((rev, idx) => (
                              <tr
                                key={rev.revisionNumber}
                                className="bg-white border-b hover:bg-gray-50"
                              >
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-mono text-sm font-bold">
                                  {oncall.onCallNumber}
                                </td>
                                <td className="p-3 text-sm">
                                  {oncall.productGroups?.[0]?.productPartNo}
                                  <div className="text-xs text-gray-500">
                                    {oncall.productGroups?.[0]?.totalSpares}{" "}
                                    spares
                                  </div>
                                </td>
                                <td className="p-3 font-bold">
                                  {rev.changes?.discountPercentage || 0}%
                                </td>
                                <td className="p-3 font-bold">
                                  {format(rev.changes?.finalAmount)}
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
                                      oncall.currentRevision && (
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
                                    {/* View Button - Show for ALL revisions */}
                                    <button
                                      className="bg-blue-700 rounded p-1 text-white hover:bg-blue-800"
                                      onClick={() =>
                                        handleViewRevision(oncall, rev)
                                      }
                                      title="View Details"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    {/* Edit Button - Show ONLY for CURRENT revision */}
                                    {rev.revisionNumber ===
                                      oncall.currentRevision && (
                                      <button
                                        className="bg-yellow-500 rounded p-1 text-white hover:bg-yellow-600"
                                        onClick={() =>
                                          handleEditRevision(oncall, rev)
                                        }
                                        title="Edit Revision"
                                      >
                                        <Edit size={16} />
                                      </button>
                                    )}

                                    {/* Download Button - Show for ALL revisions */}
                                    {rev.revisionNumber ===
                                      oncall.currentRevision && (
                                      <button
                                        className="bg-gray-500 rounded p-1 text-white hover:bg-gray-600"
                                        onClick={() => {
                                          handleDownloadQuote(oncall?._id);
                                          console.log(oncall, "rev?.id");
                                        }}
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

        {/* Contract Note Tab */}
        {tab === 3 && (
          <div className="">
            {onCallList.length === 0 ? (
              <div className="text-center py-16 text-lg text-gray-500">
                No OnCalls found with discount greater than 5%
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border mb-6 text-lg min-w-[1000px]">
                  <thead>
                    <tr className="bg-blue-700 text-white">
                      <th className="p-3 font-bold">OnCall #</th>
                      <th className="p-3 font-bold">C Note ID</th>
                      <th className="p-3 font-bold">Discount</th>
                      <th className="p-3 font-bold">Final Amount</th>
                      <th className="p-3 font-bold">PO Number</th>
                      <th className="p-3 font-bold">Created Date</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onCallList.map((oncall, idx) => (
                      <tr
                        key={oncall._id}
                        className="bg-white border-b font-semibold hover:bg-gray-50"
                      >
                        <td className="p-3 font-bold">{oncall.onCallNumber}</td>
                        <td className="p-3">{oncall.cnoteNumber || "--"}</td>

                        <td className="p-3">{oncall.discountPercentage}%</td>
                        <td className="p-3">{format(oncall.finalAmount)}</td>
                        <td className="p-3">{oncall.poNumber || "--"}</td>
                        <td className="p-3">
                          {moment(oncall.createdAt).format("DD/MM/YYYY")}
                        </td>
                        <td className="p-3">
                          <span
                            className={
                              oncall.status === "approved"
                                ? "bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-xs"
                                : oncall.status === "pending"
                                ? "bg-orange-100 text-orange-800 px-3 py-1 rounded font-bold text-xs"
                                : oncall.status === "rejected"
                                ? "bg-red-100 text-red-800 px-3 py-1 rounded font-bold text-xs"
                                : "bg-gray-200 px-3 py-1 rounded font-bold text-xs"
                            }
                          >
                            {oncall.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            className="bg-gray-500 rounded p-2 text-white hover:bg-gray-600"
                            onClick={() => handleDownloadContractNote(oncall)}
                            title="Download Contract Note"
                          >
                            <Download size={18} />
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

      {console.log(
        "[v0] Modal states - showApprovalModal:",
        showApprovalModal,
        "selectedOncall:",
        selectedOncall
      )}

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
    </div>
  );
}
