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
} from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import moment from "moment";

// Create axios instance with base configuration
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
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
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

  const handleOpenApprovalModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowApprovalModal(true);
  };

  const handleOpenViewModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
  };
  console.log("User ID ", userId);
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

      // Perform the approval call
      await api.put(endpoint, payload);

      // Re-fetch the list so the approved item stays visible
      await fetchProposals();

      // Close modal and notify user
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

  const handlePreviousPage = () => page > 1 && setPage(page - 1);
  const handleNextPage = () => page < totalPages && setPage(page + 1);

  const getStatusChip = (status) => {
    const statusMap = {
      approved: { color: "success", variant: "solid" },
      rejected: { color: "danger", variant: "solid" },
      pending: { color: "warning", variant: "soft" },
    };

    return (
      <Chip
        color={statusMap[status]?.color}
        variant={statusMap[status]?.variant}
      >
        {status}
      </Chip>
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
    <Box  >
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
          className="text-white    col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 "
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
            <th>Customer</th>
            <th>Discount</th>
            <th>Final Amount</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => (
            <tr key={proposal._id}>
              <td>{proposal.proposalNumber}</td>
              <td>{proposal.customer?.customername}</td>
              <td>{proposal.discountPercentage}%</td>
              <td>₹{proposal.finalAmount?.toFixed(2)}</td>
              <td>{moment(proposal.createdAt).format("MMM D, YYYY")}</td>
              <td>
                <Box display="flex" gap={1}>
                  <button
                    className="text-white    col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 "
                    size="sm"
                    variant="outlined"
                    onClick={() => handleOpenViewModal(proposal)}
                  >
                    View
                  </button>
                  <Button
                    className="text-white    col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 "
                    size="sm"
                    onClick={() => handleOpenApprovalModal(proposal)}
                  >
                    Edit
                  </Button>
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
                className="text-white    col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 "
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
          className="w-[1000px] overflow-y-auto"
          sx={{ maxWidth: "1200px" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography level="h4">
              Approve Proposal - {selectedProposal?.proposalNumber}
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

          {/* Equipment Table */}
          <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table stickyHeader>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Code</th>
                  <th>Warranty</th>
                  <th>Price</th>
                  <th>RSH Status</th>
                  <th>NSH Status</th>
                  <th>Actions</th>
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
                      <Box display="flex" gap={1}>
                        {!item.RSHApproval?.approved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove("RSH", item._id)}
                            disabled={
                              item.RSHApproval?.approved || approvalLoading
                            }
                            loading={approvalLoading}
                          >
                            Approve RSH
                          </Button>
                        )}
                        {!item.NSHApproval?.approved && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove("NSH", item._id)}
                            disabled={
                              item.NSHApproval?.approved || approvalLoading
                            }
                            loading={approvalLoading}
                          >
                            Approve NSH
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </ModalDialog>
      </Modal>

      {/* View Modal */}
      <Modal open={showViewModal} onClose={handleCloseModal}>
        <ModalDialog size="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography level="h4">
              View Proposal - {selectedProposal?.proposalNumber}
            </Typography>
            <Button variant="plain" onClick={handleCloseModal}>
              ✕
            </Button>
          </Box>

          <Typography>
            This is the view-only modal. Detailed content will be added here.
          </Typography>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default QuoteApproval;
