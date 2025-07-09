"use client";

import { useState, useEffect } from "react";
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
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.details?.role?.roleName;
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
  // Add this helper function at the top of your component
  const getLatestApprovalStatus = (proposal, itemId, approvalType) => {
    const currentRevision = proposal.revisions.find(
      (rev) => rev.revisionNumber === proposal.currentRevision
    );

    if (!currentRevision?.approvalHistory) return null;

    // Find all approvals for this item and type
    const itemApprovals = currentRevision.approvalHistory.filter(
      (approval) => approval.approvalType === approvalType
    );

    // Sort by date to get the latest one
    itemApprovals.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    return itemApprovals[0] || null;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading proposal details...
          </p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex justify-center items-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-red-600 font-semibold text-lg">
            Failed to load proposal details
          </p>
          <p className="text-gray-500 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const currentRevision = proposal.revisions.find(
    (rev) => rev.revisionNumber === proposal.currentRevision
  );
  const activeRevisionData = proposal.revisions.find(
    (rev) => rev.revisionNumber === activeRevision
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {proposal.proposalNumber}
              </h1>
              <p className="text-gray-600 text-lg">
                Proposal Approval Dashboard
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <span
                className={`px-6 py-3 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                  proposal.status
                )} shadow-sm`}
              >
                <svg
                  className="w-4 h-4 inline mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {proposal.status.charAt(0).toUpperCase() +
                  proposal.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Customer Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
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
                <p className="text-blue-600 font-medium text-sm">Customer</p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {proposal.customer.customername}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <p className="text-green-600 font-medium text-sm">Discount</p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {proposal.discountPercentage}%
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-purple-600 font-medium text-sm">
                  Final Amount
                </p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                ₹{proposal.finalAmount.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-orange-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-orange-600 font-medium text-sm">
                  Last Updated
                </p>
              </div>
              <p className="font-bold text-gray-900 text-lg">
                {new Date(proposal.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {activeRevisionData?.remark && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center mb-3">
                <svg
                  className="w-5 h-5 text-indigo-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <p className="text-indigo-600 font-semibold">Revision Remark</p>
              </div>
              <p className="text-gray-700 font-medium">
                {activeRevisionData.remark}
              </p>
            </div>
          )}
        </div>

        {/* Revisions Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <svg
              className="w-6 h-6 text-blue-600 mr-3"
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
            <h2 className="text-2xl font-bold text-gray-900">
              Revision History
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Revision
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Final Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proposal.revisions.map((rev, index) => (
                  <tr
                    key={rev.revisionNumber}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-900">
                          Rev. {rev.revisionNumber}
                        </span>
                        {rev.revisionNumber === proposal.currentRevision && (
                          <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {proposal.customer.customername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {rev.changes.discountPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ₹{rev.changes.finalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          rev.status
                        )}`}
                      >
                        {rev.status.charAt(0).toUpperCase() +
                          rev.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {rev.changes.remark}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment List */}
        {activeRevisionData && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <svg
                className="w-6 h-6 text-green-600 mr-3"
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
              <h2 className="text-2xl font-bold text-gray-900">
                Equipment List - Revision {activeRevision}
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Material Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dealer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Warranty
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    {activeRevision === proposal.currentRevision && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {proposal.items.map((item, index) => (
                    <tr
                      key={item._id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {item.equipment.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.equipment.materialdescription}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {item.equipment.materialcode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.equipment.dealer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-semibold">
                            {item.warrantyType}
                          </div>
                          <div className="text-gray-600 text-nowrap">
                            {item.years} year(s)
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₹{item.pricePerYear.toFixed(2)}/year
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {["RSH", "NSH"].map((type) => {
                            const approval = getLatestApprovalStatus(
                              proposal,
                              item._id,
                              type
                            );
                            const isApproved =
                              item[`${type}Approval`]?.approved;
                            const isRejected = approval?.status === "rejected";

                            return (
                              <span
                                key={type}
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  isApproved
                                    ? "bg-green-100 text-green-800"
                                    : isRejected
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {type}:{" "}
                                {isApproved
                                  ? "Approved"
                                  : isRejected
                                  ? "Rejected"
                                  : "Pending"}
                                {isRejected && (
                                  <span
                                    title={`Rejected by ${approval.changedBy} - ${approval.remark}`}
                                    className="ml-1 cursor-help"
                                  >
                                    ⓘ
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      {activeRevision === proposal.currentRevision && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-2">
                              {currentUserRole === "RSH" && (
                                <button
                                  onClick={() => handleApprove("RSH", item._id)}
                                  disabled={
                                    approvalLoading ||
                                    item.RSHApproval?.approved ||
                                    getLatestApprovalStatus(
                                      proposal,
                                      item._id,
                                      "RSH"
                                    )?.status === "rejected"
                                  }
                                  className={`px-4 py-2 bg-gradient-to-r ${
                                    item.RSHApproval?.approved
                                      ? "from-gray-400 to-gray-500 cursor-not-allowed"
                                      : getLatestApprovalStatus(
                                          proposal,
                                          item._id,
                                          "RSH"
                                        )?.status === "rejected"
                                      ? "from-gray-400 to-gray-500 cursor-not-allowed"
                                      : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                                  } text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg`}
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
                                  ) : item.RSHApproval?.approved ? (
                                    "RSH Approved"
                                  ) : getLatestApprovalStatus(
                                      proposal,
                                      item._id,
                                      "RSH"
                                    )?.status === "rejected" ? (
                                    "RSH Rejected"
                                  ) : (
                                    "RSH Approve"
                                  )}
                                </button>
                              )}
                              {currentUserRole === "NSH" && (
                                <button
                                  onClick={() => handleApprove("NSH", item._id)}
                                  disabled={
                                    approvalLoading ||
                                    item.NSHApproval?.approved ||
                                    getLatestApprovalStatus(
                                      proposal,
                                      item._id,
                                      "NSH"
                                    )?.status === "rejected"
                                  }
                                  className={`px-4 py-2 bg-gradient-to-r ${
                                    item.NSHApproval?.approved
                                      ? "from-gray-400 to-gray-500 cursor-not-allowed"
                                      : getLatestApprovalStatus(
                                          proposal,
                                          item._id,
                                          "NSH"
                                        )?.status === "rejected"
                                      ? "from-gray-400 to-gray-500 cursor-not-allowed"
                                      : "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                  } text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg`}
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
                                  ) : item.NSHApproval?.approved ? (
                                    "NSH Approved"
                                  ) : getLatestApprovalStatus(
                                      proposal,
                                      item._id,
                                      "NSH"
                                    )?.status === "rejected" ? (
                                    "NSH Rejected"
                                  ) : (
                                    "NSH Approve"
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {currentUserRole === "RSH" &&
                                !item.RSHApproval?.approved &&
                                getLatestApprovalStatus(
                                  proposal,
                                  item._id,
                                  "RSH"
                                )?.status !== "rejected" && (
                                  <button
                                    onClick={() =>
                                      openRejectModal("RSH", item._id)
                                    }
                                    disabled={rejectLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    RSH Reject
                                  </button>
                                )}
                              {currentUserRole === "NSH" &&
                                !item.NSHApproval?.approved &&
                                getLatestApprovalStatus(
                                  proposal,
                                  item._id,
                                  "NSH"
                                )?.status !== "rejected" && (
                                  <button
                                    onClick={() =>
                                      openRejectModal("NSH", item._id)
                                    }
                                    disabled={rejectLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    NSH Reject
                                  </button>
                                )}
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl p-6">
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-white mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h3 className="text-xl font-bold text-white">
                    Reject {rejectModal.type} Approval
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting this approval:
                </p>
                <textarea
                  placeholder="Enter detailed rejection reason..."
                  value={rejectModal.reason}
                  onChange={handleModalReasonChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors duration-200 h-32 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() =>
                    setRejectModal({
                      show: false,
                      type: "",
                      itemId: null,
                      reason: "",
                    })
                  }
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={rejectLoading}
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
                      Processing...
                    </div>
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalApprovalPage;
