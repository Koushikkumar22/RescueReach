import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  CircularProgress
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import { useLocation } from "wouter";

export default function AuthorityDashboard() {
  const [, navigate] = useLocation();
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["/api/incidents/active"],
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Authority Dashboard
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Review and manage all reported incidents.
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : incidents.length ? (
              incidents.map((incident: any) => (
                <TableRow key={incident.id}>
                  <TableCell>{incident.id}</TableCell>
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={incident.status}
                      color={
                        incident.status === "resolved"
                          ? "success"
                          : incident.status === "reported"
                          ? "error"
                          : "warning"
                      }
                      icon={
                        incident.status === "resolved"
                          ? <DoneIcon />
                          : incident.status === "reported"
                          ? <ErrorIcon />
                          : undefined
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{incident.severity}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="View Incident"
                      color="primary"
                      onClick={() => navigate(`/incident/${incident.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>No incidents reported.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}