import React, { useEffect, useState } from 'react'
import { Button, CloseButton, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import TopNavBar from '../Components/TopNavBar'
import SideNavBar from '../Components/SideNavBar'
import SmallImageCard from '../Components/SmallImageCard'
import CustomTable from '../Components/CustomTable'
import { useNavigate, useParams } from 'react-router-dom'
import { DigitFormatter, OnlyDigit } from '../Utils/General'
import { empty, isEmpty } from 'ramda'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment/moment'
import { CUSTOMER_COLLECTION, LOG_COLLECTION, PRODUCT_COLLECTION, TRANSACTION_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog, calculateTotal } from '../Utils/Utils'
import AppColors from '../Utils/Colors'

function CustomerDetail() {

    const navigate = useNavigate()
    const transactionCollectionRef = collection(db, TRANSACTION_COLLECTION)
    const [transactionData, setTransactionData] = useState([])

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [notes, setNotes] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // validationFlag
    const { customer_code } = useParams()


    // NEW STATE
    const [customerData, setCustomerData] = useState()
    const [isEdit, setIsEdit] = useState(false)


    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const validation = () => {
        setShowModal(true)
    }

    useEffect(() => {
        getCustomerData(customer_code)
        getTransactionList()
    }, [])

    const getCustomerData = async (customer_code) => {
        setIsLoading(true)
        const q = query(collection(db, CUSTOMER_COLLECTION)
            , where('customer_code', '==', customer_code))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            setCustomerData(result[0])
            console.log('RESULT', result[0]);
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.log('FAILED');
        }
    }
    const getTransactionList = async () => {
        const data = await getDocs(transactionCollectionRef)
        const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        console.log(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setTransactionData(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

        const q = query(collection(db, TRANSACTION_COLLECTION)
            , where('customer_id', '==', customer_code))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            setTransactionData(result)
            console.log('RESULT', result);
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.log('FAILED');
        }

      }

    const loadDataToForm = (data) => {
        setCustomerName(data?.name)
        setPhone(data?.phone)
        setEmail(data?.email)
        setAddress(data?.address)
        setContactPerson(data?.contact_person)
        setNotes(data?.notes)
    }

    const updateDataCustomer = async () => {
        setIsLoading(true)
        const newCustomerData = {
            name: customerName,
            phone: phone,
            email: email,
            address: address,
            contact_person: contactPerson,
            notes: notes,
            updated_at: moment(new Date).toISOString(),
            customer_code: customerData?.customer_code,
            updated_at: moment().format('DD/MMM/YYYY hh:mm')
        }
        const oldProductDoc = doc(db, CUSTOMER_COLLECTION, customerData?.id)
        updateDoc(oldProductDoc, newCustomerData)
            .then(() => {
                setIsLoading(false)
                setShowModal(false)
                addLog('UPDATE CUSTOMER DATA', `${localStorage.getItem(Constant.USERNAME)} update customer ${customerName}, from ${JSON.stringify(customerData)} to ${JSON.stringify({
                    name: customerName,
                    phone: phone,
                    email: email,
                    address: address,
                    contact_person: contactPerson,
                    notes: notes,
                })}`)
                navigate('/customer')
            })
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
                    <Button variant="success" onClick={() => { updateDataCustomer() }}>Ya, Ubah</Button>
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
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>{customerData?.name}</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            <Row>
                                {/* NAME */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='productName'>
                                    <Form.Label>Nama Customer</Form.Label>
                                    {isEdit ?
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
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.name}</h4>
                                    }
                                </Form.Group>

                                {/* PHONE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                    <Form.Label>Nomor Telepon Customer</Form.Label>
                                    {isEdit ?
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
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.phone}</h4>
                                    }
                                </Form.Group>
                            </Row>

                            <Row>
                                {/* EMAIL */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                    <Form.Label>Email Customer</Form.Label>
                                    {isEdit ?
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
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.email}</h4>
                                    }
                                </Form.Group>

                                {/* ADDRESS */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                    <Form.Label>Alamat Customer</Form.Label>
                                    {isEdit ?
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
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.address}</h4>
                                    }
                                </Form.Group>
                            </Row>

                            <Row>
                                {/* CONTACT PERSON */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                    <Form.Label>Contact Person</Form.Label>
                                    {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            name='contactPerson'
                                            value={contactPerson}
                                            onChange={(e) => {
                                                setContactPerson(e.target.value)
                                            }}
                                            placeholder="Contact person"
                                        />
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.contact_person}</h4>
                                    }
                                </Form.Group>

                                {/* NOTES */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                    <Form.Label>Catatan</Form.Label>
                                    {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            as="textarea" rows={3}
                                            name='cuctomerNotes'
                                            value={notes}
                                            onChange={(e) => {
                                                setNotes(e.target.value)
                                            }}
                                            placeholder="Catatan"
                                        />
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{customerData?.notes}</h4>
                                    }
                                </Form.Group>
                            </Row>


                            <div className="col-lg-8 col-md-3 my-4" style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                                <Button
                                    variant='light'
                                    style={{ width: '25%', alignSelf: 'flex-start', marginRight: 20 }}
                                    onClick={() => {
                                        isEdit ? setIsEdit(false) : navigate(-1)
                                    }}
                                >{isEdit ? 'Batal' : 'Kembali'}</Button>
                                <Button
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        if (isEdit) {
                                            validation()
                                        } else {
                                            loadDataToForm(customerData)
                                            setIsEdit(true)
                                        }
                                    }}
                                >{isEdit ? 'Simpan' : 'Edit Data Customer'}</Button>
                            </div>
                        </Form>
                    </div>

                    <div class="row mt-4">
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
                                                <tr>
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
                                                                <h6 className="mb-0 text-sm">{'Aktif'}</h6>
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
                                                                <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(calculateTotal(item?.order_list))}`}</h6>
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
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CustomerDetail