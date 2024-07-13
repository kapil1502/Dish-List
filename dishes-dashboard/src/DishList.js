import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardMedia, Typography, Button,
  Grid, Container, CircularProgress, Box
} from '@mui/material';

const DishList = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDishes = useCallback(async () => {
    try {
      const response = await axios.get('https://dish-manager-service.onrender.com/dishes/getAll');
      setDishes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setLoading(false);
    }
  }, []);

  const setupWebSocket = useCallback(() => {
    const ws = new WebSocket('wss://dish-manager-service.onrender.com');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'UPDATE_DISHES') {
        setDishes(message.data);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket. Attempting to reconnect...');
      setTimeout(setupWebSocket, 5000);
    };

    return ws;
  }, []);

  useEffect(() => {
    fetchDishes();
    const ws = setupWebSocket();

    return () => {
      ws.close();
    };
  }, [fetchDishes, setupWebSocket]);

  const toggleStatus = useCallback(async (dishId) => {
    try {
      console.log(`Toggling status for dishId: ${dishId}`);
      const response = await axios.put(`https://dish-manager-service.onrender.com/dishes/${dishId}/toggle-status`);
      console.log('Response from toggle status:', response.data);
      setDishes(dishes.map(dish =>
        dish.dishId === dishId ? { ...dish, isPublished: !dish.isPublished } : dish
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  }, [dishes]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dish List
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {dishes.map(dish => (
            <Grid item key={dish.dishId} xs={12} sm={6} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={dish.imageUrl}
                  alt={dish.dishName}
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {dish.dishName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dish.isPublished ? 'Published' : 'Not Published'}
                  </Typography>
                  <Button
                    variant="contained"
                    color={dish.isPublished ? 'secondary' : 'primary'}
                    onClick={() => toggleStatus(dish.dishId)}
                    sx={{ mt: 2 }}
                  >
                    Toggle Status
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DishList;
