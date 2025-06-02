/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import AppColors from "../Utils/Colors";
import Constant from "../Utils/Constants";
import { isEmpty } from "ramda";
import isNil from "ramda/src/isNil";

function SideNavBar() {
  const [activeMenu, setActiveMenu] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const getRole = () => {
    setRole(localStorage.getItem(Constant.ROLE));
  };

  const performLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const checkLogin = async () => {
    const isLogin = await localStorage.getItem(Constant.USERNAME);
    if (isNil(isLogin)) {
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    switch (activeMenu) {
      case Constant.MENU_DASHBOARD:
        navigate("/");
        break;
      case Constant.MENU_CUSTOMER:
        navigate("/customer");
        break;
      case Constant.MENU_ORDER:
        navigate("/order");
        break;
      case Constant.MENU_PACKING:
        navigate("/packing");
        break;
      case Constant.MENU_DELIVERY:
        navigate("/delivery");
        break;
      case Constant.MENU_PRODUCT:
        navigate("/product");
        break;
      case Constant.MENU_STOCK:
        navigate("/stock");
        break;
      case Constant.MENU_CONTACT:
        navigate("/contact");
        break;
      case Constant.MENU_EMPLOYEE:
        navigate("/employee");
        break;

      default:
        break;
    }
  }, [activeMenu]);

  useEffect(() => {
    getRole();
    checkLogin();
  }, []);

  return (
    <aside
      className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark"
      id="sidenav-main"
    >
      <div className="sidenav-header">
        <i
          className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none"
          aria-hidden="true"
          id="iconSidenav"
        ></i>
        <a className="navbar-brand m-0" target="_blank">
          <h1 className="ms-1 font-weight-bold text-white">
            {Constant.APP_NAME}
          </h1>
          <span className="text-white">Sistem Informasi KNG</span>
        </a>
      </div>
      <div className="horizontal light mt-5 mb-2">
        <div
          className="collapse navbar-collapse  w-auto "
          id="sidenav-collapse-main"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a
                className={`nav-link text-white bg-gradient-primary ${
                  activeMenu === Constant.MENU_CUSTOMER ? "active" : ""
                }`}
                onClick={() => {
                  setActiveMenu(Constant.MENU_CUSTOMER);
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">table_view</i>
                </div>
                <span className="nav-link-text ms-1">Customer</span>
              </a>
            </li>
            {/* ORDER */}
            {role !== "SLS" && (
              <li className={`nav-item`}>
                <a
                  className={`nav-link text-white bg-gradient-primary ${
                    activeMenu === Constant.MENU_ORDER ? "active" : ""
                  }`}
                  // href="/order"
                  onClick={() => {
                    setActiveMenu(Constant.MENU_ORDER);
                    // localStorage.setItem(Constant.ACTIVE_MENU, Constant.MENU_ORDER)
                  }}
                >
                  <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="material-icons opacity-10">shopping_cart</i>
                  </div>
                  <span className="nav-link-text ms-1">Order</span>
                </a>
              </li>
            )}
            {/* PACKING */}
            {role !== "SLS" && (
              <li className={`nav-item`}>
                <a
                  className={`nav-link text-white bg-gradient-primary ${
                    activeMenu === Constant.MENU_PACKING ? "active" : ""
                  }`}
                  // href="/order"
                  onClick={() => {
                    setActiveMenu(Constant.MENU_PACKING);
                  }}
                >
                  <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="material-icons opacity-10">inventory_2</i>
                  </div>
                  <span className="nav-link-text ms-1">Packing</span>
                </a>
              </li>
            )}

            {/* DELIVERY */}
            <li className={`nav-item`}>
              <a
                className={`nav-link text-white bg-gradient-primary ${
                  activeMenu === Constant.MENU_DELIVERY ? "active" : ""
                }`}
                onClick={() => {
                  setActiveMenu(Constant.MENU_DELIVERY);
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">local_shipping</i>
                </div>
                <span className="nav-link-text ms-1">Delivery</span>
              </a>
            </li>

            {/* PRODUK */}
            <li className="nav-item">
              <a
                className={`nav-link text-white bg-gradient-primary ${
                  activeMenu === Constant.MENU_PRODUCT ? "active" : ""
                }`}
                onClick={() => {
                  setActiveMenu(Constant.MENU_PRODUCT);
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">receipt_long</i>
                </div>
                <span className="nav-link-text ms-1">Produk</span>
              </a>
            </li>

            {role !== "SLS" && (
              <li className="nav-item">
                <a
                  className={`nav-link text-white bg-gradient-primary ${
                    activeMenu === Constant.MENU_STOCK ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveMenu(Constant.MENU_STOCK);
                  }}
                >
                  <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="material-icons opacity-10">all_inbox</i>
                  </div>
                  <span className="nav-link-text ms-1">Stok</span>
                </a>
              </li>
            )}

            <li className="nav-item">
              <a
                className={`nav-link text-white bg-gradient-primary ${
                  activeMenu === Constant.MENU_CONTACT ? "active" : ""
                }`}
                onClick={() => {
                  setActiveMenu(Constant.MENU_CONTACT);
                }}
              >
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">person</i>
                </div>
                <span className="nav-link-text ms-1">Kontak</span>
              </a>
            </li>

            {role !== "SLS" && (
              <li className="nav-item">
                <a
                  className={`nav-link text-white bg-gradient-primary ${
                    activeMenu === Constant.MENU_EMPLOYEE ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveMenu(Constant.MENU_EMPLOYEE);
                  }}
                >
                  <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                    <i className="material-icons opacity-10">group</i>
                  </div>
                  <span className="nav-link-text ms-1">Karyawan</span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="sidenav-footer position-absolute w-100 bottom-0 ">
        <div className="mx-2">
          <Button
            style={{ width: "100%" }}
            variant="danger"
            type="button"
            onClick={performLogout}
          >
            <i
              className="material-icons opacity-10"
              style={{ marginRight: 10 }}
            >
              logout
            </i>
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default SideNavBar;
