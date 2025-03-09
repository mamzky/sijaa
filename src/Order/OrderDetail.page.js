import React, { useEffect, useState } from 'react'
import { Button, CloseButton, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import TopNavBar from '../Components/TopNavBar'
import SideNavBar from '../Components/SideNavBar'
import SmallImageCard from '../Components/SmallImageCard'
import CustomTable from '../Components/CustomTable'
import { useAsyncError, useNavigate, useParams } from 'react-router-dom'
import { DigitFormatter, OnlyDigit } from '../Utils/General'
import { empty, isEmpty } from 'ramda'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment/moment'
import { CUSTOMER_COLLECTION, LOG_COLLECTION, PRODUCT_COLLECTION, ORDER_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog, calculateTotal } from '../Utils/Utils'
import AppColors from '../Utils/Colors'
import { toast } from 'react-toastify'

function OrderDetail() {

    const navigate = useNavigate()

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [notes, setNotes] = useState('')
    const [updatedNotes, setUpdatedNotes] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [updateModal, setUpdateModal] = useState(false)
    const [closeOrderModal, setCloseOrderModal] = useState(false)
    const [closeOrderNote, setCloseOrderNote] = useState('')

    const [selectedProduct, setSelectedProduct] = useState([])

    // validationFlag
    const { order_number } = useParams()


    // NEW STATE
    const [orderData, setOrderData] = useState()
    const [originalOrderData, setOriginalOrderData] = useState()
    const [hasItemNotSold, setHasItemNotSold] = useState(false)

    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    useEffect(() => {
        getOrderData(order_number)
    }, [])

    const getOrderData = async (order_number) => {
        setIsLoading(true)
        const q = query(collection(db, ORDER_COLLECTION)
            , where('order_number', '==', order_number))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            setOrderData(result[0])
            setOriginalOrderData(result[0])
            if (result[0]) {
                setHasItemNotSold(result[0]?.order_list?.some(item => !item.sold))
            }
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.log('FAILED');
        }
    }

    const updateData = () => {
        const newData = { ...orderData }
        newData.status = !orderData.status
        newData.notes = updatedNotes
        const oldData = doc(db, ORDER_COLLECTION, orderData?.id)
        updateDoc(oldData, newData)
            .then((val) => {
                window.location.reload()
                setIsLoading(false)
                setUpdateModal(false)
                addLog('UPDATE STATUS ORDER', `${localStorage.getItem(Constant.USERNAME)} update status order menjadi ${newData?.status}`)
            })
    }

    const updateOrder = () => {
        setIsLoading(true)
        const setSoldOrder = orderData?.order_list?.map((val) => {
            return selectedProduct?.includes(val?.id) ? { ...val, sold: true, updated_at: new Date().toISOString() } : val
        })
        const unpaidItem = setSoldOrder?.some(item => !item.sold)
        
        const newOrderData = { ...orderData, order_list: setSoldOrder, notes: closeOrderNote, status: unpaidItem ? orderData?.status : 'DONE' }
        const oldOrderDoc = doc(db, ORDER_COLLECTION, orderData?.id)
        updateDoc(oldOrderDoc, newOrderData)
            .then(() => {
                setCloseOrderModal(false)
                setIsLoading(false)
                setCloseOrderNote('')
                window.location.reload()
            })
            .catch((err) => {
                setIsLoading(false)
                toast.error('Terjadi Kesalahan, silahkan ulangi beberapa saat dan reload halaman')
                console.log('ERR', err);
            })
    }

    const isSold = (id) => {
        const sold = originalOrderData?.order_list?.find((e) => e.id === id)?.sold ?? false
        return sold
    }

    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Ubah Data Customer
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama customer', customerName)}
                    {summaryItem('Nomor telepon', phone)}
                    {summaryItem('Email', email)}
                    {summaryItem('Alamat', address)}
                    {summaryItem('Contact person', contactPerson)}
                    {summaryItem('Catatan', notes)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => { }}>Ya, Ubah</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={isLoading} centered>
                <Modal.Body backdrop={'false'} show={true} onHide={() => setShowModal(false)}
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}
                >
                    <div>
                        <Spinner animation="border" role="status" style={{ alignSelf: 'center' }}>
                        </Spinner>
                    </div>
                    <h3 style={{ marginLeft: 20 }}>Loading...</h3>
                </Modal.Body>
            </Modal>
            <Modal show={updateModal} centered>
                <Modal.Header>Apakah anda yakin mengubah status transaksi?</Modal.Header>
                <Modal.Body backdrop={'false'} show={true} onHide={() => setUpdateModal(false)}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        width: '100%'
                    }}
                >
                    <div style={{ width: '100%' }}>
                        <Form.Control
                            as="textarea"
                            name='orderNotes'
                            value={updatedNotes}
                            onChange={(e) => {
                                setUpdatedNotes(e.target.value)
                            }}
                            placeholder="Catatan..."
                            style={{ width: '100%' }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <Button
                            variant={'success'}
                            style={{ alignSelf: 'flex-end' }}
                            onClick={() => {
                                updateData()
                            }}
                        >Ya, Ubah</Button>
                        <Button
                            className='mx-2'
                            variant={'danger'}
                            onClick={() => setUpdateModal(false)}
                        >Tidak</Button>
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal show={closeOrderModal} onHide={() => setCloseOrderModal(false)}>
                <Modal.Header>Simpan Perubahan Order</Modal.Header>
                <Modal.Body>
                    <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                        <Form.Label>Catatan Order</Form.Label>
                        <Form.Control
                            style={{ width: '100%' }}
                            type="input"
                            name='closeOrderNote'
                            value={closeOrderNote}
                            onChange={(e) => {
                                setCloseOrderNote(e.target.value)
                            }}
                            placeholder="Catatan Order"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => {
                        setCloseOrderModal(false)
                        setCloseOrderNote('')
                    }}>Cancel</Button>
                    <Button variant="danger" onClick={() => {
                        updateOrder()
                    }}>Ya, Selesaikan</Button>
                </Modal.Footer>
            </Modal>
            <div className="container-fluid py-4">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                        <h2>
                            <i
                                className="material-icons opacity-10"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate(-1)}
                            >arrow_back_ios</i>
                            {`Order Detail : ${order_number}`}</h2>
                        <p style={{ paddingLeft: 24 }}>{`Dibuat pada : ${moment(orderData?.created_at).format('DD MMM YYYY hh:mm')} oleh ${orderData?.created_by}`}</p>
                    </div>
                </div>
                <div className="row mt-4">
                    <Form>
                        <Row>
                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='productName'>
                                <Form.Label>Nama Customer</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.customer?.name}</h4>
                            </Form.Group>

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Telepon Customer</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.customer?.phone}</h4>
                            </Form.Group>
                        </Row>

                        <Row>
                            {/* EMAIL */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                <Form.Label>Email Customer</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.customer?.email}</h4>
                            </Form.Group>

                            {/* ADDRESS */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                <Form.Label>Alamat Customer</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.customer?.address}</h4>

                            </Form.Group>
                        </Row>

                        <Row>
                            {/* CONTACT PERSON */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                <Form.Label>Contact Person</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.customer?.contact_person}</h4>
                            </Form.Group>

                            {/* NOTES */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>Catatan</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{isEmpty(orderData?.notes) ? '-' : orderData?.notes}</h4>
                                {orderData?.status === 'DONE' && (
                                    <>
                                        <Form.Label style={{ marginTop: 10 }}>Catatan Pengiriman</Form.Label>
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{isEmpty(orderData?.delivery_note) ? '-' : orderData?.delivery_note}</h4>
                                    </>
                                )}
                            </Form.Group>
                        </Row>
                        <Row>
                            {/* Tipe */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                <Form.Label>Jenis</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.type}</h4>
                            </Form.Group>

                            {/* NOTES */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>DP</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.dp}</h4>
                            </Form.Group>
                        </Row>
                        <Row>
                            {/* Status */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='status'>
                                <Form.Label>Status</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.status}</h4>
                            </Form.Group>
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='pic'>
                                <Form.Label>PIC</Form.Label>
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{orderData?.pic ?? '-'}</h4>
                            </Form.Group>
                        </Row>
                    </Form>
                </div>

                <div class="row mt-4">
                    <div className="card-body px-0 pb-2">
                        <div className="table-responsive">
                            <table className="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Harga</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Diskon</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Lunas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderData?.order_list?.map((item, index) => {
                                        return (
                                            <tr>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column justify-content-center">
                                                            <h6 className="mb-0 text-sm">{index + 1}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column justify-content-center">
                                                            <h6 className="mb-0 text-sm">{item?.name}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column">
                                                            <h6 className="mb-0 text-sm">{item?.qty}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column">
                                                            {isSold(item?.id) ?
                                                                <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(item?.price)}`}</h6>
                                                                :
                                                                <Form.Control
                                                                    disabled={isSold(item?.id)}
                                                                    type="input"
                                                                    name='contactEmail'
                                                                    id='price'
                                                                    value={DigitFormatter(item?.price)}
                                                                    onChange={(e) => {
                                                                        const changedPrice = orderData?.order_list?.map((val) => {
                                                                            return val?.id === item?.id ? { ...item, price: OnlyDigit(e?.target.value) } : val
                                                                        })
                                                                        const newOrderData = { ...orderData, order_list: changedPrice }
                                                                        setOrderData(newOrderData)
                                                                    }}
                                                                    placeholder="Masukan email"
                                                                />
                                                            }

                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column">
                                                            <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(item?.discount)}`}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }}>
                                                    <div className="ps-3 py-1">
                                                        <div className="d-flex flex-column">
                                                            <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(item?.qty * item.price - item?.discount)}`}</h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ backgroundColor: selectedProduct.includes(item.id) ? '#d6d6d6' : 'white' }} className='w-1 self-center flex fflex-row justify-center'
                                                >
                                                    {isSold(item?.id) ?
                                                        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                                                            <span style={{ fontSize: 12 }}>{`Dibayar pada`}</span>
                                                            <span style={{ fontSize: 12 }}>{`${moment(item?.updated_at)?.format('DD/MM/YYYY HH:mm')}`}</span>
                                                        </div>
                                                        :
                                                        <input
                                                            style={{
                                                                alignSelf: 'center',
                                                                alignContent: 'center',
                                                                width: '100%',

                                                            }}
                                                            disabled={isSold(item?.id)}
                                                            type="checkbox"
                                                            checked={selectedProduct.includes(item.id)}
                                                            onChange={() => {
                                                                if (selectedProduct.includes(item.id)) {
                                                                    setSelectedProduct(selectedProduct.filter(e => e !== item?.id))
                                                                } else {
                                                                    setSelectedProduct([...selectedProduct, item?.id])
                                                                }
                                                            }}
                                                        />
                                                    }

                                                </td>
                                            </tr>
                                        )
                                    })}

                                </tbody>
                            </table>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '100%',
                                justifyContent: 'space-between',
                                padding: 12
                            }}>
                                {hasItemNotSold &&
                                    <div style={{ display: 'flex', flexDirection: 'row-reverse', width: '100%' }}>
                                        <Button variant="success" style={{ padding: 8, width: 200 }}
                                            onClick={() => {
                                                setCloseOrderModal(true)
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetail