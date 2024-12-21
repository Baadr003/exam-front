import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';

const EmailVerificationDialog = ({ open, email, onClose, onVerify, onResendCode }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      await onVerify(email, verificationCode);
      setError('');
      setVerificationCode('');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Vérification Email</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Un code de vérification a été envoyé à {email}
          </Typography>
          <TextField
            fullWidth
            label="Code de vérification"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            error={!!error}
            helperText={error}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onResendCode(email)}>
          Renvoyer le code
        </Button>
        <Button 
          onClick={handleVerify} 
          variant="contained"
          disabled={!verificationCode}
        >
          Vérifier
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailVerificationDialog;