import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
// import './App.css';
import Login from './Auth/Login';
import MainDashboard from './Dashboard/MainDashboard';
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastContainer, toast } from 'react-toastify';
import Product from './Product/Product';
import Contact from './Contact/Contact';
import Stock from './Stock/Stock';
import Customer from './Customer/Customer';
import Sales from './Sales/Sales';
import Employee from './Employee/Employee'
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
import StockCustomer from './Customer/StockSuctomer';
import ContactDetail from './Contact/ContactDetail';
import AddNewContact from './Contact/AddNewContact';
import AddNewSales from './Sales/AddNewSales';
import SalesDetail from './Sales/SalesDetails';
import AddNewEmployee from './Employee/AddNewEmployee'
import EmployeeDetail from './Employee/EmployeeDetails'
import 'react-toastify/dist/ReactToastify.css';




// IMPORT PAGES

function App() {

  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app)

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path='/' Component={MainDashboard} />
        <Route path='/login' Component={Login} />
        <Route path='/dashboard' Component={MainDashboard} />
        <Route path='/product' Component={Product} />
        <Route path='/product/add-new-product' Component={AddNewProduct} />
        <Route path='/product/product-detail/:product_code' Component={ProductDetail} />
        <Route path='/contact' Component={Contact} />
        <Route path='/contact/detail/:contactId' Component={ContactDetail} />
        <Route path='/contact/new-contact' Component={AddNewContact} />
        <Route path='/customer' Component={Customer} />
        <Route path='/customer/new-customer' Component={AddNewCustomer} />
        <Route path='/customer/detail/:customer_code' Component={CustomerDetail} />
        <Route path='/customer/detail/:customer_code/stock' Component={StockCustomer} />
        <Route path='/stock' Component={Stock} />
        <Route path='/transaction' Component={Transaction} />
        <Route path='/transaction/new-transaction' Component={AddNewTransaction} />
        <Route path='/transaction/detail/:order_number' Component={TransactionDetail} />
        <Route path='/sales' Component={Sales} />
        <Route path='/sales/detail' Component={SalesDetail} />
        <Route path='/sales/new-sales' Component={AddNewSales} />
        <Route path='/employee' Component={Employee} />
        <Route path='/employee/detail/:employeeId' Component={EmployeeDetail} />
        <Route path='/employee/new-employee' Component={AddNewEmployee} />

        {/* <Route path='/sales/detail/:salesId' Component={SalesDetail}/>
        <Route path='/contact/new-sales' Component={AddNewSales}/> */}
      </Routes>
    </Router>
  );
}

export default App;
