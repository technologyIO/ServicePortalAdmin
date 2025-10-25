"use client";

import { renderApprovalHistory, getStatusChip } from "./utils";
import moment from "moment";

const ViewModal = ({ open, onClose, proposal, revision }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0    z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0  bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 rounded flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col transform transition-all duration-300 scale-100 overflow-hidden">
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                View Proposal
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {proposal?.proposalNumber} - Revision{" "}
                {revision?.revisionNumber || 0}
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
            {/* Customer Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
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
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900 font-semibold">
                    {proposal?.customer?.customername || "N/A"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Contact</p>
                  <p className="text-gray-900 font-semibold">
                    {proposal?.customer?.telephone || "N/A"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900 font-semibold">
                    {proposal?.customer?.email || "N/A"}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">City</p>
                  <p className="text-gray-900 font-semibold">
                    {proposal?.customer?.city || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Revision Details */}
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
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
                Revision Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-900 font-semibold">
                    {moment(
                      revision?.revisionDate || proposal?.createdAt
                    ).format("MMM D, YYYY h:mm A")}
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">
                    {getStatusChip(revision?.status || proposal?.status)}
                  </div>
                </div>
              </div>
              {revision?.changes?.remark && (
                <div className="bg-white bg-opacity-60 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600">Remark</p>
                  <p className="text-gray-900 mt-1">
                    {revision.changes.remark}
                  </p>
                </div>
              )}
              {revision?.approvalHistory && (
                <div className="mt-4">
                  {renderApprovalHistory(revision.approvalHistory)}
                </div>
              )}
            </div>

            {/* Summary Information */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">Discount</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {proposal?.discountPercentage}%
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">TDS</p>
                  <p className="text-2xl font-bold text-red-600">
                    {proposal?.tdsPercentage}%
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">GST</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {proposal?.gstPercentage}%
                  </p>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Final Amount
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{proposal?.finalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment Table */}
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
                  Equipment Details
                </h3>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Dealer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                        Warranty
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        RSH Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        NSH Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposal?.items?.map((item, index) => (
                      <tr
                        key={item._id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.equipment?.name}
                            </p>
                            <p className="text-sm text-nowrap text-gray-600 mt-1">
                              {item.equipment?.materialdescription}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-nowrap text-sm text-gray-900 font-mono">
                          {item.equipment?.materialcode}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.equipment?.dealer}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.years} year(s)
                            </p>
                            <p className="text-xs text-nowrap text-gray-600">
                              {item.warrantyType}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ₹{item.subtotal?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {item.RSHApproval?.approved ? (
                            <div className="space-y-1">
                              <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                              <div className="text-xs text-gray-600">
                                <p>
                                  <span className="font-medium">By:</span>{" "}
                                  {item.RSHApproval.approvedBy?.name ||
                                    "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium">On:</span>{" "}
                                  {moment(item.RSHApproval.approvedAt).format(
                                    "MMM D, YYYY"
                                  )}
                                </p>
                                {item.RSHApproval.remark && (
                                  <p>
                                    <span className="font-medium">Remark:</span>{" "}
                                    {item.RSHApproval.remark}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {item.NSHApproval?.approved ? (
                            <div className="space-y-1">
                              <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                              <div className="text-xs text-gray-600">
                                <p>
                                  <span className="font-medium">By:</span>{" "}
                                  {item.NSHApproval.approvedBy?.name ||
                                    "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium">On:</span>{" "}
                                  {moment(item.NSHApproval.approvedAt).format(
                                    "MMM D, YYYY"
                                  )}
                                </p>
                                {item.NSHApproval.remark && (
                                  <p>
                                    <span className="font-medium">Remark:</span>{" "}
                                    {item.NSHApproval.remark}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
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
};

export default ViewModal;
