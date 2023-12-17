import React, { useEffect } from 'react';
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
import AddNewProduct from './Product/AddNewProduct';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from './Config/FirebaseConfig';
import ProductDetail from './Product/ProductDetail';
import AddNewCustomer from './Customer/AddNewCustomer';
import CustomerDetail from './Customer/CustomerDetail';
import Transaction from './Transaction/Transaction';
import AddNewTransaction from './Transaction/AddNewTransaction';
import "react-datepicker/dist/react-datepicker.css";
import TransactionDetail from './Transaction/TransactionDetail';

// IMPORT PAGES

function App() {

  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app)

  return (
    <Router>
        {/* <MainNav/> */}
      <Routes>
        <Route path='/' Component={MainDashboard} />
        <Route path='/login' Component={Login}/>
        <Route path='/dashboard' Component={MainDashboard} />
        <Route path='/product' Component={Product}/>
        <Route path='/product/add-new-product' Component={AddNewProduct}/>
        <Route path='/product/product-detail/:product_code' Component={ProductDetail}/>
        <Route path='/contact' Component={Contact}/>
        <Route path='/contact' Component={Contact}/>
        <Route path='/customer' Component={Customer}/>
        <Route path='/customer/new-customer' Component={AddNewCustomer}/>
        <Route path='/customer/detail/:customer_code' Component={CustomerDetail}/>
        <Route path='/stock' Component={Stock}/>
        <Route path='/transaction' Component={Transaction}/>
        <Route path='/transaction/new-transaction' Component={AddNewTransaction}/>
        <Route path='/transaction/detail/:order_number' Component={TransactionDetail}/>
      </Routes>
    </Router>
  );
}

export default App;
