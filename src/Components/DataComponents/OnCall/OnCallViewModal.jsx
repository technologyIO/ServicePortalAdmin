"use client";

import moment from "moment";
import { renderApprovalHistory, getStatusChip } from "../Admin/QuoteApproval/utils";

const safe = (fn, fallback = "") => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

function ApprovalStatusBox({ label, approval }) {
  return (
    <div className="bg-white bg-opacity-60 rounded-lg p-3 flex flex-col items-center justify-center min-w-[110px]">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      {approval?.approved ? (
        <>
          <span className="mt-1 inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 mb-1">
            Approved
          </span>
          <p className="text-[11px] text-gray-600">
            <b>By:</b> {approval?.approvedBy?.name || "—"}
            <br />
            <b>Date:</b>{" "}
            {approval?.approvedAt
              ? moment(approval?.approvedAt).format("MMM D, YYYY, h:mm A")
              : "—"}
          </p>
        </>
      ) : (
        <span className="mt-2 inline-block px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      )}
    </div>
  );
}

function OnCallViewModal({ open, onClose, proposal, revision }) {
  if (!open) return null;

  // Prefer revision.changes for financial data when available
  const changes = revision?.changes || {};
  const revOrProp = { ...proposal, ...changes };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 rounded flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col transform transition-all duration-300 scale-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                View OnCall
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {proposal?.onCallNumber || "—"} &nbsp;|&nbsp; Revision {revision?.revisionNumber ?? proposal?.currentRevision ?? 0}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors duration-200"
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

            {/* Customer & Complaint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Customer
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{safe(() => proposal.customer?.customername, "N/A")}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Phone:</span>
                    <span className="text-gray-900">{safe(() => proposal.customer?.telephone, "—")}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-gray-900">{safe(() => proposal.customer?.email, "—")}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">City:</span>
                    <span className="text-gray-900">{safe(() => proposal.customer?.city, "—")}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Tax1/Tax2:</span>
                    <span className="text-gray-900">{safe(() => proposal.customer.taxnumber1)} / {safe(() => proposal.customer.taxnumber2)}</span>
                  </div>
                </div>
              </div>
              {/* Complaint */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1M12 18h.01"
                    />
                  </svg>
                  Complaint
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="block text-xs text-gray-500">Complaint ID:</span>
                    <span className="text-sm font-semibold">{safe(() => proposal.complaint.notification_complaintid)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Product:</span>
                    <span className="text-sm">{safe(() => proposal.complaint.materialdescription)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Serial No:</span>
                    <span className="text-sm">{safe(() => proposal.complaint.serialnumber)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Reported Problem:</span>
                    <span className="text-sm">{safe(() => proposal.complaint.reportedproblem)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Date:</span>
                    <span className="text-sm">{safe(() => proposal.complaint.notificationdate)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500">Dealer:</span>
                    <span className="text-sm">{safe(() => proposal.complaint.dealercode)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revision Details */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Revision Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-900 font-semibold">
                    {moment(
                      revision?.revisionDate || proposal?.updatedAt || proposal?.createdAt
                    ).format("MMM D, YYYY h:mm A")}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">
                    {getStatusChip(
                      revision?.status || proposal?.status
                    )}
                  </div>
                </div>
              </div>
              {(
                safe(() => revision.changes?.remark) ||
                safe(() => proposal.remark)
              ) && (
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Remark</p>
                  <p className="text-gray-900 mt-1">
                    {safe(() => revision.changes?.remark) || safe(() => proposal.remark)}
                  </p>
                </div>
              )}
              {revision?.approvalHistory && revision.approvalHistory.length > 0 && (
                <div className="mt-4">
                  {renderApprovalHistory(revision.approvalHistory)}
                </div>
              )}
            </div>

            {/* Approvals Box */}
            <div className="flex flex-wrap gap-6 my-4">
              <ApprovalStatusBox
                label="RSH Approval"
                approval={proposal.RSHApproval}
              />
              <ApprovalStatusBox
                label="NSH Approval"
                approval={proposal.NSHApproval}
              />
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm font-medium text-gray-600">Subtotal</p>
                  <p className="text-xl font-bold text-blue-900">
                    ₹{Number(revOrProp.grandSubTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">Discount</p>
                  <p className="text-xl font-bold text-orange-600">
                    {safe(() => revOrProp.discountPercentage)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    - ₹{Number(revOrProp.discountAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">After Discount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{Number(revOrProp.afterDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">TDS</p>
                  <p className="text-xl font-bold text-red-600">
                    {safe(() => revOrProp.tdsPercentage)}%<br />
                    + ₹{Number(revOrProp.tdsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">After TDS</p>
                  <p className="text-xl font-bold text-gray-900">₹{Number(revOrProp.afterTds).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">GST</p>
                  <p className="text-xl font-bold text-blue-600">
                    {safe(() => revOrProp.gstPercentage)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    + ₹{Number(revOrProp.gstAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">Final Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{Number(revOrProp.finalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* ProductGroups Table */}
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
                          <td className="px-6 py-4 text-sm">{group.productPartNo}</td>
                          <td className="px-6 py-4 text-sm">{spare.PartNumber}</td>
                          <td className="px-6 py-4 text-sm">{spare.Description}</td>
                          <td className="px-6 py-4 text-sm">{spare.Type}</td>
                          <td className="px-6 py-4 text-sm">₹{Number(spare.Rate).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm">₹{Number(spare.DP).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm">₹{Number(spare.Charges).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnCallViewModal;
