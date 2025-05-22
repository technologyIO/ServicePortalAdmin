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
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function OpenProposal() {
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

      // Filter out proposals with status "completed"
      const filteredProposals = res.data.filter(
        (proposal) => proposal.status?.toLowerCase() !== "completed"
      );

      setProposals(filteredProposals);
    } catch (error) {
      console.error("Fetch proposals error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch proposals");
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

  const handlePreviousPage = () => page > 1 && setPage(page - 1);
  const handleNextPage = () => page < totalPages && setPage(page + 1);

  const handleCloseProposal = async (proposalId, CoNumber) => {
    try {
      // Validate CoNumber
      if (!CoNumber || CoNumber.trim() === "") {
        toast.error("Please enter a valid CO Number");
        return;
      }

      // Make API call to update CoNumber and status
      const response = await api.put(
        `/phone/proposal/${proposalId}/update-conumber`,
        {
          CoNumber: CoNumber,
        }
      );

      // Show success toast
      toast.success("Proposal closed successfully");

      // Refresh the proposals list
      fetchProposals();

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error closing proposal:", error);
      toast.error(error.response?.data?.message || "Failed to close proposal");
    }
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
            <th className="">CNote</th>
            <th>Quote</th>
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
                  <Button
                    className="text-white    col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2 "
                    size="sm"
                    onClick={() => handleOpenApprovalModal(proposal)}
                  >
                    Close
                  </Button>
                </Box>
              </td>
              <td className="">
                <button className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-cloud-arrow-down"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"
                    />
                    <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                  </svg>
                </button>
              </td>
              <td>
                <button className="border p-[7px] bg-blue-700 text-white rounded cursor-pointer hover:bg-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-cloud-arrow-down"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.646 10.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.293V5.5a.5.5 0 0 0-1 0v3.793L6.354 8.146a.5.5 0 1 0-.708.708z"
                    />
                    <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                  </svg>
                </button>
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
                  <th>CO Number</th>
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
                      <input
                        className="bg-gray-200 w-[150px] h-8 rounded px-2"
                        placeholder="Add CO Number"
                        value={item.coNumber || ""}
                        onChange={(e) => {
                          // Update the local state with the CoNumber
                          const updatedItems = selectedProposal.items.map((i) =>
                            i._id === item._id
                              ? { ...i, coNumber: e.target.value }
                              : i
                          );
                          setSelectedProposal({
                            ...selectedProposal,
                            items: updatedItems,
                          });
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="text-white ml-2 col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                        onClick={() =>
                          handleCloseProposal(
                            selectedProposal._id,
                            item.coNumber
                          )
                        }
                      >
                        Close
                      </button>
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

export default OpenProposal;
