"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  renderApprovalHistory,
  getStatusChip,
} from "../Admin/QuoteApproval/utils";
import moment from "moment";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function OnCallApprovalModal({
  open,
  onClose,
  proposal,
  setProposal,
  userId,
  fetchProposals,
}) {
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState(
    proposal?.revisions?.length > 0 ? proposal.revisions.length - 1 : 0
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;

  // Approve handler for OnCall
  const handleApprove = async (approvalType) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }
    if (!proposal?._id) {
      Swal.fire("Error!", "No OnCall selected.", "error");
      return;
    }
    try {
      setApprovalLoading(true);
      const endpoint = `/phone/oncall/${
        proposal._id
      }/approve-${approvalType.toLowerCase()}`;
      const payload = { userId };
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

  // Reject handler for OnCall
  const handleReject = async (approvalType) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }
    if (!proposal?._id) {
      Swal.fire("Error!", "No OnCall selected.", "error");
      return;
    }
    if (!rejectReason?.trim()) {
      Swal.fire("Error!", "Please enter a rejection reason.", "error");
      return;
    }
    try {
      setRejectLoading(true);
      const endpoint = `/phone/oncall/${proposal._id}/reject-revision`;
      const payload = { userId, reason: rejectReason, approvalType };
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

  // Helper function to get approval status
  const getApprovalStatus = (approval) => {
    if (!approval) return { status: "Pending" };
    if (approval.rejected) {
      return {
        status: "Rejected",
        reason: approval.rejectReason || "",
        by: approval.approvedBy?.name || "—",
        at: approval.approvedAt,
      };
    }
    if (approval.approved) {
      return {
        status: "Approved",
        by: approval.approvedBy?.name || "—",
        at: approval.approvedAt,
      };
    }
    return { status: "Pending" };
  };

  // Approval box component
  const ApprovalBox = ({ label, approval, approvalType, canAction }) => {
    const { status, by, at, reason } = getApprovalStatus(approval);
    const colorMap = {
      Approved: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Rejected: "bg-red-100 text-red-800",
    };

    return (
      <div className="flex-1 min-w-[200px] bg-blue-50 p-4 rounded-lg border">
        <div className="text-xs font-semibold text-blue-600">
          {label} Approval
        </div>
        
        <span className={`mt-2 inline-block px-3 py-1 text-xs rounded-full mb-2 ${colorMap[status]}`}>
          {status}
        </span>

        {/* Show approval/rejection details */}
        {(status === "Approved" || status === "Rejected") && (
          <div className={`mt-2 text-xs rounded-md p-2 ${
            status === "Approved" 
              ? "bg-green-50 text-green-700" 
              : "bg-red-50 text-red-700"
          }`}>
            <div>
              <b>By:</b> {by}
              {at && (
                <>
                  {" "}<b>on</b> {moment(at).format("MMM D, YYYY, h:mm A")}
                </>
              )}
            </div>
            {status === "Rejected" && reason && (
              <div className="mt-1">
                <b>Reason:</b> {reason}
              </div>
            )}
          </div>
        )}

        {/* Action buttons for pending status */}
        {canAction && status === "Pending" && (
          <div className="mt-3">
            <button
              onClick={() => handleApprove(approvalType)}
              disabled={approvalLoading}
              className="w-full px-4 py-2 mb-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 focus:outline-none transition-colors disabled:opacity-50"
            >
              {approvalLoading ? "Approving..." : `Approve ${approvalType}`}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Rejection Reason (if any)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                onClick={() => handleReject(approvalType)}
                disabled={rejectLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                {rejectLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!open) return null;

  // Financial summary for latest revision or data
  const latestRev =
    proposal?.revisions?.length > 0
      ? proposal?.revisions[proposal?.revisions.length - 1]
      : null;
  const summary = { ...proposal, ...(latestRev?.changes || {}) };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                OnCall #{proposal?.onCallNumber}
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
            {/* Revision Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Revision History
                </h3>
              </div>
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {proposal?.revisions?.map((rev, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                        activeTab === idx
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Rev. {rev.revisionNumber}
                      {rev.revisionNumber === proposal.currentRevision && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {proposal?.revisions?.map(
                  (rev, idx) =>
                    activeTab === idx && (
                      <div key={idx} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500">Date</span>
                            <div className="text-gray-900 font-medium">
                              {moment(rev.revisionDate).format(
                                "MMM D, YYYY h:mm A"
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">
                              Status
                            </span>
                            <div>{getStatusChip(rev.status)}</div>
                          </div>
                        </div>
                        {rev.changes?.remark && (
                          <div>
                            <span className="text-xs text-gray-500">
                              Remark
                            </span>
                            <div className="text-gray-900 bg-gray-50 p-2 rounded-lg mt-1">
                              {rev.changes.remark}
                            </div>
                          </div>
                        )}
                        {rev.approvalHistory &&
                          renderApprovalHistory(rev.approvalHistory)}
                      </div>
                    )
                )}
              </div>
            </div>

            {/* Approvals - Role-based visibility */}
            <div className="flex flex-wrap gap-8 my-6">
              {/* Show RSH approval to RSH users or super admins */}
              {(currentUserRole === "RSH" || (currentUserRole !== "RSH" && currentUserRole !== "NSH")) && (
                <ApprovalBox
                  label="RSH"
                  approval={proposal.RSHApproval}
                  approvalType="RSH"
                  canAction={currentUserRole === "RSH"}
                />
              )}
              
              {/* Show NSH approval to NSH users or super admins */}
              {(currentUserRole === "NSH" || (currentUserRole !== "RSH" && currentUserRole !== "NSH")) && (
                <ApprovalBox
                  label="NSH"
                  approval={proposal.NSHApproval}
                  approvalType="NSH"
                  canAction={currentUserRole === "NSH"}
                />
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 my-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Financial Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">
                    Subtotal
                  </span>
                  <div className="text-xl font-bold text-blue-900">
                    ₹
                    {Number(summary.grandSubTotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">
                    Discount
                  </span>
                  <div className="text-xl font-bold text-orange-600">
                    {Number(summary.discountPercentage) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    - ₹
                    {Number(summary.discountAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">
                    After Discount
                  </span>
                  <div className="text-xl font-bold text-gray-900">
                    ₹
                    {Number(summary.afterDiscount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">TDS</span>
                  <div className="text-xl font-bold text-red-600">
                    {Number(summary.tdsPercentage) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    + ₹
                    {Number(summary.tdsAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">
                    After TDS
                  </span>
                  <div className="text-xl font-bold text-gray-900">
                    ₹
                    {Number(summary.afterTds).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium text-gray-600">GST</span>
                  <div className="text-xl font-bold text-blue-600">
                    {Number(summary.gstPercentage) || 0}%
                  </div>
                  <div className="text-xs text-gray-500">
                    + ₹
                    {Number(summary.gstAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center col-span-2">
                  <span className="text-sm font-medium text-gray-600">
                    Final Amount
                  </span>
                  <div className="text-2xl font-bold text-green-600">
                    ₹
                    {Number(summary.finalAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Group / Spares Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Spare Parts
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Group
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DP
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Charges
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposal?.productGroups?.map((group, i) =>
                      group.spares?.map((spare, j) => (
                        <tr key={spare.PartNumber + j}>
                          <td className="px-6 py-4 text-sm">
                            {group.productPartNo}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {spare.PartNumber}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {spare.Description}
                          </td>
                          <td className="px-6 py-4 text-sm">{spare.Type}</td>
                          <td className="px-6 py-4 text-sm">
                            ₹{Number(spare.Rate).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            ₹{Number(spare.DP).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            ₹{Number(spare.Charges).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnCallApprovalModal;
