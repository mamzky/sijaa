import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { Button, CloseButton, Col, Form, Modal, Spinner } from 'react-bootstrap'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection } from "@firebase/firestore"
import { db } from "../Config/FirebaseConfig"
import { addLog } from "../Utils/Utils"
import Constant from "../Utils/Constants"
import { CONTACT_COLLECTION } from "../Utils/DataUtils"
import { v4 as uuidv4 } from 'uuid';

function AddNewContact() {

    const navigate = useNavigate()

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        contactId: uuidv4(),
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        contactAddress: '',
        contactNotes: '',
    });

    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };


    const tampilpopup = () => {
        // Melakukan sesuatu dengan data JSON, misalnya menampilkan di konsol
        setShowModal(true);
        // Jika Anda ingin melakukan sesuatu yang lain dengan data JSON, Anda bisa menambahkan kode di sini
    };

    const submitContact = async () => {

        setFormData(prevState => ({
            ...prevState,
            ['contactId']: uuidv4()
        }));

        const contactCollectionRef = collection(db, CONTACT_COLLECTION)
        await addDoc(contactCollectionRef, formData)
            .then((res) => {
                console.log(res);
                addLog(localStorage.getItem(Constant.USERNAME), `create contact ${formData.contactName}`)
                navigate('/contact')
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false)
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
                    {summaryItem('Nama customer', formData.contactName)}
                    {summaryItem('Nomor telepon', formData.contactPhone)}
                    {summaryItem('Email', formData.contactEmail)}
                    {summaryItem('Alamat', formData.contactAddress)}
                    {summaryItem('Catatan', formData.contactNotes)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => submitContact()}>Ya, Daftarkan</Button>
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
                            <h2>Tambah Kontak</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactName'>
                                <Form.Label>Nama Contact</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='contactName'
                                    value={formData.contactName}
                                    onChange={handleInputChange}
                                    placeholder="Masukan nama"
                                />
                            </Form.Group>

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Telepon Contact</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='contactPhone'
                                    id='phone'
                                    value={formData.contactPhone}
                                    onChange={(e) => {
                                        if (/^\d*$/.test(e.target.value) && e.target.value.length < 14) {
                                            handleInputChange(e)
                                        }
                                    }}
                                    placeholder="Masukan nomor telpon"
                                />
                            </Form.Group>

                            {/* EMAIL */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                <Form.Label>Email Contact</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='contactEmail'
                                    id='email'
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    placeholder="Masukan email"
                                />
                            </Form.Group>

                            {/* ADDRESS */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                <Form.Label>Alamat Contact</Form.Label>
                                <Form.Control
                                    type="input"
                                    as="textarea" rows={3}
                                    name='contactAddress'
                                    id='email'
                                    value={formData.contactAddress}
                                    onChange={handleInputChange}
                                    placeholder="Masukan alamat"
                                />
                            </Form.Group>

                            {/* NOTES */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>Catatan</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3}
                                    name='contactNotes'
                                    id='email'
                                    value={formData.contactNotes}
                                    onChange={handleInputChange}
                                    placeholder="Catatan"
                                />
                            </Form.Group>


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '50%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        tampilpopup()
                                        console.log(formData)
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

export default AddNewContact
