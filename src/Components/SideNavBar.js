import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import AppColors from '../Utils/Colors'
import Constant from '../Utils/Constants'
import {isEmpty} from 'ramda'
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
        const isLogin = await localStorage.getItem(Constant.TOKEN)
        // console.log(isEmpty(isLogin))
        console.log(isNil(isLogin))
        if(isNil(isLogin)){
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

            <div class="fixed-plugin">
        <a class="fixed-plugin-button text-dark position-fixed px-3 py-2">
          <i class="material-icons py-2">settings</i>
        </a>
        <div class="card shadow-lg">
          <div class="card-header pb-0 pt-3">
            <div class="float-start">
              <h5 class="mt-3 mb-0">Material UI Configurator</h5>
              <p>See our dashboard options.</p>
            </div>
            <div class="float-end mt-4">
              <button class="btn btn-link text-dark p-0 fixed-plugin-close-button">
                <i class="material-icons">clear</i>
              </button>
            </div>
            {/* <!-- End Toggle Button --> */}
          </div>
          <div class="horizontal dark my-1">
            <div class="card-body pt-sm-3 pt-0">
              {/* <!-- Sidebar Backgrounds --> */}
              <div>
                <h6 class="mb-0">Sidebar Colors</h6>
              </div>
              <a href="javascript:void(0)" class="switch-trigger background-color">
                <div class="badge-colors my-2 text-start">
                  <span class="badge filter bg-gradient-primary active" data-color="primary" onclick="sidebarColor(this)"></span>
                  <span class="badge filter bg-gradient-dark" data-color="dark" onclick="sidebarColor(this)"></span>
                  <span class="badge filter bg-gradient-info" data-color="info" onclick="sidebarColor(this)"></span>
                  <span class="badge filter bg-gradient-success" data-color="success" onclick="sidebarColor(this)"></span>
                  <span class="badge filter bg-gradient-warning" data-color="warning" onclick="sidebarColor(this)"></span>
                  <span class="badge filter bg-gradient-danger" data-color="danger" onclick="sidebarColor(this)"></span>
                </div>
              </a>
              {/* <!-- Sidenav Type --> */}
              <div class="mt-3">
                <h6 class="mb-0">Sidenav Type</h6>
                <p class="text-sm">Choose between 2 different sidenav types.</p>
              </div>
              <div class="d-flex">
                <button class="btn bg-gradient-dark px-3 mb-2 active" data-class="bg-gradient-dark" onclick="sidebarType(this)">Dark</button>
                <button class="btn bg-gradient-dark px-3 mb-2 ms-2" data-class="bg-transparent" onclick="sidebarType(this)">Transparent</button>
                <button class="btn bg-gradient-dark px-3 mb-2 ms-2" data-class="bg-white" onclick="sidebarType(this)">White</button>
              </div>
              <p class="text-sm d-xl-none d-block mt-2">You can change the sidenav type just on desktop view.</p>
              {/* <!-- Navbar Fixed --> */}
              <div class="mt-3 d-flex">
                <h6 class="mb-0">Navbar Fixed</h6>
                <div class="form-check form-switch ps-0 ms-auto my-auto">
                  <input class="form-check-input mt-1 ms-auto" type="checkbox" id="navbarFixed" onclick="navbarFixed(this)" />
                </div>
              </div>
              <div class="horizontal dark my-3">
                <div class="mt-2 d-flex">
                  <h6 class="mb-0">Light / Dark</h6>
                  <div class="form-check form-switch ps-0 ms-auto my-auto">
                    <input class="form-check-input mt-1 ms-auto" type="checkbox" id="dark-version" onclick="darkMode(this)" />
                  </div>
                </div>
              </div>
              <div class="horizontal dark my-sm-4">
                <a class="btn bg-gradient-info w-100" href="https://www.creative-tim.com/product/material-dashboard-pro">Free Download</a>
                <a class="btn btn-outline-dark w-100" href="https://www.creative-tim.com/learning-lab/bootstrap/overview/material-dashboard">View documentation</a>
                <div class="w-100 text-center">
                  <a class="github-button" href="https://github.com/creativetimofficial/material-dashboard" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star creativetimofficial/material-dashboard on GitHub">Star</a>
                  <h6 class="mt-3">Thank you for sharing!</h6>
                  <a href="https://twitter.com/intent/tweet?text=Check%20Material%20UI%20Dashboard%20made%20by%20%40CreativeTim%20%23webdesign%20%23dashboard%20%23bootstrap5&amp;url=https%3A%2F%2Fwww.creative-tim.com%2Fproduct%2Fsoft-ui-dashboard" class="btn btn-dark mb-0 me-2" target="_blank">
                    <i class="fab fa-twitter me-1" aria-hidden="true"></i> Tweet
                  </a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=https://www.creative-tim.com/product/material-dashboard" class="btn btn-dark mb-0 me-2" target="_blank">
                    <i class="fab fa-facebook-square me-1" aria-hidden="true"></i> Share
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </aside>

    )
}

export default SideNavBar