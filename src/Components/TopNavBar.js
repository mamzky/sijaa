import React from 'react'
import Constant from '../Utils/Constants'

function TopNavBar() {
  const username = localStorage?.getItem(Constant.USERNAME)
  return (
    <div>
        {/* <!-- Navbar --> */}
        <nav className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
          <div className="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                <li className="breadcrumb-item text-sm"><a className="opacity-5 text-dark" href="javascript:;">Pages</a></li>
                <li className="breadcrumb-item text-sm text-dark active" aria-current="page">Dashboard</li>
              </ol>
              <h6 className="font-weight-bolder mb-0">Dashboard</h6>
            </nav>
            <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
              <div className="ms-md-auto pe-md-3 d-flex align-items-center"/>
              <ul className="navbar-nav  justify-content-end">
                {/* <li className="nav-item d-flex align-items-center">
                  <a className="btn btn-outline-primary btn-sm mb-0 me-3" target="_blank" href="https://www.creative-tim.com/builder?ref=navbar-material-dashboard">Online Builder</a>
                </li> */}
                {/* <li className="mt-2">
                  <a className="github-button" href="https://github.com/creativetimofficial/material-dashboard" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star creativetimofficial/material-dashboard on GitHub">Star</a>
                </li> */}
                <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
                  <a href="javascript:;" className="nav-link text-body p-0" id="iconNavbarSidenav">
                    <div className="sidenav-toggler-inner">
                      <i className="sidenav-toggler-line"></i>
                      <i className="sidenav-toggler-line"></i>
                      <i className="sidenav-toggler-line"></i>
                    </div>
                  </a>
                </li>
                {/* <li className="nav-item px-3 d-flex align-items-center">
                  <a href="javascript:;" className="nav-link text-body p-0">
                    <i className="fa fa-cog fixed-plugin-button-nav cursor-pointer"></i>
                  </a>
                </li> */}
                <li className="nav-item dropdown pe-2 d-flex align-items-center">
                  <a href="javascript:;" className="nav-link text-body p-0" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                  <a href="../pages/sign-in.html" className="nav-link text-body font-weight-bold px-0">
                    <i className="fa fa-user me-sm-1"></i>
                    <span className="d-sm-inline d-none">{username}</span>
                  </a>
                  </a>
                  <ul className="dropdown-menu  dropdown-menu-end  px-2 py-0 me-sm-n2" aria-labelledby="dropdownMenuButton">
                    <li>
                      <a className="dropdown-item border-radius-md" href="javascript:;">
                        <div className="d-flex py-1">
                        <i className="material-icons opacity-10">logout</i>
                          <div className="d-flex flex-column justify-content-center">
                            <h5 style={{marginLeft: 10}} className="text-sm font-weight-normal mb-1">
                              Logout
                            </h5>
                          </div>
                        </div>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        {/* <!-- End Navbar --> */}
    </div>
  )
}

export default TopNavBar