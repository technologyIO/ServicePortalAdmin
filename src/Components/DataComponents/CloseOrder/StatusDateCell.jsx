import React, { useState } from "react";
import moment from "moment";
import axios from "axios";

const StatusDateCell = ({
  proposal,
  onStatusUpdate,
  fetchProposals,
  cnoteNumber,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    proposal.Cmcncmcsostatus || "Open"
  );
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = () => {
    // Only allow opening modal if status is 'Open' AND no cnoteNumber
    if (
      (proposal.Cmcncmcsostatus || "").toLowerCase() === "open" &&
      !cnoteNumber
    ) {
      setModalOpen(true);
      setSelectedStatus(proposal.Cmcncmcsostatus || "Open");
      setRemark("");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStatus(proposal.Cmcncmcsostatus || "Open");
    setRemark("");
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    // Clear remark if status is not Dropped
    if (e.target.value !== "Dropped") {
      setRemark("");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        Cmcncmcsostatus: selectedStatus,
      };

      // Add remark only for Dropped status
      if (selectedStatus === "Dropped" && remark.trim()) {
        payload.proposalRemark = remark.trim();
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BASE_URL}/phone/proposal/${proposal._id}/update-proposal-status`,
        payload
      );

      if (response.data.success) {
        // Update parent component
        onStatusUpdate(proposal._id, selectedStatus, remark);
        closeModal();
        fetchProposals();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800 border border-green-200";
      case "dropped":
        return "bg-red-100 text-red-800 border border-red-200";
      case "closed_won":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const isDroppedWithoutRemark = selectedStatus === "Dropped" && !remark.trim();
  const isClickable =
    (proposal.Cmcncmcsostatus || "").toLowerCase() === "open" && !cnoteNumber;

  return (
    <>
      <td
        className={`p-3 ${
          isClickable
            ? "cursor-pointer hover:bg-gray-50"
            : "opacity-50 cursor-not-allowed"
        }`}
        onClick={isClickable ? openModal : undefined}
        title={
          cnoteNumber ? "Status change disabled: CNote already generated" : ""
        }
      >
        <div className="text-xs">
          {/* Status Badge */}
          <div
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              proposal.Cmcncmcsostatus
            )}`}
          >
            {proposal.Cmcncmcsostatus || "Open"}
          </div>
        </div>
      </td>

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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  isDroppedWithoutRemark || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={handleSave}
                disabled={isDroppedWithoutRemark || loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusDateCell;
