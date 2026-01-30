import React, { useState, useEffect, useRef } from 'react';
import { 
    Button, 
    Typography, 
    Box, 
    Checkbox, 
    Grid,
    LinearProgress,
    Divider,
    Paper,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import BarChartIcon from '@mui/icons-material/BarChart';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAdmin } from '../features/admin/hooks/useAdmin';
import { fetchNavigation, toggleCategory } from '../features/products/api/products';
import { PageHeader } from '../components/common/PageHeader';
import { useNotification } from '../context/NotificationContext';

export const AdminPage = () => {
    const { isLoading, refreshCex, status, stopRefresh } = useAdmin();
    const { showNotification } = useNotification();
    const [tree, setTree] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedProductLines, setSelectedProductLines] = useState([]);
    const [navLoading, setNavLoading] = useState(true);
    const logsEndRef = useRef(null);

    useEffect(() => {
        const loadNav = async () => {
            try {
                const data = await fetchNavigation(true); // Include inactive for admin
                setTree(data);
            } catch (err) {
                console.error("Failed to load navigation", err);
                showNotification("Failed to load navigation data.", "error");
            } finally {
                setNavLoading(false);
            }
        };
        loadNav();
    }, [showNotification]);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [status?.logs]);

    const handleRefresh = async () => {
        try {
            await refreshCex(selectedCategories, selectedProductLines);
            showNotification("Data synchronization started successfully.", "success");
        } catch (err) {
            showNotification("Failed to start synchronization.", "error");
        }
    };

    const handleCategoryToggle = (catId) => {
        setSelectedCategories(prev => {
            if (prev.includes(catId)) return prev.filter(id => id !== catId);
            return [...prev, catId];
        });
    };

    const handleProductLineToggle = (lineId) => {
        setSelectedProductLines(prev => {
            if (prev.includes(lineId)) return prev.filter(id => id !== lineId);
            return [...prev, lineId];
        });
    };

    const handleSuperCatToggle = (superCat, isChecked) => {
        const lineIds = superCat.product_lines.map(l => l.id);
        if (isChecked) {
            setSelectedProductLines(prev => [...new Set([...prev, ...lineIds])]);
        } else {
            setSelectedProductLines(prev => prev.filter(id => !lineIds.includes(id)));
        }
    };

    const isSuperCatSelected = (superCat) => {
        return superCat.product_lines.every(l => selectedProductLines.includes(l.id));
    };

    const isSuperCatIndeterminate = (superCat) => {
        const selectedCount = superCat.product_lines.filter(l => selectedProductLines.includes(l.id)).length;
        return selectedCount > 0 && selectedCount < superCat.product_lines.length;
    };

    const handleCategoryVisibilityToggle = async (catId) => {
        try {
            const res = await toggleCategory(catId);
            setTree(prev => prev.map(superCat => ({
                ...superCat,
                product_lines: superCat.product_lines.map(line => ({
                    ...line,
                    categories: line.categories.map(cat => 
                        cat.id === catId ? { ...cat, is_active: res.is_active } : cat
                    )
                }))
            })));
            showNotification(`Category visibility ${res.is_active ? 'enabled' : 'disabled'}.`, "info");
        } catch (err) {
            console.error("Failed to toggle category visibility", err);
            showNotification("Failed to toggle visibility.", "error");
        }
    };

    const handleGenerateFakeSales = async () => {
        if (!confirm("Generate 50 fake sales for the last 30 days?")) return;
        try {
            const res = await fetch('/api/sales/fake-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 50, days_back: 30 })
            });
            if (res.ok) showNotification("50 fake transactions generated.", "success");
        } catch (err) {
            showNotification("Failed to generate test data.", "error");
        }
    };

    const handleClearSales = async () => {
        if (!confirm("Are you SURE you want to clear ALL sales data? This cannot be undone.")) return;
        try {
            const res = await fetch('/api/sales/clear-all', { method: 'DELETE' });
            if (res.ok) showNotification("All sales data has been cleared.", "warning");
        } catch (err) {
            showNotification("Failed to clear sales data.", "error");
        }
    };

    const handleSmartPreset = () => {
        const INCLUDES = ['Apple', 'iPhone', 'iPad', 'MacBook', 'Android', 'Samsung', 'Galaxy', 'Pixel', 'Google'];
        const EXCLUDES = ['Accessory', 'Accessories', 'Cable', 'Case', 'Cover', 'Protector', 'Sleeve', 'Bag', 'Strap', 'Mount', 'Part'];
        
        let targetIds = [];

        const promptCategories = (nodes) => {
            nodes.forEach(node => {
                if (node.categories) {
                    node.categories.forEach(cat => {
                        const name = cat.name;
                        const isMatch = INCLUDES.some(inc => name.toLowerCase().includes(inc.toLowerCase()));
                        const isExcluded = EXCLUDES.some(exc => name.toLowerCase().includes(exc.toLowerCase()));

                        if (isMatch && !isExcluded) {
                            targetIds.push(cat.id);
                        }
                    });
                } else if (node.product_lines) {
                    promptCategories(node.product_lines);
                }
            });
        };

        promptCategories(tree);
        setSelectedCategories(targetIds);
        setSelectedProductLines([]); 
        showNotification("Applied Phones & Apple Tech preset.", "info");
    };

    const activeStep = isLoading ? 2 : (status?.is_running ? 2 : 0);

    return (
        <Box>
            <PageHeader 
                title="Admin Control Center" 
                subtitle="Manage data synchronization and system settings."
                action={
                    status?.is_running && (
                        <Chip 
                            icon={<CircularProgress size={16} sx={{ color: 'white !important' }} />} 
                            label="Sync in Progress" 
                            color="primary" 
                            sx={{ fontWeight: 700 }}
                        />
                    )
                }
            />
            
            <Grid container spacing={4}>
                {/* Left Panel: Sync Controls */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>System Sync</Typography>
                            
                            <Stepper activeStep={activeStep} orientation="vertical">
                                <Step expanded>
                                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>Target Selection</StepLabel>
                                    <StepContent>
                                        <Box sx={{ mb: 2 }}>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={handleSmartPreset}
                                                fullWidth
                                                startIcon={<CheckCircleIcon />}
                                                sx={{ mb: 1.5, borderRadius: 2 }}
                                            >
                                                Preset: Phones & Apple
                                            </Button>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedCategories.length} categories chosen.
                                                {selectedCategories.length === 0 && " (Refresh everything)"}
                                            </Typography>
                                        </Box>
                                    </StepContent>
                                </Step>
                                <Step expanded>
                                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700 } }}>Trigger</StepLabel>
                                    <StepContent>
                                        <LoadingButton
                                            onClick={handleRefresh}
                                            loading={isLoading}
                                            startIcon={<RefreshIcon />}
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            sx={{ mt: 1, borderRadius: 3 }}
                                        >
                                            Start Refresh
                                        </LoadingButton>
                                    </StepContent>
                                </Step>
                            </Stepper>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Maintenance</Typography>
                            <Stack spacing={1.5}>
                                <Button 
                                    variant="outlined" 
                                    fullWidth 
                                    startIcon={<BarChartIcon />} 
                                    onClick={handleGenerateFakeSales}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Generate Test Data
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    fullWidth 
                                    startIcon={<DeleteForeverIcon />} 
                                    onClick={handleClearSales}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Clear All Sales
                                </Button>
                            </Stack>
                        </Paper>

                        {(isLoading || status?.is_running) && (
                            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>LIVE PROGRESS</Typography>
                                    <Box sx={{ mb: 1 }}>
                                        <Typography variant="caption">Current:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{status?.current_category || 'Initializing...'}</Typography>
                                    </Box>
                                    <LinearProgress color="inherit" sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                                    <Typography variant="caption" sx={{ display: 'block', mb: 2 }}>
                                        {status?.current_item || 'Connecting to CEX API...'}
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        size="small" 
                                        fullWidth 
                                        onClick={stopRefresh}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Stop Sync
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </Stack>
                </Grid>

                {/* Right Panel: Selection Tree & Logs */}
                <Grid item xs={12} lg={8}>
                    <Stack spacing={3}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>Data Targets</Typography>
                                <Button size="small" onClick={() => { setSelectedCategories([]); setSelectedProductLines([]); }} disabled={selectedCategories.length === 0 && selectedProductLines.length === 0}>
                                    Clear Selection
                                </Button>
                            </Box>
                            
                            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                                {navLoading ? (
                                    <Box sx={{ p: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                                ) : (
                                    <Box>
                                        {tree.map(superCat => (
                                            <Box key={superCat.id}>
                                                <Box sx={{ px: 3, py: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                                                    <Checkbox
                                                        size="small"
                                                        checked={isSuperCatSelected(superCat)}
                                                        indeterminate={isSuperCatIndeterminate(superCat)}
                                                        onChange={(e) => handleSuperCatToggle(superCat, e.target.checked)}
                                                        sx={{ mr: 1 }}
                                                    />
                                                    <Typography sx={{ fontWeight: 700 }}>{superCat.name}</Typography>
                                                </Box>
                                                
                                                <Box sx={{ px: 3, py: 1 }}>
                                                    {superCat.product_lines.map(line => (
                                                        <Box key={line.id} sx={{ my: 2 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                <Checkbox
                                                                    size="small"
                                                                    checked={selectedProductLines.includes(line.id)}
                                                                    onChange={() => handleProductLineToggle(line.id)}
                                                                    sx={{ mr: 1 }}
                                                                />
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                                    {line.name}
                                                                </Typography>
                                                            </Box>
                                                            
                                                            <Grid container spacing={1} sx={{ pl: 4 }}>
                                                                {line.categories.map(cat => (
                                                                    <Grid item key={cat.id}>
                                                                        <Chip 
                                                                            label={cat.name}
                                                                            variant={selectedCategories.includes(cat.id) ? "filled" : "outlined"}
                                                                            color={selectedCategories.includes(cat.id) ? "primary" : "default"}
                                                                            onClick={() => handleCategoryToggle(cat.id)}
                                                                            onDelete={() => handleCategoryVisibilityToggle(cat.id)}
                                                                            deleteIcon={cat.is_active ? <VisibilityIcon size="small" /> : <VisibilityOffIcon size="small" />}
                                                                            sx={{ 
                                                                                borderRadius: 2, 
                                                                                fontWeight: 600,
                                                                                textDecoration: cat.is_active ? 'none' : 'line-through',
                                                                                opacity: cat.is_active ? 1 : 0.6
                                                                            }}
                                                                        />
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                        <Paper sx={{ bgcolor: 'grey.900', color: 'common.white', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'grey.800', display: 'flex', gap: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
                            </Box>
                            <Box sx={{ height: 250, overflowY: 'auto', p: 2, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {status?.logs?.length > 0 ? (
                                    <>
                                        {status.logs.map((log, i) => (
                                            <Box key={i} sx={{ mb: 0.5, color: 'grey.300' }}>
                                                <Typography component="span" sx={{ color: 'grey.500', fontSize: '0.75rem', mr: 1 }}>
                                                    {new Date().toLocaleTimeString([], { hour12: false })}
                                                </Typography>
                                                {log}
                                            </Box>
                                        ))}
                                        <div ref={logsEndRef} />
                                    </>
                                ) : (
                                    <Typography sx={{ color: 'grey.600' }}>// System logs idle...</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
