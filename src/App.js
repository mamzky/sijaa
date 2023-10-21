import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import './App.css';
import Login from './Auth/Login';
import MainDashboard from './Dashboard/MainDashboard';
import 'bootstrap/dist/css/bootstrap.min.css'
import MainNav from './Navigation/MainNav';

// IMPORT PAGES

function App() {
  return (
    <Router>
        {/* <MainNav/> */}
      <Routes>
        <Route path='/' Component={MainDashboard} />
        <Route path='/login' Component={Login}/>
      </Routes>
    </Router>
  );
}

export default App;
