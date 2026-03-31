import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Fab, Paper, Typography, TextField, IconButton, 
  List, ListItem, CircularProgress, Card, CardContent, CardMedia 
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hi! I am your AI Event Assistant. What kind of events are you looking for?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = query;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setQuery('');
        setIsLoading(true);

        try {
            const res = await fetch(`http://localhost:3000/events/search/smart?query=${encodeURIComponent(userMsg)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            
            if (data.success) {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: data.data.aiMessage,
                    events: data.data.events 
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: 'Oops! Something went wrong while searching. Please ensure MongoDB Atlas vector search is configured as mentioned in the backend setup.' }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Fab 
                color="primary" 
                aria-label="chat" 
                onClick={() => setIsOpen(!isOpen)}
                sx={{ 
                    position: 'fixed', 
                    bottom: 32, 
                    right: 32, 
                    zIndex: 1000, 
                    bgcolor: '#1a1a1a', 
                    '&:hover': { bgcolor: '#333' } 
                }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </Fab>

            {isOpen && (
                <Paper 
                    elevation={6} 
                    sx={{
                        position: 'fixed', bottom: 100, right: 32, 
                        width: 380, height: 600, display: 'flex', flexDirection: 'column', 
                        zIndex: 1000, borderRadius: 4, overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ bgcolor: '#1a1a1a', color: 'white', p: 2, display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '1.1rem' }}>
                            AI Event Assistant
                        </Typography>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f7f7f8' }}>
                        <List sx={{ p: 0 }}>
                            {messages.map((msg, index) => (
                                <ListItem 
                                    key={index} 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        px: 0, py: 1
                                    }}
                                >
                                    <Paper 
                                        elevation={0} 
                                        sx={{ 
                                            p: 2, 
                                            maxWidth: '90%',
                                            bgcolor: msg.role === 'user' ? '#1a1a1a' : 'white',
                                            color: msg.role === 'user' ? 'white' : 'text.primary',
                                            borderRadius: 2,
                                            borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                                            borderTopLeftRadius: msg.role === 'ai' ? 4 : 16,
                                            borderBottomRightRadius: 16, borderBottomLeftRadius: 16,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.95rem' }}>
                                            {msg.text}
                                        </Typography>
                                    </Paper>

                                    {/* Event Cards (if returned by AI) */}
                                    {msg.events && msg.events.length > 0 && (
                                        <Box sx={{ mt: 1.5, width: '100%', display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                                            {msg.events.map(event => (
                                                <Card 
                                                    key={event._id} 
                                                    onClick={() => {
                                                        setIsOpen(false);
                                                        navigate(`/events/${event._id}`);
                                                    }}
                                                    sx={{ 
                                                        minWidth: 220, 
                                                        maxWidth: 220, 
                                                        flexShrink: 0,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s',
                                                        '&:hover': { transform: 'scale(0.98)' }
                                                    }}
                                                >
                                                    {event.image ? (
                                                        <CardMedia
                                                            component="img"
                                                            height="120"
                                                            image={`http://localhost:3000${event.image}`}
                                                            alt={event.title}
                                                        />
                                                    ) : (
                                                        <Box sx={{ height: 120, bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Typography variant="caption" color="text.secondary">No Image</Typography>
                                                        </Box>
                                                    )}
                                                    <CardContent sx={{ p: '12px !important' }}>
                                                        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }} noWrap>
                                                            {event.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                                            {new Date(event.startDateTime).toLocaleDateString()} • {event.venue}
                                                        </Typography>
                                                        <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                            ${event.ticketPrice}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    )}
                                </ListItem>
                            ))}
                            {isLoading && (
                                <ListItem sx={{ display: 'flex', justifyContent: 'flex-start', px: 0 }}>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', bgcolor: 'white', p: 1.5, borderRadius: 2, borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                        <CircularProgress size={16} sx={{ color: '#1a1a1a' }} />
                                        <Typography variant="body2" color="text.secondary">Thinking...</Typography>
                                    </Box>
                                </ListItem>
                            )}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Ask me to find an event..."
                            size="small"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={handleSend} disabled={isLoading || !query.trim()} sx={{ color: query.trim() ? '#1a1a1a' : 'inherit' }}>
                                        <SendIcon fontSize="small" />
                                    </IconButton>
                                )
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f5f5f5',
                                    '& fieldset': { borderColor: 'transparent' },
                                    '&:hover fieldset': { borderColor: '#e0e0e0' },
                                    '&.Mui-focused fieldset': { borderColor: '#1a1a1a' }
                                }
                            }}
                        />
                    </Box>
                </Paper>
            )}
        </>
    );
};

export default Chatbot;
