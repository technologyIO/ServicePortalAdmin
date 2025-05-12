import { Chip } from "@mui/joy";
import moment from "moment";
import { Box, Typography, Divider, Stack } from "@mui/joy";

export const getStatusChip = (status) => {
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

export const renderApprovalHistory = (history) => {
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
              <strong>{item.approvalType || "System"}:</strong> {item.status} by{" "}
              {item.changedBy?.name || "System"} on{" "}
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