# Simple React + MUI Styling Guide

## Overview
This project uses Material-UI (MUI) components with a simple approach - no complex theming, just MUI defaults + your own CSS files when needed.

## Directory Structure

```
src/
├── assets/                 # Static assets
│   ├── images/            # Image files (logos, photos, etc.)
│   └── icons/             # Custom icon files (SVG, PNG)
├── components/            # Reusable UI components
│   └── MyComponent/
│       ├── MyComponent.jsx
│       └── MyComponent.css  # Component-specific CSS
├── context/               # React context providers
├── pages/                 # Page components
│   └── HomePage/
│       ├── HomePage.jsx
│       └── HomePage.css     # Page-specific CSS
└── utils/                 # Utility functions
```

## Simple Styling Approach

### 1. Use MUI Components + CSS Files
- Use MUI components for UI elements
- Create `.css` files alongside your `.jsx` files
- Import CSS in your components
- Use both `className` and `sx` prop as needed

### 2. Example Component Setup

**File: `src/components/CustomCard/CustomCard.jsx`**
```jsx
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import './CustomCard.css';

const CustomCard = ({ title, content }) => (
  <Card className="custom-card" sx={{ maxWidth: 345, m: 2 }}>
    <CardContent>
      <Typography variant="h5" className="card-title">
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
        {content}
      </Typography>
      <Button className="custom-button" variant="contained" sx={{ mt: 2 }}>
        Learn More
      </Button>
    </CardContent>
  </Card>
);

export default CustomCard;
```

**File: `src/components/CustomCard/CustomCard.css`**
```css
.custom-card {
  transition: transform 0.3s ease;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.custom-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.card-title {
  font-weight: bold;
  color: #1976d2;
}

.custom-button {
  background: linear-gradient(45deg, #fe6b8b, #ff8e53) !important;
  border-radius: 20px !important;
}
```

## When to Use What

### Use CSS files for:
- Custom animations and transitions
- Hover effects
- Complex layouts
- Custom styling that's hard to do with `sx`
- When you're more comfortable with CSS

### Use MUI's `sx` prop for:
- Spacing (margin, padding): `sx={{ m: 2, p: 3 }}`
- Colors: `sx={{ color: 'primary.main', bgcolor: 'background.paper' }}`
- Responsive design: `sx={{ width: { xs: '100%', md: '50%' } }}`
- Quick styling without creating CSS files

## Asset Organization

### Images
Put in `src/assets/images/` and import:
```jsx
import logo from '../assets/images/logo.png';
<img src={logo} alt="Logo" />
```

### Icons
- **Prefer**: MUI Icons (`@mui/icons-material`)
```jsx
import { Home, Settings } from '@mui/icons-material';
<Home />
```
- **Custom icons**: Put in `src/assets/icons/`

## Best Practices

### Simple Component Structure
```jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import './MyComponent.css';

const MyComponent = () => (
  <Box className="my-container" sx={{ p: 2 }}>
    <Typography variant="h4" className="my-title">
      Hello World
    </Typography>
  </Box>
);
```

### File Naming
- Components: `PascalCase.jsx` (e.g., `UserProfile.jsx`)
- CSS files: `PascalCase.css` (e.g., `UserProfile.css`)
- Images: `kebab-case.png` (e.g., `company-logo.png`)

## What Was Simplified
- ❌ Removed complex theme configuration
- ❌ Removed theme providers and context
- ❌ Removed custom theme files
- ✅ Using MUI's default theme
- ✅ Simple CSS files alongside components
- ✅ `CssBaseline` for consistent baseline styles

This approach is perfect for learning React - you get MUI's great components with the flexibility of CSS when you need it!