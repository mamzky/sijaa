import React from "react";
import SideNavBar from "./SideNavBar";
import TopNavBar from "./TopNavBar";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
    return (
        <div>
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <Outlet />
            </main>
        </div>
    )
}

export default Layout