import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Grid, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    Collapse,
    Stack,
    Card,
    CardContent
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ProductsSearch from '../../components/ProductsSearch';
import { useCreateSale } from '../../features/sales/hooks/useSales';
import { PageHeader } from '../../components/common/PageHeader';

export const CreateSalePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
    const [transactionType, setTransactionType] = useState('sell'); // default to sell for better UX
    const [items, setItems] = useState([]);
    const [customItem, setCustomItem] = useState({ name: '', price: '', quantity: 1 });
    const [showCustomer, setShowCustomer] = useState(false);
    
    const createSaleMutation = useCreateSale();

    // Auto-add item if passed via navigation (e.g. from Dashboard)
    useEffect(() => {
        if (location.state && location.state.product) {
            handleAddItem(location.state.product);
            // Clear state so it doesn't add again on refresh/re-nav
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleAddItem = (product) => {
        if (!product || !product.id) return;

        setItems(prev => {
            const existing = prev.find(item => item.product_id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.product_id === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }

            const defaultPrice = transactionType === 'sell' 
                ? (product.sale_price || product.cash_price || 0) 
                : (product.cash_price || 0);

            return [...prev, {
                cart_item_id: Date.now() + Math.random(), 
                product_id: product.id,
                name: product.name,
                price: defaultPrice.toString(),
                quantity: 1,
                is_custom: false
            }];
        });
    };

    const handleAddCustomItem = () => {
        if (!customItem.name || !customItem.price) return;
        
        setItems(prev => [...prev, {
            cart_item_id: Date.now() + Math.random(),
            product_id: null,
            name: customItem.name,
            price: customItem.price.toString(),
            quantity: parseInt(customItem.quantity),
            is_custom: true
        }]);
        setCustomItem({ name: '', price: '', quantity: 1 });
    };

    const handleRemoveItem = (cartItemId) => {
        setItems(prev => prev.filter((item) => item.cart_item_id !== cartItemId));
    };

    const handleQuantityChange = (cartItemId, delta) => {
        setItems(prev => prev.map((item) => {
            if (item.cart_item_id === cartItemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handlePriceChange = (cartItemId, newPrice) => {
        setItems(prev => prev.map((item) => {
            if (item.cart_item_id === cartItemId) {
                return { ...item, price: newPrice };
            }
            return item;
        }));
    };

    const calculateTotal = () => {
        return items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * item.quantity), 0).toFixed(2);
    };

    const handleSubmit = () => {
        const saleData = {
            customer,
            type: transactionType,
            items: items.map(item => ({
                product_id: item.product_id,
                custom_name: item.is_custom ? item.name : null,
                quantity: item.quantity,
                price: parseFloat(item.price || 0)
            }))
        };

        createSaleMutation.mutate(saleData, {
            onSuccess: () => {
                setItems([]);
                setCustomer({ name: '', email: '', phone: '' });
                setShowCustomer(false);
            }
        });
    };

    return (
        <Box>
            <PageHeader 
                title="New Transaction" 
                subtitle="Complete a sale or trade-in with ease."
                action={
                    <FormControl size="small" sx={{ width: 140 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={transactionType}
                            label="Type"
                            onChange={(e) => setTransactionType(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="sell">Sell (Out)</MenuItem>
                            <MenuItem value="buy">Buy (In)</MenuItem>
                            <MenuItem value="repair">Repair</MenuItem>
                        </Select>
                    </FormControl>
                }
            />

            <Grid container spacing={4}>
                {/* Left Side: Inputs */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={3}>
                        <Card variant="outlined" sx={{ borderRadius: 0, border: '2px solid black' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box 
                                    sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                                    onClick={() => setShowCustomer(!showCustomer)}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Customer Details</Typography>
                                    {showCustomer ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </Box>
                                <Collapse in={showCustomer}>
                                    <Box sx={{ mt: 3 }}>
                                        <TextField 
                                            fullWidth label="Full Name" size="small" sx={{ mb: 2 }}
                                            value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})}
                                        />
                                        <TextField 
                                            fullWidth label="Email Address" size="small" sx={{ mb: 2 }}
                                            value={customer.email} onChange={(e) => setCustomer({...customer, email: e.target.value})}
                                        />
                                        <TextField 
                                            fullWidth label="Phone Number" size="small"
                                            value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                                        />
                                    </Box>
                                </Collapse>
                            </CardContent>
                        </Card>

                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, border: '2px solid black' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>Add Products</Typography>
                            <Box sx={{ mb: 3 }}>
                                <ProductsSearch onSelect={handleAddItem} />
                            </Box>

                            <Divider sx={{ my: 3 }}><Typography variant="caption" color="text.secondary">OR CUSTOM ITEM</Typography></Divider>

                            <Stack spacing={2}>
                                <TextField 
                                    fullWidth label="Item Name" size="small"
                                    value={customItem.name} onChange={(e) => setCustomItem({...customItem, name: e.target.value})}
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField 
                                        label="Price" type="number" size="small" fullWidth
                                        value={customItem.price} onChange={(e) => setCustomItem({...customItem, price: e.target.value})}
                                    />
                                    <TextField 
                                        label="Qty" type="number" size="small" sx={{ width: 80 }}
                                        value={customItem.quantity} onChange={(e) => setCustomItem({...customItem, quantity: e.target.value})}
                                    />
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    onClick={handleAddCustomItem}
                                    sx={{ borderRadius: 0, border: '2px solid black', fontWeight: 900 }}
                                >
                                    ADD CUSTOM ENTRY
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>

                {/* Right Side: Cart */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            borderRadius: 0, 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            overflow: 'hidden',
                            border: '2px solid black'
                        }}
                    >
                        <TableContainer sx={{ flexGrow: 1, maxHeight: 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                                        <TableCell width={40}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.length > 0 ? items.map((item) => (
                                        <TableRow key={item.cart_item_id} hover>
                                            <TableCell>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                                {item.is_custom && <Typography variant="caption" color="primary">Custom Entry</Typography>}
                                            </TableCell>
                                            <TableCell align="right">
                                                 <TextField
                                                    type="number"
                                                    variant="standard"
                                                    size="small"
                                                    value={item.price}
                                                    onChange={(e) => handlePriceChange(item.cart_item_id, e.target.value)}
                                                    inputProps={{ min: 0, step: 0.01, style: { textAlign: 'right' } }}
                                                    sx={{ width: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                                    <IconButton size="small" onClick={() => handleQuantityChange(item.cart_item_id, -1)} sx={{ border: '1px solid #e2e8f0' }}>
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <Typography variant="body2" sx={{ mx: 1, fontWeight: 700 }}>{item.quantity}</Typography>
                                                    <IconButton size="small" onClick={() => handleQuantityChange(item.cart_item_id, 1)} sx={{ border: '1px solid #e2e8f0' }}>
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    {import.meta.env.VITE_CURRENCY}{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.cart_item_id)}>
                                                    <DeleteOutlineIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                                <Typography variant="body1" color="text.secondary">No items in this transaction yet.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ p: 4, bgcolor: 'black', color: 'white', borderTop: '4px solid black' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>Grand Total</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                                    {import.meta.env.VITE_CURRENCY}{calculateTotal()}
                                </Typography>
                            </Stack>
                            
                            <Button 
                                variant="contained" 
                                size="large" 
                                fullWidth 
                                disabled={items.length === 0 || !transactionType || createSaleMutation.isPending}
                                onClick={handleSubmit}
                                sx={{ py: 2, borderRadius: 0, fontWeight: 900, fontSize: '1.2rem', bgcolor: 'white', color: 'black', border: '2px solid white', '&:hover': { bgcolor: 'grey.300', color: 'black' } }}
                            >
                                {createSaleMutation.isPending ? 'Processing...' : 'Complete Transaction'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};