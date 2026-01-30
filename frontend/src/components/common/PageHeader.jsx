import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};
