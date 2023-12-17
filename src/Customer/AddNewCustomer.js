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
import { CUSTOMER_COLLECTION, LOG_COLLECTION, PRODUCT_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog } from '../Utils/Utils'
import AppColors from '../Utils/Colors'

function AddNewCustomer() {

    const navigate = useNavigate()

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [notes, setNotes] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // validationFlag
    const [errorName, setErrorName] = useState('')
    const [errNameExist, setErrNameExist] = useState(false)
    const [errorSize, setErrorSize] = useState('')
    const [errorBasePrice, setErrorBasePrice] = useState('')
    const [errorSellPrice, setErrorSellPrice] = useState('')
    const [errorSupplier, setErrorSupplier] = useState('')
    const [errorQty, setErrorQty] = useState('')
    const { id } = useParams()


    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const checkCustomerExist = async (name) => {
        // let isExist
        // let customerExist = []
        // const q = query(collection(db, CUSTOMER_COLLECTION)
        //     , where('name', '==', name))
        // const querySnapshot = await getDocs(q);
        // const result = querySnapshot?.docs?.map(doc => doc.data())
        // if (!querySnapshot?.empty) {
        //     customerExist = result?.findIndex((e) => e.name.toLowerCase() === name.toLowerCase())
        //     isExist = customerExist >= 0
        // } else {
        //     isExist = false
        // }
        // return isExist
        return true
    }

    const validation = () => {
        if (isEmpty(customerName)) {
            console.log('customerName');
            setErrorName(true)
            window.scrollTo(0, 0)
        } else {
            setShowModal(true)
        }
        // checkCustomerExist(customerName)
        //     .then((val) => {
        //         if (val) {
        //             setErrNameExist(true)
        //             window.scrollTo(0, 0)
        //         } else {
        //             if (isEmpty(customerName)) {
        //                 console.log('customerName');
        //                 setErrorName(true)
        //                 window.scrollTo(0, 0)
        //             } else {
        //                 setShowModal(true)
        //             }
        //         }
        //     })
        //     .catch((err) => {
        //         setIsLoading(false)
        //     })
        //     .finally(() => {
        setIsLoading(false)
        //     })
    }

    const submitNewProduct = async () => {
        setShowModal(false)
        const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
        await addDoc(customerCollectionRef, {
            name: customerName,
            phone: phone,
            email: email,
            address: address,
            contact_person: contactPerson,
            notes,
            customer_code: `JAACST${moment().format('DDMMYYhhmm')}`,
            created_at: moment().locale('id').toISOString()
        }).then((res) => {
            console.log(res);
            addLog(localStorage.getItem(Constant.USERNAME), `create customer ${customerName}`)
            navigate('/customer')
        })
    }

    useEffect(() => {
        console.log('ID', id);
    }, [])

    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Customer Baru
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
                    <Button variant="success" onClick={() => submitNewProduct()}>Ya, Daftarkan</Button>
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
                            <h2>Tambah Customer Baru</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='productName'>
                                <Form.Label>Nama Customer</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerName'
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value)
                                        // setErrorName(isEmpty(e.target.value))
                                        // setErrNameExist(false)
                                    }}
                                    placeholder="Masukan nama"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Telepon Customer</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerPhone'
                                    value={phone}
                                    onChange={(e) => {
                                        const onlyDigits = OnlyDigit(e.target.value)
                                        setPhone(onlyDigits)
                                    }}
                                    placeholder="Masukan nomor telpon"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* EMAIL */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                <Form.Label>Email Customer</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerEmail'
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        // setErrorName(isEmpty(e.target.value))
                                        // setErrNameExist(false)
                                    }}
                                    placeholder="Masukan email"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* ADDRESS */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                <Form.Label>Alamat Customer</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    as="textarea" rows={3}
                                    name='customerAddress'
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value)
                                        // setErrorName(isEmpty(e.target.value))
                                        // setErrNameExist(false)
                                    }}
                                    placeholder="Masukan alamat"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* CONTACT PERSON */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                <Form.Label>Contact Person</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerContactPerson'
                                    value={contactPerson}
                                    onChange={(e) => {
                                        setContactPerson(e.target.value)
                                        // setErrorName(isEmpty(e.target.value))
                                        // setErrNameExist(false)
                                    }}
                                    placeholder="Masukan nama contact person"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* NOTES */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>Catatan</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    as="textarea" rows={3}
                                    name='cuctomerNotes'
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value)
                                        // setErrorName(isEmpty(e.target.value))
                                        // setErrNameExist(false)
                                    }}
                                    placeholder="Catatan"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '50%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        setIsLoading(true)
                                        validation()
                                    }}
                                >Tambah Customer Baru</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AddNewCustomer