import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import './App.css';
import Login from './Auth/Login';
import MainDashboard from './Dashboard/MainDashboard';
import 'bootstrap/dist/css/bootstrap.min.css'
import MainNav from './Navigation/MainNav';
import Product from './Product/Product';
import Contact from './Contact/Contact';
import Stock from './Stock/Stock';
import Customer from './Customer/Customer';

// IMPORT PAGES

function App() {
  return (
    <Router>
        {/* <MainNav/> */}
      <Routes>
        <Route path='/' Component={MainDashboard} />
        <Route path='/login' Component={Login}/>
        <Route path='/dashboard' Component={MainDashboard} />
        <Route path='/product' Component={Product}/>
        <Route path='/contact' Component={Contact}/>
        <Route path='/contact' Component={Contact}/>
        <Route path='/customer' Component={Customer}/>
        <Route path='/stock' Component={Stock}/>
      </Routes>
    </Router>
  );
}

export default App;
