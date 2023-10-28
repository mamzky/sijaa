import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import AppColors from '../Utils/Colors';
import NavBar from '../Components/TopNavBar';
import TopNavBar from '../Components/TopNavBar';
import SideNavBar from '../Components/SideNavBar';
import CustomTable from '../Components/CustomTable';
import ProgressOverview from '../Components/ProgressOverview';
import LargeImageCard from '../Components/LargeImageCard';
import SmallImageCard from '../Components/SmallImageCard';
import Constant from '../Utils/Constants';
import { db } from '../Config/FirebaseConfig';
import {collection, getDocs, addDoc, doc, updateDoc} from 'firebase/firestore'

function MainDashboard() {

  const userCollectionRef = collection(db, "user")
  const productCollectionRef = collection(db, "product")

  const [users, setUsers] = useState([])
  useEffect(() => {
    console.log('INITIATE DASHBOARD')
    const getUser = async () => {
      const data = await getDocs(userCollectionRef)
      setUsers(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
      console.log(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    }

    getUser()
  }, [])
  
  const addUser = async () => {
    // await addDoc(use71rCollectionRef, {name: 'Nurakhman', email: 'sijaa@gmail.com', role: 'SADM'})
    await addDoc(productCollectionRef, {
      product_name: 'TLSO', 
      product_size: 'M',
      base_price: '10000',
      sell_price: '20000',
      discount: '0',
      qty: '30',
      supplier: 'JAA',
      productCode: 'JAA111'  
    })
  }

  const updateProduct = async (id, name) => {
    const productDoc = doc(db, "product", id)
    const newField = {product_name: name}
    await updateDoc(productDoc, newField);
  }

  return (
    <div>
      <SideNavBar/>
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar/>

        <div class="container-fluid py-4">
          {/* <Button onClick={addUser}>asd</Button>
          <Button onClick={() => {updateProduct('ftCctmwv3j5w8WnsOPSK', 'NEW TLSO')}}>UPDATE</Button> */}
          <div class="row">
            <SmallImageCard/>
            <SmallImageCard/>
            <SmallImageCard/>
            <SmallImageCard/>
          </div>
          <div class="row mt-4">
            <LargeImageCard/>
            <LargeImageCard/>
            <LargeImageCard/>
          
          </div>
          
          <div class="row mb-4">
            <CustomTable/>
            {/* <ProgressOverview/> */}
          </div>
          
        </div>
      </main>
      

    </div>
  );
}

export default MainDashboard;
