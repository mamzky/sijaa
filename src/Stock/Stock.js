import React from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import SmallImageCard from '../Components/SmallImageCard'
import { Button } from 'react-bootstrap'

function Stock() {
    return (
      <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Stok</h2>
              <h6>Daftar Stok JAA Alkesum</h6>
            </div>
          </div>
          <div class="row mt-4">
            <SmallImageCard/>
            <SmallImageCard/>
            <SmallImageCard/>
            <SmallImageCard/>
          </div>
        </div>
      </main>
    </div>
      )
}

export default Stock