import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Security";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", overflowX: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          py: 2,
          px: { xs: 2, md: 6 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircleIcon sx={{ color: "#e11d48" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#e11d48", letterSpacing: 1 }}>
            RescueReach
          </Typography>
        </Box>
        <Button href="#" color="inherit" sx={{ fontWeight: 500 }}>
          Help
        </Button>
      </Box>

      {/* Main */}
      <Container sx={{ pt: 6, pb: 10, minHeight: "70vh" }}>
        <Box textAlign="center" mb={2}>
          <Chip
            label="Live Emergency Response System"
            sx={{
              bgcolor: "#fee2e2",
              color: "#e11d48",
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: 12, md: 15 },
              borderRadius: 2,
              px: 2,
              py: 0.5,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              letterSpacing: -2,
              fontSize: { xs: 32, sm: 40, md: 56 },
              lineHeight: 1.2,
            }}
          >
            Immediate Help,
            <span style={{ color: "#e11d48" }}> When Seconds Count.</span>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              maxWidth: 540,
              margin: "auto",
              color: "#475569",
              fontSize: { xs: 16, md: 18 },
            }}
          >
            RescueReach connects you directly to emergency responders and nearby volunteers. Share your live location and get help instantly.
          </Typography>
        </Box>

        {/* Main Option Cards */}
        <Grid
          container
          spacing={3}
          justifyContent="center"
          sx={{ mt: 6 }}
        >
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
              <PersonIcon sx={{ fontSize: 40, mb: 2, color: "#2563eb", bgcolor: "#eff6ff", borderRadius: "50%", p: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                I need Assistance
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, mt: 0.5, color: "#475569" }}>
                Report an emergency, share location, <br /> and notify family.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#2563eb",
                  fontWeight: 600,
                  fontSize: 16,
                  px: 2,
                  py: 1.5,
                  mt: 2,
                  borderRadius: "12px",
                  textTransform: "none"
                }}
                href="/user"
              >
                Continue as User
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Paper elevation={2} sx={{ p: 4, borderRadius: 4, textAlign: "center" }}>
              <ShieldIcon sx={{ fontSize: 40, mb: 2, color: "#e11d48", bgcolor: "#fff1f2", borderRadius: "50%", p: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Emergency Personnel
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, mt: 0.5, color: "#475569" }}>
                Monitor incidents, dispatch units,<br /> and manage response.
              </Typography>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                fullWidth
                endIcon={<ArrowForwardIcon />}
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  px: 2,
                  py: 1.5,
                  mt: 2,
                  borderRadius: "12px",
                  textTransform: "none"
                }}
                href="/authority"
              >
                Dashboard Access
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ textAlign: "center", pb: 1 }}>
        <Chip
          icon={<CheckCircleIcon sx={{ color: "#22c55e" }} />}
          label="System Operational"
          sx={{
            bgcolor: "#f0fdf4",
            color: "#22c55e",
            px: 2,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 13,
            mb: 1,
          }}
        />
        <Typography sx={{ color: "#64748b", fontSize: 12 }}>
          © 2025 RescueReach Systems. For demo purposes only.
        </Typography>
      </Box>
    </Box>
  );
}