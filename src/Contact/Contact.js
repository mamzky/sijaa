import React from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function Contact() {
  const navigate = useNavigate()
    return (
      <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Kontak</h2>
              <h6>Daftar kontak JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button style={{ width: '40%', alignSelf: 'flex-end' }}
              onClick={() => {
                navigate('/contact/new-contact')
              }}
              >+ Tambah Kontak Baru</Button>
            </div>
          </div>
          <CustomTable/>
        </div>
      </main>
    </div>
      )
}

export default Contact