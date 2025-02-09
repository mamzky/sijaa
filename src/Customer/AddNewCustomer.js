import React, { useState } from 'react'
import { Button, CloseButton, Col, Form, Modal, Spinner } from 'react-bootstrap'
import TopNavBar from '../Components/TopNavBar'
import SideNavBar from '../Components/SideNavBar'
import { useNavigate, useParams } from 'react-router-dom'
import { OnlyDigit } from '../Utils/General'
import { isEmpty } from 'ramda'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment/moment'
import { CUSTOMER_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog } from '../Utils/Utils'

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


    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const validation = () => {
        if (isEmpty(customerName)) {
            window.scrollTo(0, 0)
        } else {
            setShowModal(true)
        }
    }

    const submitNewCustomer = async () => {
        setShowModal(false)
        const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
        await addDoc(customerCollectionRef, {
            name: customerName,
            phone: phone,
            email: email,
            address: address,
            contact_person: contactPerson,
            notes,
            customer_code: `KNGCST${moment().format('DDMMYYhhmmss')}`,
            created_at: new Date().toISOString(),
            created_by: localStorage.getItem(Constant.USERNAME) ?? '-'
        }).then((res) => {
            console.log(res);
            addLog(localStorage.getItem(Constant.USERNAME), `create customer ${customerName}`)
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
                        Customer Baru
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama instansi', customerName)}
                    {summaryItem('Nomor telepon', phone)}
                    {summaryItem('Email', email)}
                    {summaryItem('Alamat', address)}
                    {summaryItem('Nama Contact person', contactPerson)}
                    {summaryItem('Catatan', notes)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => submitNewCustomer()}>Ya, Daftarkan</Button>
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
                                <Form.Label>Nama Instansi</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='customerName'
                                    value={customerName}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value)
                                    }}
                                    placeholder="Masukan nama"
                                />
                            </Form.Group>

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Telepon</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='customerPhone'
                                    value={phone}
                                    onChange={(e) => {
                                        const onlyDigits = OnlyDigit(e.target.value)
                                        setPhone(onlyDigits)
                                    }}
                                    placeholder="Masukan nomor telpon"
                                />
                            </Form.Group>

                            {/* EMAIL */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='customerEmail'
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                    }}
                                    placeholder="Masukan email"
                                />
                            </Form.Group>

                            {/* ADDRESS */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                <Form.Label>Alamat</Form.Label>
                                <Form.Control
                                    type="input"
                                    as="textarea" rows={3}
                                    name='customerAddress'
                                    value={address}
                                    onChange={(e) => {
                                        setAddress(e.target.value)
                                    }}
                                    placeholder="Masukan alamat"
                                />
                            </Form.Group>

                            {/* CONTACT PERSON */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                <Form.Label>Nama Customer</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerContactPerson'
                                    value={contactPerson}
                                    onChange={(e) => {
                                        setContactPerson(e.target.value)
                                    }}
                                    placeholder="Masukan nama contact person"
                                />
                            </Form.Group>

                            {/* NOTES */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>Catatan</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3}
                                    name='cuctomerNotes'
                                    value={notes}
                                    onChange={(e) => {
                                        setNotes(e.target.value)
                                    }}
                                    placeholder="Catatan"
                                />
                            </Form.Group>


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '50%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        validation()
                                    }}
                                >Tambah Customer Baru</Button>
                            </div>
                        </Form>
                    </div>
                </div>
        </div>
    )
}

export default AddNewCustomer