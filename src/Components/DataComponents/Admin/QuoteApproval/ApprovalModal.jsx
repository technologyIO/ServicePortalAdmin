import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  Button,
  Box,
  Typography,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
  Chip,
  Table,
} from "@mui/joy";
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
  //   const [proposal, setProposal] = useState(initialProposal);
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

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="lg"
        sx={{
          maxWidth: "1200px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography level="h4">
            {proposal?.proposalNumber} - Revision {proposal?.currentRevision}
          </Typography>
          <Button variant="plain" onClick={onClose}>
            ✕
          </Button>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ overflowY: "auto", flex: 1, pr: 1 }}>
          {/* Customer Information */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.level1",
              borderRadius: "sm",
            }}
          >
            <Typography level="h6" mb={1}>
              Customer Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={3}>
              <Box>
                <Typography fontWeight="bold">Name:</Typography>
                <Typography>
                  {proposal?.customer?.customername || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">Contact:</Typography>
                <Typography>
                  {proposal?.customer?.telephone || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">Email:</Typography>
                <Typography>{proposal?.customer?.email || "N/A"}</Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">City:</Typography>
                <Typography>{proposal?.customer?.city || "N/A"}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Revision History */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.level1",
              borderRadius: "sm",
            }}
          >
            <Typography level="h6">Revision History</Typography>
            <Divider sx={{ my: 1 }} />
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
            >
              <TabList>
                {proposal?.revisions?.map((revision, index) => (
                  <Tab key={index}>
                    Rev. {revision.revisionNumber}
                    {revision.revisionNumber === proposal.currentRevision && (
                      <Chip size="sm" color="primary" sx={{ ml: 1 }}>
                        Current
                      </Chip>
                    )}
                  </Tab>
                ))}
              </TabList>

              {proposal?.revisions?.map((revision, index) => (
                <TabPanel key={index} value={index}>
                  <Typography>
                    <strong>Date:</strong>{" "}
                    {moment(revision.revisionDate).format("MMM D, YYYY h:mm A")}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> {getStatusChip(revision.status)}
                  </Typography>
                  {revision.changes?.remark && (
                    <Typography>
                      <strong>Remark:</strong> {revision.changes.remark}
                    </Typography>
                  )}
                  {renderApprovalHistory(revision.approvalHistory)}
                </TabPanel>
              ))}
            </Tabs>
          </Box>

          {/* Equipment Table */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "sm",
              overflow: "hidden",
            }}
          >
            <Box sx={{ overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 1000 }}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Code</th>
                    <th>Warranty</th>
                    <th>Price</th>
                    <th>RSH Status</th>
                    <th>NSH Status</th>
                    <th>Approve</th>
                    <th className="w-[300px] text-right">Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal?.items?.map((item) => (
                    <tr key={item._id}>
                      <td>{item.equipment?.materialdescription}</td>
                      <td>{item.equipment?.materialcode}</td>
                      <td>
                        {item.years} year(s) {item.warrantyType}
                      </td>
                      <td>₹{item.subtotal?.toFixed(2)}</td>
                      <td>
                        <Chip
                          color={
                            item.RSHApproval?.approved ? "success" : "neutral"
                          }
                          variant={
                            item.RSHApproval?.approved ? "solid" : "outlined"
                          }
                        >
                          {item.RSHApproval?.approved ? "Approved" : "Pending"}
                        </Chip>
                      </td>
                      <td>
                        <Chip
                          color={
                            item.NSHApproval?.approved ? "success" : "neutral"
                          }
                          variant={
                            item.NSHApproval?.approved ? "solid" : "outlined"
                          }
                        >
                          {item.NSHApproval?.approved ? "Approved" : "Pending"}
                        </Chip>
                      </td>
                      <td>
                        <Box display="flex" gap={1} flexDirection="column">
                          {!item.RSHApproval?.approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove("RSH", item._id)}
                              disabled={approvalLoading}
                              loading={approvalLoading}
                              fullWidth
                            >
                              Approve RSH
                            </Button>
                          )}
                          {!item.NSHApproval?.approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApprove("NSH", item._id)}
                              disabled={approvalLoading}
                              loading={approvalLoading}
                              fullWidth
                            >
                              Approve NSH
                            </Button>
                          )}
                        </Box>
                      </td>
                      <td>
                        <div className="flex items-center gap-3 ">
                          <input
                            size="sm"
                            placeholder="Reason"
                            className="w-[200px] h-8 p-2 bg-gray-100 rounded "
                            value={item.rejectReason || ""}
                            onChange={(e) =>
                              handleRejectReasonChange(item._id, e.target.value)
                            }
                            sx={{ mb: 1 }}
                          />
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => handleReject("RSH", item._id)}
                            disabled={
                              !item.rejectReason?.trim() || rejectLoading
                            }
                            loading={rejectLoading}
                            fullWidth
                            className="text-nowrap"
                          >
                            Reject (RSH)
                          </Button>
                          {proposal?.discountPercentage > 10 && (
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleReject("NSH", item._id)}
                              disabled={
                                !item.rejectReason?.trim() || rejectLoading
                              }
                              loading={rejectLoading}
                              fullWidth
                              className="text-nowrap"
                            >
                              Reject (NSH)
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ApprovalModal;
