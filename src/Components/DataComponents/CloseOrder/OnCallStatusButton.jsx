import React, { useState } from "react";
import axios from "axios";

const StatusButton = ({
  onCallId,
  currentStatus,
  onStatusUpdate,
  getStatusColor,
  fetchOnCalls,
  cnoteNumber,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    if (currentStatus.toLowerCase() === "open") {
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

      // Add remark only for Dropped status
      if (selectedStatus === "Dropped" && remark.trim()) {
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
        fetchOnCalls();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDroppedWithoutRemark = selectedStatus === "Dropped" && !remark.trim();

  return (
    <>
      {/* Status Button */}
      <button
        className={`px-5 py-3 rounded text-xs font-medium transition-colors duration-200 
    ${
      currentStatus?.toLowerCase() === "open" && !cnoteNumber
        ? `${getStatusColor(currentStatus)} cursor-pointer hover:opacity-80`
        : "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed"
    }`}
        onClick={openModal}
        disabled={currentStatus?.toLowerCase() !== "open" || !!cnoteNumber}
      >
        {currentStatus || "--"}
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Change Proposal Status
            </h3>

            {/* Status Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={handleStatusChange}
                disabled={loading}
              >
                <option value="Open">Open</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {/* Remark Textarea - Only show for Dropped status */}
            {selectedStatus === "Dropped" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please provide reason for dropping..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  disabled={loading}
                />
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
                className={`px-6 py-3 rounded-md transition duration-200 ${
                  isDroppedWithoutRemark || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleSave}
                disabled={isDroppedWithoutRemark || loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusButton;
