import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"

const ContactDetail = () => {
    return (
        <div>
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Contact Detail</h2>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default ContactDetail