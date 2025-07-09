"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { renderApprovalHistory, getStatusChip } from "./utils";
import moment from "moment";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const ApprovalModal = ({
  open,
  onClose,
  proposal,
  setProposal,
  userId,
  fetchProposals,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;

  const handleApprove = async (approvalType, itemId = null) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }
    if (!proposal?._id) {
      Swal.fire("Error!", "No proposal selected.", "error");
      return;
    }

    try {
      setApprovalLoading(true);
      const endpoint = `/phone/proposal/${
        proposal._id
      }/approve-${approvalType.toLowerCase()}`;
      const payload = { userId, ...(itemId && { itemId }) };
      await api.put(endpoint, payload);
      await fetchProposals();
      onClose();
      Swal.fire(
        "Approved!",
        `${approvalType} approval has been recorded.`,
        "success"
      );
    } catch (error) {
      console.error("Approval error:", error);
      let errorMsg = "Failed to record approval";
      if (error.response) {
        errorMsg = error.response.data.message || errorMsg;
        if (error.response.status === 401) {
          errorMsg = "Session expired. Please login again.";
        }
      }
      Swal.fire("Error!", errorMsg, "error");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleReject = async (approvalType, itemId = null) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }
    if (!proposal?._id) {
      Swal.fire("Error!", "No proposal selected.", "error");
      return;
    }

    const reason = itemId
      ? proposal.items.find((item) => item._id === itemId)?.rejectReason
      : rejectReason;

    if (!reason?.trim()) {
      Swal.fire("Error!", "Please enter a rejection reason.", "error");
      return;
    }

    try {
      setRejectLoading(true);
      const endpoint = `/phone/proposal/${proposal._id}/reject-revision`;
      const payload = {
        userId,
        reason,
        approvalType,
        ...(itemId && { itemId }),
      };
      await api.put(endpoint, payload);
      await fetchProposals();
      onClose();
      Swal.fire(
        "Rejected!",
        `${approvalType} rejection has been recorded.`,
        "success"
      );
    } catch (error) {
      console.error("Rejection error:", error);
      let errorMsg = "Failed to record rejection";
      if (error.response) {
        errorMsg = error.response.data.message || errorMsg;
        if (error.response.status === 401) {
          errorMsg = "Session expired. Please login again.";
        }
      }
      Swal.fire("Error!", errorMsg, "error");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleRejectReasonChange = (itemId, reason) => {
    setProposal((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === itemId ? { ...item, rejectReason: reason } : item
      ),
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {proposal?.proposalNumber}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Revision {proposal?.currentRevision}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg
                className="w-6 h-6 text-gray-500"
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
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
                Customer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900 font-medium">
                    {proposal?.customer?.customername || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Contact</p>
                  <p className="text-gray-900 font-medium">
                    {proposal?.customer?.telephone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">
                    {proposal?.customer?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">City</p>
                  <p className="text-gray-900 font-medium">
                    {proposal?.customer?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Revision History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
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
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {proposal?.revisions?.map((revision, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                        activeTab === index
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Rev. {revision.revisionNumber}
                      {revision.revisionNumber === proposal.currentRevision && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {proposal?.revisions?.map(
                  (revision, index) =>
                    activeTab === index && (
                      <div key={index} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Date
                            </p>
                            <p className="text-gray-900">
                              {moment(revision.revisionDate).format(
                                "MMM D, YYYY h:mm A"
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Status
                            </p>
                            <div className="mt-1">
                              {getStatusChip(revision.status)}
                            </div>
                          </div>
                        </div>
                        {revision.changes?.remark && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Remark
                            </p>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                              {revision.changes.remark}
                            </p>
                          </div>
                        )}
                        {renderApprovalHistory(revision.approvalHistory)}
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Equipment Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
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
                  Equipment Details
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warranty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RSH Status
                      </th>
                      <th className="px-6 py-4 text-nowrap text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NSH Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reject
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposal?.items?.map((item, index) => (
                      <tr
                        key={item._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm text-nowrap text-gray-900">
                          {item.equipment?.materialdescription}
                        </td>
                        <td className="px-6 py-4 text-sm text-nowrap text-gray-900 font-mono">
                          {item.equipment?.materialcode}
                        </td>
                        <td className="px-6 py-4 text-nowrap text-sm text-gray-900">
                          {item.years} year(s) {item.warrantyType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          ₹{item.subtotal?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              item.RSHApproval?.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.RSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              item.NSHApproval?.approved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.NSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {currentUserRole === "RSH" &&
                              !item.RSHApproval?.approved && (
                                <button
                                  onClick={() => handleApprove("RSH", item._id)}
                                  disabled={approvalLoading}
                                  className="px-4 py-2 text-nowrap bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                  {approvalLoading ? (
                                    <div className="flex items-center">
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Loading...
                                    </div>
                                  ) : (
                                    "Approve RSH"
                                  )}
                                </button>
                              )}
                            {currentUserRole === "NSH" &&
                              !item.NSHApproval?.approved && (
                                <button
                                  onClick={() => handleApprove("NSH", item._id)}
                                  disabled={approvalLoading}
                                  className="px-4 py-2 text-nowrap bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                  {approvalLoading ? (
                                    <div className="flex items-center">
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Loading...
                                    </div>
                                  ) : (
                                    "Approve NSH"
                                  )}
                                </button>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="Enter reason..."
                              className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                              value={item.rejectReason || ""}
                              onChange={(e) =>
                                handleRejectReasonChange(
                                  item._id,
                                  e.target.value
                                )
                              }
                            />
                            <div className="flex flex-col gap-2">
                              {currentUserRole === "RSH" && (
                                <button
                                  onClick={() => handleReject("RSH", item._id)}
                                  disabled={
                                    !item.rejectReason?.trim() || rejectLoading
                                  }
                                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                                >
                                  {rejectLoading ? (
                                    <div className="flex items-center">
                                      <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Loading...
                                    </div>
                                  ) : (
                                    "Reject (RSH)"
                                  )}
                                </button>
                              )}
                              {currentUserRole === "NSH" &&
                                proposal?.discountPercentage > 10 && (
                                  <button
                                    onClick={() =>
                                      handleReject("NSH", item._id)
                                    }
                                    disabled={
                                      !item.rejectReason?.trim() ||
                                      rejectLoading
                                    }
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
                                  >
                                    {rejectLoading ? (
                                      <div className="flex items-center">
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        Loading...
                                      </div>
                                    ) : (
                                      "Reject (NSH)"
                                    )}
                                  </button>
                                )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
