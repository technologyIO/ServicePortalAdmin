import React from "react";
import {
  Modal,
  ModalDialog,
  Button,
  Box,
  Typography,
  Divider,
  Stack,
  Chip,
  Table,
} from "@mui/joy";
import { renderApprovalHistory, getStatusChip } from "./utils";
import moment from "moment";

const ViewModal = ({ open, onClose, proposal, revision }) => {
  return (
    <Modal
    
      open={open}
      onClose={onClose}
    >
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
            View Proposal - {proposal?.proposalNumber} - Revision{" "}
            {revision?.revisionNumber || 0}
          </Typography>
          <Button variant="plain" onClick={onClose}>
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
                {proposal?.customer?.customername || "N/A"}
              </Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">Contact:</Typography>
              <Typography>{proposal?.customer?.telephone || "N/A"}</Typography>
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
            {moment(revision?.revisionDate || proposal?.createdAt).format(
              "MMM D, YYYY h:mm A"
            )}
          </Typography>
          <Typography>
            <strong>Status:</strong>{" "}
            {getStatusChip(revision?.status || proposal?.status)}
          </Typography>
          {revision?.changes?.remark && (
            <Typography>
              <strong>Remark:</strong> {revision.changes.remark}
            </Typography>
          )}
          {renderApprovalHistory(revision?.approvalHistory)}
        </Box>

        {/* Summary Information */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: "background.level1",
            borderRadius: "sm",
          }}
        >
          <Typography level="h6">Summary</Typography>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box>
              <Typography fontWeight="bold">Discount:</Typography>
              <Typography>{proposal?.discountPercentage}%</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">TDS:</Typography>
              <Typography>{proposal?.tdsPercentage}%</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">GST:</Typography>
              <Typography>{proposal?.gstPercentage}%</Typography>
            </Box>
            <Box>
              <Typography fontWeight="bold">Final Amount:</Typography>
              <Typography>₹{proposal?.finalAmount?.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Equipment Table */}
        <Box sx={{ mb: 3 }}>
          <Typography level="h6" mb={1}>
            Equipment Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
            <Table borderAxis="bothBetween" sx={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: "25%" }}>Description</th>
                  <th style={{ width: "10%" }}>Code</th>
                  <th style={{ width: "10%" }}>Dealer</th>
                  <th style={{ width: "15%" }}>Warranty</th>
                  <th style={{ width: "10%" }}>Price</th>
                  <th style={{ width: "15%" }}>RSH Status</th>
                  <th style={{ width: "15%" }}>NSH Status</th>
                </tr>
              </thead>
              <tbody>
                {proposal?.items?.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <Typography fontWeight="lg">
                        {item.equipment?.name}
                      </Typography>
                      <Typography level="body2">
                        {item.equipment?.materialdescription}
                      </Typography>
                    </td>
                    <td>{item.equipment?.materialcode}</td>
                    <td>{item.equipment?.dealer}</td>
                    <td>
                      <Box>
                        <Typography>{item.years} year(s)</Typography>
                        <Typography level="body2">
                          {item.warrantyType}
                        </Typography>
                      </Box>
                    </td>
                    <td>₹{item.subtotal?.toFixed(2)}</td>
                    <td>
                      {item.RSHApproval?.approved ? (
                        <Box>
                          <Chip color="success" variant="solid" size="sm">
                            Approved
                          </Chip>
                          <Typography level="body2" mt={0.5}>
                            By: {item.RSHApproval.approvedBy?.name || "Unknown"}
                          </Typography>
                          <Typography level="body2">
                            On:{" "}
                            {moment(item.RSHApproval.approvedAt).format(
                              "MMM D, YYYY"
                            )}
                          </Typography>
                          {item.RSHApproval.remark && (
                            <Typography level="body2">
                              Remark: {item.RSHApproval.remark}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Chip color="neutral" variant="outlined" size="sm">
                          Pending
                        </Chip>
                      )}
                    </td>
                    <td>
                      {item.NSHApproval?.approved ? (
                        <Box>
                          <Chip color="success" variant="solid" size="sm">
                            Approved
                          </Chip>
                          <Typography level="body2" mt={0.5}>
                            By: {item.NSHApproval.approvedBy?.name || "Unknown"}
                          </Typography>
                          <Typography level="body2">
                            On:{" "}
                            {moment(item.NSHApproval.approvedAt).format(
                              "MMM D, YYYY"
                            )}
                          </Typography>
                          {item.NSHApproval.remark && (
                            <Typography level="body2">
                              Remark: {item.NSHApproval.remark}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Chip color="neutral" variant="outlined" size="sm">
                          Pending
                        </Chip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ViewModal;
