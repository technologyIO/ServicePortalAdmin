import React from "react";
import { Table, Chip, Box, Button } from "@mui/joy";
import moment from "moment";

const ProposalsTable = ({ proposals, onView, onEdit, getStatusChip }) => {
  return (
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
        {[...proposals]
          .filter(proposal => proposal.discountPercentage > 5) // Filter out proposals with 5% or less discount
          .sort((a, b) => {
            const dateA = new Date(a.revisionData?.revisionDate || a.createdAt);
            const dateB = new Date(b.revisionData?.revisionDate || b.createdAt);
            return dateB - dateA;
          })
          .map((proposal) => (
            <tr
              key={`${proposal._id}-${proposal.revisionData?.revisionNumber || 0}`}
            >
              <td>{proposal.proposalNumber}</td>
              <td>
                {proposal.revisionData?.revisionNumber > 0 ? (
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
              <td className="flex flex-wrap">
                {(() => {
                  let bgColor = "bg-gray-200 text-gray-800";
                  if (proposal.status === "approved") {
                    bgColor = "bg-green-200 text-green-800";
                  } else if (proposal.status === "rejected") {
                    bgColor = "bg-red-200 text-red-800";
                  }

                  return (
                    <Chip
                      size="sm"
                      color="primary"
                      className={`${bgColor} capitalize`}
                    >
                      {proposal.status}
                    </Chip>
                  );
                })()}
              </td>
              <td>
                {moment(
                  proposal.revisionData?.revisionDate || proposal.createdAt
                ).format("MMM D, YYYY")}
              </td>
              <td>
                <Box display="flex" gap={1}>
                  <button
                    className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                    size="sm"
                    variant="outlined"
                    onClick={() => onView(proposal)}
                  >
                    View
                  </button>
                  {proposal.isCurrentRevision && (
                    <Button
                      className="text-white col-span-2 px-5 md:col-span-1 bg-blue-700 hover:bg-gradient-to-br focus:outline-none font-medium rounded-[3px] text-sm py-1.5 text-center me-2"
                      size="sm"
                      onClick={() => onEdit(proposal)}
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
  );
};

export default ProposalsTable;