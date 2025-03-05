import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../Context/AccountContext';
import { useAuth } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const ConnectWallet = () => {
    const [connecting, setConnecting] = useState(false);
    const { connectWallet } = useAccount();
    const { fetchUserProfile } = useAuth();
    const navigate = useNavigate();

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const { address, hasProfile } = await connectWallet();
            await fetchUserProfile(); // Fetch updated user data including login history
            
            if (!hasProfile) {
                navigate('/profile-setup');
            } else {
                navigate('/dashboard');
            }
            
            toast.success('Wallet connected successfully');
        } catch (error) {
            // Error is already handled in AccountContext
            setConnecting(false);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2,
            p: 4,
            maxWidth: 400,
            mx: 'auto',
            textAlign: 'center'
        }}>
            <Typography variant="h5" component="h1" gutterBottom>
                Connect Your Wallet
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Connect your wallet to access your account and manage your assets.
            </Typography>

            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={!connecting && <AccountBalanceWalletIcon />}
                onClick={handleConnect}
                disabled={connecting}
                sx={{ minWidth: 200 }}
            >
                {connecting ? (
                    <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                        Connecting...
                    </>
                ) : (
                    'Connect Wallet'
                )}
            </Button>
        </Box>
    );
};

export default ConnectWallet; 