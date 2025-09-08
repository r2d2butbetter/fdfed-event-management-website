import React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";

function ContactUs() {
  return (
    <Container
      sx={{
        mt: 5,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,
          borderRadius: 3,
          width: "100%",          
          maxWidth: "1400px",     
          minHeight: "700px",     
          textAlign: "center",
        }}
      >
        <Typography variant="h3" gutterBottom>
          Contact Us
        </Typography>

        <Typography variant="h5" gutterBottom>
          IIT Sricity <br />
          Chittoor <br />
          Andhra Pradesh, India
        </Typography>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>
            Find Us on the Map
          </Typography>

          <Box
            component="iframe"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31029.321156504982!2d80.0227328!3d13.556121599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a4d773f1e0f8721%3A0xadb0842ffc2719e4!2sIndian%20Institute%20of%20Information%20Technology%2C%20Sri%20City%2C%20Chittoor!5e0!3m2!1sen!2sin!4v1757042686222!5m2!1sen!2sin"
            sx={{
              width: "500px",       
              height: "400px",     
              border: 0,
              borderRadius: "10px",
            }}
            allowFullScreen
            loading="lazy"
            title="College Location"
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default ContactUs;
