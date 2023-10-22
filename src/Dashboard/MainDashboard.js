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

function MainDashboard() {

  return (
    <div>
      <SideNavBar/>
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar/>


        <div class="container-fluid py-4">
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
