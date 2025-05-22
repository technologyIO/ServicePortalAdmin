import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const ProposalApprovalPage = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [itemRejectReasons, setItemRejectReasons] = useState({});
  const [activeRevision, setActiveRevision] = useState(null);
  const [rejectModal, setRejectModal] = useState({
    show: false,
    type: "",
    itemId: null,
    reason: "",
  });
  const [userId, setUserId] = useState(null);

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
    const fetchProposal = async () => {
      try {
        const response = await api.get(`/phone/proposal/${id}`);
        setProposal(response.data);
        setActiveRevision(response.data.currentRevision);
      } catch (error) {
        console.error("Error fetching proposal:", error);
        Swal.fire("Error!", "Failed to fetch proposal details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleApprove = async (approvalType, itemId = null) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }

    try {
      setApprovalLoading(true);
      const endpoint = `/phone/proposal/${
        proposal._id
      }/approve-${approvalType.toLowerCase()}`;
      const payload = { userId, ...(itemId && { itemId }) };

      await api.put(endpoint, payload);
      const response = await api.get(`/phone/proposal/${id}`);
      setProposal(response.data);

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

  const handleReject = async () => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }

    const { type: approvalType, itemId, reason } = rejectModal;

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
      const response = await api.get(`/phone/proposal/${id}`);
      setProposal(response.data);

      Swal.fire(
        "Rejected!",
        `${approvalType} rejection has been recorded.`,
        "success"
      );
      setRejectModal({ show: false, type: "", itemId: null, reason: "" });
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

  const openRejectModal = (type, itemId = null) => {
    setRejectModal({
      show: true,
      type,
      itemId,
      reason: itemId ? itemRejectReasons[itemId] || "" : "",
    });
  };

  const handleModalReasonChange = (e) => {
    const { value } = e.target;
    setRejectModal((prev) => ({
      ...prev,
      reason: value,
    }));

    if (rejectModal.itemId) {
      setItemRejectReasons((prev) => ({
        ...prev,
        [rejectModal.itemId]: value,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load proposal details</p>
      </div>
    );
  }

  const currentRevision = proposal.revisions.find(
    (rev) => rev.revisionNumber === proposal.currentRevision
  );

  const activeRevisionData = proposal.revisions.find(
    (rev) => rev.revisionNumber === activeRevision
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {proposal.proposalNumber}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              proposal.status === "approved"
                ? "bg-green-100 text-green-800"
                : proposal.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {proposal.status}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Revisions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposal.revisions.map((rev) => (
                  <tr key={rev.revisionNumber}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rev. {rev.revisionNumber}
                      {rev.revisionNumber === proposal.currentRevision && (
                        <span className="ml-2 text-xs text-blue-500">
                          (Current)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {proposal.customer.customername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rev.changes.discountPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{rev.changes.finalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rev.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : rev.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rev.changes.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Customer Name</p>
            <p className="font-medium">{proposal.customer.customername}</p>
          </div>
          <div>
            <p className="text-gray-600">Discount</p>
            <p className="font-medium">{proposal.discountPercentage}%</p>
          </div>
          <div>
            <p className="text-gray-600">Final Amount</p>
            <p className="font-medium">₹{proposal.finalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="font-medium">
              {new Date(proposal.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {activeRevisionData?.remark && (
          <div className="mb-6">
            <p className="text-gray-600">Revision Remark</p>
            <p className="font-medium">{activeRevisionData.remark}</p>
          </div>
        )}
      </div>

      {activeRevisionData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Equipment List - Revision {activeRevision}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dealer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warranty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {activeRevision === proposal.currentRevision && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposal.items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.equipment.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.equipment.materialdescription}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.equipment.materialcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.equipment.dealer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.warrantyType} - {item.years} year(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.pricePerYear.toFixed(2)}/year
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.equipment.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.equipment.status}
                      </span>
                    </td>
                    {activeRevision === proposal.currentRevision && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove("RSH", item._id)}
                              disabled={approvalLoading}
                              className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                            >
                              RSH Approve
                            </button>
                            <button
                              onClick={() => handleApprove("NSH", item._id)}
                              disabled={approvalLoading}
                              className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                            >
                              NSH Approve
                            </button>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openRejectModal("RSH", item._id)}
                              disabled={rejectLoading}
                              className="text-white col-span-2 px-5 md:col-span-1 bg-red-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                            >
                              RSH Reject
                            </button>
                            <button
                              onClick={() => openRejectModal("NSH", item._id)}
                              disabled={rejectLoading}
                              className="text-white col-span-2 px-5 md:col-span-1 bg-red-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                            >
                              NSH Reject
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rejection Modal */}
          {rejectModal.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">
                  Reject {rejectModal.type} Approval
                </h3>
                <textarea
                  placeholder="Enter rejection reason"
                  value={rejectModal.reason}
                  onChange={handleModalReasonChange}
                  className="w-full p-2 border rounded mb-4 h-24"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      setRejectModal({
                        show: false,
                        type: "",
                        itemId: null,
                        reason: "",
                      })
                    }
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    disabled={rejectLoading}
                  >
                    {rejectLoading ? "Processing..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProposalApprovalPage;
