import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

export const PageHeader = ({ title, subtitle, action }) => {
  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              {subtitle.toUpperCase()}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
      <Divider sx={{ borderBottomWidth: 4, borderColor: 'common.black' }} />
    </Box>
  );
};
