import React from 'react'
import { Button, Form } from 'react-bootstrap'
import TopNavBar from '../Components/TopNavBar'
import SideNavBar from '../Components/SideNavBar'
import SmallImageCard from '../Components/SmallImageCard'
import CustomTable from '../Components/CustomTable'
import { useNavigate } from 'react-router-dom'

function Product() {

  const navigate = useNavigate()
  return (
    <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Produk</h2>
              <h6>Daftar Produk JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button
               style={{ width: '40%', alignSelf: 'flex-end' }}
               onClick={() => {
                navigate('/product/add-new-product')
               }}
               >+ Tambah Produk Baru</Button>
            </div>
          </div>
          <div class="row mt-4">
            <SmallImageCard />
            <SmallImageCard />
            <SmallImageCard />
            <SmallImageCard />
          </div>
          <div class="row mt-4">
            <CustomTable />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Product