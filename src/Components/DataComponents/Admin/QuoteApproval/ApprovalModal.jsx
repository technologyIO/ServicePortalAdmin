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
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [remark, setRemark] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;

  // Function to get proper status display
  const getApprovalStatusDisplay = (item, approvalType) => {
    const approval = item[`${approvalType}Approval`] || {};
    
    // Check if explicitly rejected
    if (approval.rejected === true || approval.approved === false) {
      return "Rejected";
    }
    // Check if approved
    else if (approval.approved === true) {
      return "Approved";
    }
    // Default to pending
    else {
      return "Pending";
    }
  };

  // Function to get status chip with proper colors
  const getStatusChip = (status) => {
    const baseClasses = "inline-flex px-3 py-1 text-xs font-medium rounded-full";
    
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            ✓ Approved
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            ✗ Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            ⏳ Pending
          </span>
        );
    }
  };

  // Select All functionality
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const allItems = new Set(proposal?.items?.map((item) => item._id) || []);
      setSelectedItems(allItems);
    } else {
      setSelectedItems(new Set());
    }
  };

  // Individual item selection
  const handleItemSelect = (itemId, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === proposal?.items?.length);
  };

  // Handle action selection (both individual and bulk)
  const handleActionSelect = (action, itemId = null, isBulk = false) => {
    let actionData = {
      action,
      isBulk,
      itemId: itemId,
      selectedItems: isBulk ? Array.from(selectedItems) : null,
    };

    setPendingAction(actionData);
    setShowRemarkModal(true);
    setRemark("");
  };

  // Submit the selected action with remark
  const handleSubmitAction = async () => {
    if (!remark.trim()) {
      Swal.fire("Error!", "Please enter a remark.", "error");
      return;
    }

    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }

    if (!proposal?._id) {
      Swal.fire("Error!", "No proposal selected.", "error");
      return;
    }

    const {
      action,
      isBulk,
      itemId,
      selectedItems: selectedItemIds,
    } = pendingAction;
    const isApprove = action.includes("approve");
    const approvalType = action.split("-")[1];

    try {
      setApprovalLoading(true);

      if (isBulk) {
        // Use bulk endpoints
        let endpoint;
        if (isApprove) {
          endpoint = `/phone/proposal/${
            proposal._id
          }/bulk-approve-${approvalType.toLowerCase()}`;
        } else {
          endpoint = `/phone/proposal/${proposal._id}/bulk-reject-revision`;
        }

        const payload = isApprove
          ? { userId, itemIds: selectedItemIds, remark }
          : { userId, reason: remark, approvalType, itemIds: selectedItemIds };

        await api.put(endpoint, payload);
      } else {
        // Single item action
        const endpoint = isApprove
          ? `/phone/proposal/${
              proposal._id
            }/approve-${approvalType.toLowerCase()}`
          : `/phone/proposal/${proposal._id}/reject-revision`;

        const payload = isApprove
          ? { userId, itemId, remark }
          : { userId, reason: remark, approvalType, itemId };

        await api.put(endpoint, payload);
      }

      await fetchProposals();
      setShowRemarkModal(false);
      setPendingAction(null);
      setRemark("");
      setSelectedItems(new Set());
      setSelectAll(false);
      onClose();

      Swal.fire(
        isApprove ? "Approved!" : "Rejected!",
        `${approvalType} ${
          isApprove ? "approval" : "rejection"
        } has been recorded${
          isBulk ? ` for ${selectedItemIds.length} items` : ""
        }.`,
        "success"
      );
    } catch (error) {
      console.error("Action error:", error);
      let errorMsg = `Failed to record ${isApprove ? "approval" : "rejection"}`;
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

  // Check if user can perform actions on item
  const canPerformAction = (item, userRole) => {
    const rshStatus = getApprovalStatusDisplay(item, "RSH");
    const nshStatus = getApprovalStatusDisplay(item, "NSH");
    
    if (userRole === "RSH") {
      return rshStatus === "Pending";
    } else if (userRole === "NSH") {
      return nshStatus === "Pending";
    }
    return false;
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {proposal?.proposalNumber}
              </h2>
              <p className="text-sm text-blue-600 mt-1 font-medium">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
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

                {/* Bulk Actions */}
                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 font-medium">
                      {selectedItems.size} item(s) selected
                    </span>
                    <div className="flex gap-2">
                      {/* Bulk Selector for RSH */}
                      {currentUserRole === "RSH" && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleActionSelect(e.target.value, null, true);
                              e.target.value = "";
                            }
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium min-w-[160px]"
                          defaultValue=""
                        >
                          <option value="">Select Status (RSH)</option>
                          <option
                            value="approve-RSH"
                            className="text-green-700"
                          >
                            ✓ Approve RSH
                          </option>
                          <option value="reject-RSH" className="text-red-700">
                            ✗ Reject RSH
                          </option>
                        </select>
                      )}

                      {/* Bulk Selector for NSH */}
                      {currentUserRole === "NSH" && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleActionSelect(e.target.value, null, true);
                              e.target.value = "";
                            }
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-medium min-w-[160px]"
                          defaultValue=""
                        >
                          <option value="">Select Status (NSH)</option>
                          <option
                            value="approve-NSH"
                            className="text-green-700"
                          >
                            ✓ Approve NSH
                          </option>
                          <option value="reject-NSH" className="text-red-700">
                            ✗ Reject NSH
                          </option>
                        </select>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select All
                          </span>
                        </div>
                      </th>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proposal?.items?.map((item, index) => (
                      <tr
                        key={item._id}
                        className={`transition-colors ${
                          selectedItems.has(item._id)
                            ? "bg-blue-50 border-blue-200"
                            : index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={(e) =>
                              handleItemSelect(item._id, e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
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
                        
                        {/* RSH Status Column with proper status display */}
                        <td className="px-6 py-4">
                          {getStatusChip(getApprovalStatusDisplay(item, "RSH"))}
                        </td>
                        
                        {/* NSH Status Column with proper status display */}
                        <td className="px-6 py-4">
                          {getStatusChip(getApprovalStatusDisplay(item, "NSH"))}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {/* Single Selector for RSH - only show if can perform action */}
                            {currentUserRole === "RSH" && canPerformAction(item, "RSH") && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleActionSelect(
                                      e.target.value,
                                      item._id,
                                      false
                                    );
                                    e.target.value = "";
                                  }
                                }}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[140px]"
                                defaultValue=""
                              >
                                <option value="">Select Status</option>
                                <option
                                  value="approve-RSH"
                                  className="text-green-700"
                                >
                                  ✓ Approve RSH
                                </option>
                                <option
                                  value="reject-RSH"
                                  className="text-red-700"
                                >
                                  ✗ Reject RSH
                                </option>
                              </select>
                            )}

                            {/* Single Selector for NSH - only show if can perform action */}
                            {currentUserRole === "NSH" && canPerformAction(item, "NSH") && (
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleActionSelect(
                                      e.target.value,
                                      item._id,
                                      false
                                    );
                                    e.target.value = "";
                                  }
                                }}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[140px]"
                                defaultValue=""
                              >
                                <option value="">Select Status</option>
                                <option
                                  value="approve-NSH"
                                  className="text-green-700"
                                >
                                  ✓ Approve NSH
                                </option>
                                <option
                                  value="reject-NSH"
                                  className="text-red-700"
                                >
                                  ✗ Reject NSH
                                </option>
                              </select>
                            )}

                            {/* Show status when no actions available */}
                            {!canPerformAction(item, currentUserRole) && (
                              <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                                {currentUserRole === "RSH" 
                                  ? `RSH ${getApprovalStatusDisplay(item, "RSH")}`
                                  : `NSH ${getApprovalStatusDisplay(item, "NSH")}`
                                }
                              </span>
                            )}
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

      {/* Remark Modal */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-60 overflow-hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
              <div className="p-6">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Add Remark
                </h3>

                {pendingAction && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Action:</span>{" "}
                      {pendingAction.action.includes("approve")
                        ? "✓ Approve"
                        : "✗ Reject"}{" "}
                      ({pendingAction.action.split("-")[1]})
                      {pendingAction.isBulk && (
                        <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded-full">
                          Bulk Action ({pendingAction.selectedItems?.length}{" "}
                          items)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your remark here..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  rows={4}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowRemarkModal(false);
                      setPendingAction(null);
                      setRemark("");
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAction}
                    disabled={approvalLoading || !remark.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                        Processing...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalModal;
