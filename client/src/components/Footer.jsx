import React from "react";
import { Container, Box, Grid, Typography, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import "../css/footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box className="footer-container">
      <Container maxWidth="lg">
        <Grid container spacing={8} className="footer-content">
          {/* About Section */}
          <Grid item xs={12} sm={12} md={4}>
            <Typography variant="h6" className="footer-section-title">
              ABOUT US
            </Typography>
            <Typography variant="body2" className="footer-description">
              Night Life Events portal helps discover and book exclusive night
              venues and events. Join us to experience the best nightlife in
              your city.
            </Typography>
          </Grid>

          {/* Quick Links & Useful Links Side by Side */}
          <Grid item xs={12} sm={12} md={8}>
            <Grid container spacing={4}>
              {/* Quick Links */}
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="h6" className="footer-section-title">
                  QUICK LINKS
                </Typography>
                <Box className="footer-links">
                  <Link href="/" className="footer-link">
                    Home
                  </Link>
                  <Link href="/events" className="footer-link">
                    Events
                  </Link>
                  <Link href="/about" className="footer-link">
                    About
                  </Link>
                  <Link href="/contact" className="footer-link">
                    Contact
                  </Link>
                </Box>
              </Grid>

              {/* Useful Links */}
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="h6" className="footer-section-title">
                  USEFUL LINKS
                </Typography>
                <Box className="footer-links">
                  <Link href="/privacy" className="footer-link">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="footer-link">
                    Terms & Conditions
                  </Link>
                  <Link href="/faq" className="footer-link">
                    FAQ
                  </Link>
                  <Link href="/support" className="footer-link">
                    Support
                  </Link>
                </Box>
              </Grid>

              {/* Dashboards */}
              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="h6" className="footer-section-title">
                  Dashboards
                </Typography>
                <Box className="footer-links">
                  <Link href="/admin/dashboard" className="footer-link">
                    Admin Dashboard
                  </Link>
                  <Link href="/organizer/dashboard" className="footer-link">
                    Organizer Dashboard
                  </Link>
                  <Link href="/user/dashboard" className="footer-link">
                    User Dashboard
                  </Link>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Typography variant="h6" className="footer-section-title">
                  Browse By Category
                </Typography>
                <Box className="footer-links">
                  <Link href="/category/tedx" className="footer-link">
                    TEDx
                  </Link>
                  <Link href="/category/concerts" className="footer-link">
                    Concerts
                  </Link>
                  <Link href="/category/exhibitions" className="footer-link">
                    Exibhitions
                  </Link>
                  <Link href="/category/health-care" className="footer-link">
                    Health & Care
                  </Link>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Follow Us Section */}
        <Box className="footer-follow-section">
          <Typography variant="h6" className="footer-section-title">
            FOLLOW US
          </Typography>
          <Box className="footer-social">
            <Link
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <FacebookIcon />
            </Link>
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <TwitterIcon />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <LinkedInIcon />
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <InstagramIcon />
            </Link>
          </Box>
        </Box>

        {/* Footer Bottom */}
        <Box className="footer-bottom">
          <Typography variant="body2" className="footer-copyright">
            © {currentYear} Night Life Events. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;