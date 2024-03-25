import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { Button, CloseButton, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'

const ContactDetail = () => {
    return (
        <div>
        <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>John Doe</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            <Row>
                                {/* NAME */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='productName'>
                                    <Form.Label>Nama Customer</Form.Label>
                                    {/* {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            name='customerName'
                                            value={customerName}
                                            onChange={(e) => {
                                                setCustomerName(e.target.value)
                                            }}
                                            placeholder="Masukan nama"
                                        />
                                        : */}
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>John Doe</h4>
                                    
                                </Form.Group>

                                {/* PHONE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                    <Form.Label>Nomor Telepon Customer</Form.Label>
                                    {/* {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            name='customerPhone'
                                            value={phone}
                                            onChange={(e) => {
                                                setPhone(e.target.value)
                                            }}
                                            placeholder="Masukan nomor telepon"
                                        />
                                        : */}
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>0812345678910</h4>
                                    
                                </Form.Group>
                            </Row>

                            <Row>
                                {/* EMAIL */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                    <Form.Label>Email Customer</Form.Label>
                                    {/* {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            name='customerEmail'
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value)
                                            }}
                                            placeholder="Masukan email"
                                        />
                                        : */}
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>JohnDoe@gmail.com</h4>
                                    
                                </Form.Group>

                                {/* ADDRESS */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                    <Form.Label>Alamat Customer</Form.Label>
                                    {/* {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            as="textarea" rows={3}
                                            name='customerAddress'
                                            value={address}
                                            onChange={(e) => {
                                                setAddress(e.target.value)
                                            }}
                                            placeholder="Masukan alamat"
                                        />
                                        : */}
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>jl mangga no 12</h4>
                                    
                                </Form.Group>
                            </Row>

                            

                            <div className="col-lg-8 col-md-3 my-4" style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                                {/* <Button
                                    variant='light'
                                    style={{ width: '25%', alignSelf: 'flex-start' }}
                                    onClick=
                                >{isEdit ? 'Batal' : 'Kembali'}</Button> */}
                                <Button
                                    variant='success'
                                    className='mx-2'
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    // onClick={() => {
                                    //     if (isEdit) {
                                    //         validation()
                                    //     } else {
                                    //         loadDataToForm(customerData)
                                    //         setIsEdit(true)
                                    //     }
                                    // }}
                                >{'Edit Data Customer'}
                                </Button>
                                <Button
                                    // style={{ width: '25%', alignSelf: 'flex-end', visibility: isEdit ? 'hidden' : 'visible' }}
                                    // onClick={() => {
                                    //     navigate(`/customer/detail/${customer_code}/stock`)
                                    // }}
                                >{'Lihat Stok Customer'}</Button>
                            </div>
                        </Form>
                    </div>

                    {/* <div class="row mt-4">
                        <div className="card-body px-0 pb-2">
                            <div className="table-responsive">
                                <table className="table align-items-center mb-0">
                                    <thead>
                                        <tr>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Transaksi</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionData?.map((item, index) => {
                                            return (
                                                <tr key={item?.id}>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column justify-content-center">
                                                                <h6 className="mb-0 text-sm">{index + 1}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column justify-content-center">
                                                                <h6 style={{ cursor: 'pointer' }} className="mb-0 text-sm">{item?.order_number}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column">
                                                                <h6 className="mb-0 text-sm">{item?.customer?.name}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column">
                                                                <h6 className="mb-0 text-sm">{item?.type}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column">
                                                                <h6 className="mb-0 text-sm">{item?.status ? 'Aktif' : 'Non-Aktif'}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column">
                                                                <h6 className="mb-0 text-sm">{moment(item.created_at).format('DD MMM YYYY')}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column">
                                                                <h6 className="mb-0 text-sm">{`Rp${item.total_bill}`}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div> */}
                </div>
            </main>
        </div>
    )
}

export default ContactDetail