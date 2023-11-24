import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import AppColors from '../Utils/Colors'
import Constant from '../Utils/Constants'
import { isEmpty } from 'ramda'
import isNil from 'ramda/src/isNil'

function SideNavBar() {

  const [activeMenu, setActiveMenu] = useState('')
  const navigate = useNavigate()

  const getActiveMenu = async () => {
    setActiveMenu(localStorage.getItem(Constant.ACTIVE_MENU))
  }

  useEffect(() => {
    checkLogin()
    getActiveMenu()
  }, [])

  const performLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const checkLogin = async () => {
    const isLogin = await localStorage.getItem(Constant.USERNAME)
    if (isNil(isLogin)) {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
      <div className="sidenav-header">
        <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <a className="navbar-brand m-0" href=" https://demos.creative-tim.com/material-dashboard/pages/dashboard " target="_blank">
          {/* <img src="../assets/img/logo-ct.png" className="navbar-brand-img h-100" alt="main_logo" /> */}
          <h1 className="ms-1 font-weight-bold text-white">{Constant.APP_NAME}</h1>
          <span className='text-white'>Sistem Informasi JAA</span>
        </a>
      </div>
      <div className="horizontal light mt-5 mb-2">
        <div className="collapse navbar-collapse  w-auto " id="sidenav-collapse-main">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className={`nav-link text-white bg-gradient-primary ${activeMenu === Constant.MENU_DASHBOARD ? 'active' : ''}`} href="/"
                onClick={() => {
                  localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_DASHBOARD)
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">dashboard</i>
                </div>
                <span className="nav-link-text ms-1">Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link text-white bg-gradient-primary ${activeMenu === Constant.MENU_CUSTOMER ? 'active' : ''}`} href="/customer"
                onClick={() => {
                  localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_CUSTOMER)
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">table_view</i>
                </div>
                <span className="nav-link-text ms-1">Customer</span>
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link text-white bg-gradient-primary ${activeMenu === Constant.MENU_PRODUCT ? 'active' : ''}`} href="/product"
                onClick={() => {
                  localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_PRODUCT)
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">receipt_long</i>
                </div>
                <span className="nav-link-text ms-1">Produk</span>
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link text-white bg-gradient-primary ${activeMenu === Constant.MENU_STOCK ? 'active' : ''}`} href="/stock"
                onClick={() => {
                  localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_STOCK)
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">all_inbox</i>
                </div>
                <span className="nav-link-text ms-1">Stok</span>
              </a>
            </li>
            <li className="nav-item">
              <a className={`nav-link text-white bg-gradient-primary ${activeMenu === Constant.MENU_CONTACT ? 'active' : ''}`} href="/contact"
                onClick={() => {
                  localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_CONTACT)
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">person</i>
                </div>
                <span className="nav-link-text ms-1">Kontak</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="sidenav-footer position-absolute w-100 bottom-0 ">
        <div className="mx-2">
          <Button style={{ width: '100%' }} variant="danger" type="button"
            onClick={performLogout}
          >
            <i className="material-icons opacity-10" style={{ marginRight: 10 }}>logout</i>
            Logout
          </Button>
        </div>
      </div>     
    </aside>

  )
}

export default SideNavBar