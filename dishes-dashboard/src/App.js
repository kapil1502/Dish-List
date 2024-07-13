import React from 'react';
import './App.css';
import DishList from './DishList';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <DishList />
    </div>
  );
}

export default App;
