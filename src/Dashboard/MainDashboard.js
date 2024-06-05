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
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify';
// import { "product" } from '../Utils/DataUtils';

function MainDashboard() {

  const userCollectionRef = collection(db, "user")
  const productCollectionRef = collection(db, "product")

  const [users, setUsers] = useState([])
  useEffect(() => {
    const getUser = async () => {
      const data = await getDocs(userCollectionRef)
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    }

    getUser()
  }, [])

  return (
    <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="py-4 flex-row justify-center h-[100vh]">
          <>
            <h1 className='text-center'>Welcome to SIJAA</h1>
            <h3 className='text-center'>Sistem Informasi JAA Alkesum</h3>
          </>
          {/* <div class="row">
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
          </div> */}

        </div>
      </main>


    </div>
  );
}

export default MainDashboard;
