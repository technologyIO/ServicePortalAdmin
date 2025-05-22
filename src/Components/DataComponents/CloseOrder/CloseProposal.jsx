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
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

function CloseProposal() {
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
        (proposal) => proposal.status?.toLowerCase() === "completed"
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
            <th>CO Number</th>
            <th>Final Amount</th>
            <th>Created Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => (
            <tr key={proposal._id}>
              <td>{proposal.proposalNumber}</td>
              <td>{proposal.customer?.customername}</td>
              <td>{proposal.discountPercentage}%</td>
              <td>{proposal.CoNumber}</td>
              <td>₹{proposal.finalAmount?.toFixed(2)}</td>
              <td>{moment(proposal.createdAt).format("MMM D, YYYY")}</td>
              <td className=" capitalize flex  items-center  ">
                {" "}
                <div className="text-xs  bg-green-300 px-2 rounded border ">
                  {proposal.status}{" "}
                </div>
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
    </Box>
  );
}

export default CloseProposal;
