import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import {
  Modal,
  ModalDialog,
  Button,
  Table,
  Typography,
  Box,
  Chip,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Stack,
} from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function QuoteApproval() {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [displayProposals, setDisplayProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectReason, setRejectReason] = useState("");
  const limit = 10;
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/phone/proposal?page=${page}&limit=${limit}`);
      const filteredProposals = res.data.filter(
        (proposal) => proposal.discountPercentage > 5
      );
      setProposals(filteredProposals);

      // Create display proposals with each revision as a separate entry
      const displayData = [];
      filteredProposals.forEach((proposal) => {
        if (proposal.revisions && proposal.revisions.length > 0) {
          proposal.revisions.forEach((rev) => {
            displayData.push({
              ...proposal,
              revisionData: rev,
              isCurrentRevision:
                rev.revisionNumber === proposal.currentRevision,
            });
          });
        } else {
          // If no revisions, just add the main proposal
          displayData.push({
            ...proposal,
            revisionData: {
              revisionNumber: 0,
              status: proposal.status,
              revisionDate: proposal.createdAt,
            },
            isCurrentRevision: true,
          });
        }
      });

      setDisplayProposals(displayData);
      setTotalPages(Math.ceil(filteredProposals.length / limit));
    } catch (error) {
      console.error("Fetch proposals error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to fetch proposals",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [page]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProposals();
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/phone/proposal/search?q=${searchQuery}`);
      const filteredProposals = response.data.filter(
        (proposal) => proposal.discountPercentage > 5
      );
      setProposals(filteredProposals);

      // Create display proposals with each revision as a separate entry
      const displayData = [];
      filteredProposals.forEach((proposal) => {
        if (proposal.revisions && proposal.revisions.length > 0) {
          proposal.revisions.forEach((rev) => {
            displayData.push({
              ...proposal,
              revisionData: rev,
              isCurrentRevision:
                rev.revisionNumber === proposal.currentRevision,
            });
          });
        } else {
          // If no revisions, just add the main proposal
          displayData.push({
            ...proposal,
            revisionData: {
              revisionNumber: 0,
              status: proposal.status,
              revisionDate: proposal.createdAt,
            },
            isCurrentRevision: true,
          });
        }
      });

      setDisplayProposals(displayData);
    } catch (error) {
      console.error("Search error:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Search failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleRejectReasonChange = (itemId, reason) => {
    setSelectedProposal((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item._id === itemId ? { ...item, rejectReason: reason } : item
      ),
    }));
  };
  const handleOpenApprovalModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowApprovalModal(true);
    setActiveTab(proposal.currentRevision - 1);
  };

  const handleOpenViewModal = (proposal) => {
    setSelectedProposal(proposal);
    setSelectedRevision(proposal.revisionData);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
    setSelectedRevision(null);
    setRejectReason("");
    setActiveTab(0);
  };

  const handleApprove = async (approvalType, itemId = null) => {
    if (!userId) {
      Swal.fire("Error!", "User ID not found. Please login again.", "error");
      return;
    }
    if (!selectedProposal?._id) {
      Swal.fire("Error!", "No proposal selected.", "error");
      return;
    }

    try {
      setApprovalLoading(true);
      const endpoint = `/phone/proposal/${
        selectedProposal._id
      }/approve-${approvalType.toLowerCase()}`;
      const payload = { userId, ...(itemId && { itemId }) };

      await api.put(endpoint, payload);
      await fetchProposals();

      handleCloseModal();
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
    if (!selectedProposal?._id) {
      Swal.fire("Error!", "No proposal selected.", "error");
      return;
    }

    // Get the reject reason - either from the item or the general reason
    const reason = itemId
      ? selectedProposal.items.find((item) => item._id === itemId)?.rejectReason
      : rejectReason;

    if (!reason?.trim()) {
      Swal.fire("Error!", "Please enter a rejection reason.", "error");
      return;
    }

    try {
      setRejectLoading(true);
      const endpoint = `/phone/proposal/${selectedProposal._id}/reject-revision`;
      const payload = {
        userId,
        reason,
        approvalType,
        ...(itemId && { itemId }), // Only include itemId if provided
      };

      await api.put(endpoint, payload);
      await fetchProposals();

      handleCloseModal();
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

  const handlePreviousPage = () => page > 1 && setPage(page - 1);
  const handleNextPage = () => page < totalPages && setPage(page + 1);

  const getStatusChip = (status) => {
    const statusMap = {
      approved: { color: "success", variant: "solid" },
      rejected: { color: "danger", variant: "solid" },
      pending: { color: "warning", variant: "soft" },
      draft: { color: "neutral", variant: "outlined" },
      submitted: { color: "primary", variant: "soft" },
      completed: { color: "success", variant: "solid" },
      revised: { color: "info", variant: "soft" },
    };

    return (
      <Chip
        color={statusMap[status]?.color || "neutral"}
        variant={statusMap[status]?.variant || "outlined"}
      >
        {status}
      </Chip>
    );
  };

  const renderApprovalHistory = (history) => {
    if (!history || history.length === 0) {
      return <Typography>No approval history available</Typography>;
    }

    return (
      <Box mt={2}>
        <Typography level="h6">Approval History</Typography>
        <Divider sx={{ my: 1 }} />
        <Stack spacing={1}>
          {history.map((item, index) => (
            <Box
              key={index}
              sx={{ p: 1, bgcolor: "background.level1", borderRadius: "sm" }}
            >
              <Typography>
                <strong>{item.approvalType || "System"}:</strong> {item.status}{" "}
                by {item.changedBy?.name || "System"} on{" "}
                {moment(item.changedAt).format("MMM D, YYYY h:mm A")}
              </Typography>
              {item.remark && (
                <Typography>
                  <strong>Reason:</strong> {item.remark}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="60vh"
      >
        <span className="CustomLoader"></span>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search Bar */}
      <div className="flex gap-3 items-center">
        <FormControl sx={{ flex: 1 }}>
          <Input
            placeholder="Search proposals"
            startDecorator={<SearchIcon />}
            value={searchQuery}
            className="h-8"
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </FormControl>
        <button
          className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Proposals Table */}
      <Table sx={{ mb: 2 }}>
        <thead>
          <tr>
            <th>Proposal #</th>
            <th>Revision</th>
            <th>Customer</th>
            <th>Discount</th>
            <th>Final Amount</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayProposals.map((proposal) => (
            <tr key={`${proposal._id}-${proposal.revisionData.revisionNumber}`}>
              <td>{proposal.proposalNumber}</td>
              <td>
                {proposal.revisionData.revisionNumber > 0 ? (
                  <>
                    Rev. {proposal.revisionData.revisionNumber}
                    {proposal.isCurrentRevision && (
                      <Chip size="sm" color="primary" sx={{ ml: 1 }}>
                        Current
                      </Chip>
                    )}
                  </>
                ) : (
                  "Original"
                )}
              </td>
              <td>{proposal.customer?.customername}</td>
              <td>{proposal.discountPercentage}%</td>
              <td>₹{proposal.finalAmount?.toFixed(2)}</td>
              <td className="flex flex-wrap  ">
                {proposal?.revisions?.map((revision, index) => {
                  let bgColor = "bg-gray-200 text-gray-800"; // default for pending
                  if (revision?.status === "approved") {
                    bgColor = "bg-green-200 text-green-800";
                  } else if (revision?.status === "rejected") {
                    bgColor = "bg-red-200 text-red-800";
                  }

                  return (
                    <span key={index}>
                      <Chip
                        size="sm"
                        color="primary"
                        className={`${bgColor} capitalize`}
                        // sx={{ ml: 1 }}
                      >
                        {revision?.status}
                      </Chip>
                    </span>
                  );
                })}
              </td>

              <td>
                {moment(proposal.revisionData.revisionDate).format(
                  "MMM D, YYYY"
                )}
              </td>
              <td>
                <Box display="flex" gap={1}>
                  <button
                    className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                    size="sm"
                    variant="outlined"
                    onClick={() => handleOpenViewModal(proposal)}
                  >
                    View
                  </button>
                  {proposal.isCurrentRevision && (
                    <Button
                      className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                      size="sm"
                      onClick={() => handleOpenApprovalModal(proposal)}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Button
          variant="outlined"
          onClick={handlePreviousPage}
          disabled={page === 1}
        >
          Previous
        </Button>

        <Box display="flex" gap={1}>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
            )
            .map((p) => (
              <button
                className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                key={p}
                variant={p === page ? "solid" : "outlined"}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
        </Box>

        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Approval Modal */}
      <Modal open={showApprovalModal} onClose={handleCloseModal}>
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
              {selectedProposal?.proposalNumber} - Revision{" "}
              {selectedProposal?.currentRevision}
            </Typography>
            <Button variant="plain" onClick={handleCloseModal}>
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
                    {selectedProposal?.customer?.customername || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold">Contact:</Typography>
                  <Typography>
                    {selectedProposal?.customer?.telephone || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold">Email:</Typography>
                  <Typography>
                    {selectedProposal?.customer?.email || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography fontWeight="bold">City:</Typography>
                  <Typography>
                    {selectedProposal?.customer?.city || "N/A"}
                  </Typography>
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
                  {selectedProposal?.revisions?.map((revision, index) => (
                    <Tab key={index}>
                      Rev. {revision.revisionNumber}
                      {revision.revisionNumber ===
                        selectedProposal.currentRevision && (
                        <Chip size="sm" color="primary" sx={{ ml: 1 }}>
                          Current
                        </Chip>
                      )}
                    </Tab>
                  ))}
                </TabList>

                {selectedProposal?.revisions?.map((revision, index) => (
                  <TabPanel key={index} value={index}>
                    <Typography>
                      <strong>Date:</strong>{" "}
                      {moment(revision.revisionDate).format(
                        "MMM D, YYYY h:mm A"
                      )}
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

            {/* Equipment Table - Everything in one table */}
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
                    {selectedProposal?.items?.map((item) => (
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
                            {item.RSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
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
                            {item.NSHApproval?.approved
                              ? "Approved"
                              : "Pending"}
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
                                handleRejectReasonChange(
                                  item._id,
                                  e.target.value
                                )
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
                            {selectedProposal?.discountPercentage > 10 && (
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

      {/* View Modal - Updated to show only the clicked revision */}
      <Modal open={showViewModal} onClose={handleCloseModal}>
        <ModalDialog
          size="lg"
          sx={{
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography level="h4">
              View Proposal - {selectedProposal?.proposalNumber} - Revision{" "}
              {selectedRevision?.revisionNumber || 0}
            </Typography>
            <Button variant="plain" onClick={handleCloseModal}>
              ✕
            </Button>
          </Box>

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
                  {selectedProposal?.customer?.customername || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">Contact:</Typography>
                <Typography>
                  {selectedProposal?.customer?.telephone || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">Email:</Typography>
                <Typography>
                  {selectedProposal?.customer?.email || "N/A"}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">City:</Typography>
                <Typography>
                  {selectedProposal?.customer?.city || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Revision Details */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "background.level1",
              borderRadius: "sm",
            }}
          >
            <Typography level="h6">Revision Details</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
              <strong>Date:</strong>{" "}
              {moment(
                selectedRevision?.revisionDate || selectedProposal?.createdAt
              ).format("MMM D, YYYY h:mm A")}
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              {getStatusChip(
                selectedRevision?.status || selectedProposal?.status
              )}
            </Typography>
            {selectedRevision?.changes?.remark && (
              <Typography>
                <strong>Remark:</strong> {selectedRevision.changes.remark}
              </Typography>
            )}
            {renderApprovalHistory(selectedRevision?.approvalHistory)}
          </Box>

          {/* Equipment Table */}
          <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Code</th>
                  <th>Warranty</th>
                  <th>Price</th>
                  <th>RSH Status</th>
                  <th>NSH Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedProposal?.items?.map((item) => (
                  <tr key={item._id}>
                    <td>{item.equipment?.materialdescription}</td>
                    <td>{item.equipment?.materialcode}</td>
                    <td>
                      {item.years} year(s) {item.warrantyType}
                    </td>
                    <td>₹{item.subtotal?.toFixed(2)}</td>
                    <td>
                      {item.RSHApproval?.approved ? (
                        <>
                          <Chip color="success" variant="solid">
                            Approved
                          </Chip>
                          <Typography variant="body2">
                            By: {item.RSHApproval.approvedBy?.name || "Unknown"}
                          </Typography>
                          <Typography variant="body2">
                            On:{" "}
                            {moment(item.RSHApproval.approvedAt).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </Typography>
                        </>
                      ) : (
                        <Chip color="neutral" variant="outlined">
                          Pending
                        </Chip>
                      )}
                    </td>
                    <td>
                      {item.NSHApproval?.approved ? (
                        <>
                          <Chip color="success" variant="solid">
                            Approved
                          </Chip>
                          <Typography variant="body2">
                            By: {item.NSHApproval.approvedBy?.name || "Unknown"}
                          </Typography>
                          <Typography variant="body2">
                            On:{" "}
                            {moment(item.NSHApproval.approvedAt).format(
                              "MMM D, YYYY h:mm A"
                            )}
                          </Typography>
                        </>
                      ) : (
                        <Chip color="neutral" variant="outlined">
                          Pending
                        </Chip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default QuoteApproval;
