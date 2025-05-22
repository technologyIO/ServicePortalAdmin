import React, { useEffect, useState } from "react";
import FormControl from "@mui/joy/FormControl";
import Input from "@mui/joy/Input";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Button, Divider, Stack, Typography } from "@mui/joy";
import Swal from "sweetalert2";
import axios from "axios";
import ApprovalModal from "./ApprovalModal";
import ViewModal from "./ViewModal";
import ProposalsTable from "./ProposalsTable";
import { getStatusChip } from "./utils";

const api = axios.create({
  baseURL:process.env.REACT_APP_BASE_URL,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const limit = 10;

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
  console.log("userId", userId);
  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/phone/proposal?page=${page}&limit=${limit}`);
      const filteredProposals = res.data.filter(
        (proposal) => proposal.discountPercentage > 5
      );
      setProposals(filteredProposals);
      setDisplayProposals(processProposals(filteredProposals));
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

  const processProposals = (proposals) => {
    const displayData = [];
    proposals.forEach((proposal) => {
      if (proposal.revisions && proposal.revisions.length > 0) {
        proposal.revisions.forEach((rev) => {
          displayData.push({
            ...proposal,
            revisionData: rev,
            isCurrentRevision: rev.revisionNumber === proposal.currentRevision,
            ...rev.changes,
            status: rev.status,
            items: proposal.items.map((item) => ({
              ...item,
              ...(rev.changes?.items?.find((i) => i._id === item._id) || {}),
            })),
          });
        });
      } else {
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
    return displayData;
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
      setDisplayProposals(processProposals(filteredProposals));
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
    const revisionData = {
      ...proposal,
      ...proposal.revisionData?.changes,
      status: proposal.revisionData?.status || proposal.status,
      items: proposal.items.map((item) => {
        return {
          ...item,
          ...(proposal.revisionData?.changes?.items?.find(
            (i) => i._id === item._id
          ) || {}),
        };
      }),
    };

    setSelectedProposal(revisionData);
    setSelectedRevision(proposal.revisionData);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowApprovalModal(false);
    setShowViewModal(false);
    setSelectedProposal(null);
    setSelectedRevision(null);
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
      <ProposalsTable
        proposals={displayProposals}
        onView={handleOpenViewModal}
        onEdit={handleOpenApprovalModal}
        getStatusChip={getStatusChip}
      />

      {/* Pagination */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Button
          variant="outlined"
          onClick={() => page > 1 && setPage(page - 1)}
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
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </Box>

      {/* Modals */}
      <ApprovalModal
        open={showApprovalModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        setProposal={setSelectedProposal}
        userId={userId}
        fetchProposals={fetchProposals}
      />

      <ViewModal
        open={showViewModal}
        onClose={handleCloseModal}
        proposal={selectedProposal}
        revision={selectedRevision}
      />
    </Box>
  );
}

export default QuoteApproval;
