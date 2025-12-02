import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import "../css/conatctUs.css";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace with your API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="contact-container">
      <Paper className="contact-paper">
        <Typography variant="h3" className="contact-title">
          Contact Us
        </Typography>

        <Grid container spacing={4}>
          {/* Contact Information - left column */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" className="section-heading">
              Get in Touch
            </Typography>

            {/* contact-info-box now row-flex */}
            <div style={{ display: "flex", justifyContent: "space-around", gap: "20px", width: "70vw", flexWrap: "wrap" }}>
              <Box className="contact-info-box" style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "250px" }}>
                <LocationOnIcon className="contact-info-icon" />
                <Box className="contact-info-text">
                  <h4>Address</h4>
                  <p>
                    IIT Sricity, Chittoor
                    <br />
                    Andhra Pradesh, India
                  </p>
                </Box>
              </Box>

              <Box className="contact-info-box" style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "250px" }}>
                <EmailIcon className="contact-info-icon" />
                <Box className="contact-info-text">
                  <h4>Email</h4>
                  <p>contact@iitsricity.ac.in</p>
                </Box>
              </Box>

              <Box className="contact-info-box" style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "250px" }}>
                <PhoneIcon className="contact-info-icon" />
                <Box className="contact-info-text">
                  <h4>Phone</h4>
                  <p>+91 (0) 9876543210</p>
                </Box>
              </Box>
            </div>
            <Box className="follow-under-map" sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <Typography variant="subtitle1" sx={{ color: "#333", fontWeight: 700, color: "rgba(0,0,0,0.7)" }}>
                  FOLLOW US
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <MuiLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", bgcolor: "rgba(0,0,0,0.08)", width: 44, height: 44, borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "#4267B2" }}>
                    <FacebookIcon />
                  </MuiLink>
                  <MuiLink href="https://twitter.com" target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", bgcolor: "rgba(0,0,0,0.08)", width: 44, height: 44, borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "#1DA1F2" }}>
                    <TwitterIcon />
                  </MuiLink>
                  <MuiLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", bgcolor: "rgba(0,0,0,0.08)", width: 44, height: 44, borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "#0A66C2" }}>
                    <LinkedInIcon />
                  </MuiLink>
                  <MuiLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", bgcolor: "rgba(0,0,0,0.08)", width: 44, height: 44, borderRadius: "50%", alignItems: "center", justifyContent: "center", color: "#C13584" }}>
                    <InstagramIcon />
                  </MuiLink>
                </Box>
              </Box>
          </Grid>

          {/* Map full width */}
          <Grid item xs={12}>
            <Box className="map-container" style={{ width: "70vw" }}>
              <h2>Find Us on the Map</h2>
              <Box
                component="iframe"
                className="map-iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31029.321156504982!2d80.0227328!3d13.556121599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d773f1e0f8721%3A0xadb0842ffc2719e4!2sIndian%20Institute%20of%20Information%20Technology%2C%20Sri%20City%2C%20Chittoor!5e0!3m2!1sen!2sin!4v1757042686222!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                title="College Location"
                style={{ width: "100%", height: 300, border: 0, borderRadius: 8 }}
              />
              {/* Follow Us placed directly under the map */}
              
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default ContactUs;