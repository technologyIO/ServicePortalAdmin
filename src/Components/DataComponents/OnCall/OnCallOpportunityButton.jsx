import React, { useState } from "react";
import axios from "axios";

const OnCallOpportunityButton = ({
  onCallId,
  currentStatus,
  onStatusUpdate,
  fetchCustomersWithOnCalls,
  cnoteNumber,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    if (currentStatus?.toLowerCase() === "open") {
      setModalOpen(true);
      setSelectedStatus(currentStatus);
      setRemark("");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStatus(currentStatus);
    setRemark("");
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    // Clear remark if status changes back to Open
    if (e.target.value === "Open") {
      setRemark("");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        onCallproposalstatus: selectedStatus,
      };

      // Add remark only for Lost status
      if (selectedStatus === "Lost" && remark.trim()) {
        payload.proposalRemark = remark.trim();
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/phone/oncall/${onCallId}/update-proposal-status`,
        payload
      );

      if (response.data.success) {
        // Update parent component
        onStatusUpdate(onCallId, selectedStatus, remark);
        closeModal();
        fetchCustomersWithOnCalls();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLostWithoutRemark = selectedStatus === "Lost" && !remark.trim();

  return (
    <>
      {/* OnCall Opportunity Button */}
      <button
        className={`px-3 py-2 rounded border mt-2 flex items-center transition-colors duration-200 text-sm font-medium
    ${
      currentStatus?.toLowerCase() === "open" && !cnoteNumber
        ? "bg-gray-200 text-gray-800 border-gray-200 hover:bg-gray-300 cursor-pointer"
        : "bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed"
    }`}
        onClick={openModal}
        disabled={currentStatus?.toLowerCase() !== "open" || !!cnoteNumber}
        title={
          currentStatus?.toLowerCase() === "open" && !cnoteNumber
            ? "Click to change status"
            : !!cnoteNumber
            ? "Status cannot be changed because CNote is already generated"
            : "Status cannot be changed"
        }
      >
        {currentStatus || "--"}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Change OnCall Opportunity Status
            </h3>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={handleStatusChange}
                disabled={loading}
              >
                <option value="Open">Open</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Remark Textarea - Only show for Lost status */}
            {selectedStatus === "Lost" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please provide reason for marking as Lost..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Remark is required when marking opportunity as Lost
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition duration-200"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  isLostWithoutRemark || loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleSave}
                disabled={isLostWithoutRemark || loading}
              >
                {loading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OnCallOpportunityButton;
