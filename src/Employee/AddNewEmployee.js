import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { Button, CloseButton, Col, Form, Modal, Spinner } from 'react-bootstrap'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection } from "@firebase/firestore"
import { db } from "../Config/FirebaseConfig"
import { addLog } from "../Utils/Utils"
import Constant from "../Utils/Constants"
import { EMPLOYEE_COLLECTION } from "../Utils/DataUtils"
import { v4 as uuidv4 } from 'uuid';


function AddNewEmployee() {

    const navigate = useNavigate()

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const employeeRole = (employeeId, employeeRole) => {
        const statusValue = convertEnumToValue(employeeRole); 
        EMPLOYEE_COLLECTION.ref(`employee/${employeeId}/status`).set(statusValue);
    };

    const convertEnumToValue = (employeeRole) => {
        // Kode untuk mengonversi enum ke nilai yang sesuai
        switch (employeeRole) {
            case 'SUPERADMIN':
                return 0;
            case 'ADMIN':
                return 1;
            case 'MARKETING':
                return 2;
            case 'SALES':
                return 3;
            case 'GUDANG':
                return 4;    
            default:
                return null;
        }
    };
    

    const [formData, setFormData] = useState({
        employeeId: uuidv4(),
        employeeName: '',
        employeeRole: '',
        employeeStatus: '',
        employeeContact: '',
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
            ['employeeId']: uuidv4()
        }));

        const employeeCollectionRef = collection(db, EMPLOYEE_COLLECTION)
        await addDoc(employeeCollectionRef, formData)
            .then((res) => {
                console.log(res);
                addLog(localStorage.getItem(Constant.USERNAME), `create employee ${formData.employeeName}`)
                navigate('/employee')
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
                        Karyawan Baru
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama Karyawan', formData.employeeName)}
                    {summaryItem('Role Karyawan', formData.employeeRole)}
                    {summaryItem('Status Karyawan', formData.employeeStatus)}
                    {summaryItem('Kontak Karyawan', formData.employeeContact)}  
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
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Tambah Karyawan</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='employeeName'>
                                <Form.Label>Nama Karyawan</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='employeeName'
                                    value={formData.employeeName}
                                    onChange={handleInputChange}
                                    placeholder="Masukan nama"
                                />
                            </Form.Group>

                             {/* ROLE */}
                             <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='role'>
                             <Form.Label>Peran</Form.Label>
                             <Form.Control
                                as="select"
                                name='employeeRole'
                                value={formData.employeeRole}
                                onChange={handleInputChange}
                            >
                            <option value="gudang">Gudang</option>
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                            </Form.Control>
                            </Form.Group>

                              {/* STATUS */}
                              <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='status'>
                                <Form.Label>Status</Form.Label>
                                <div>
                                    <Form.Check
                                        type="radio"
                                        id="active"
                                        label="Active"
                                        name="employeeStatus"
                                        value="active"
                                        checked={formData.employeeStatus === "active"}
                                        onChange={handleInputChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        id="inactive"
                                        label="Inactive"
                                        name="employeeStatus"
                                        value="inactive"
                                        checked={formData.employeeStatus === "inactive"}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </Form.Group>
                              {/* <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactName'>
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='contactName'
                                    value={formData.employeeName}
                                    onChange={handleInputChange}
                                    placeholder="Masukan nama"
                                />
                            </Form.Group> */}

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Contact Karyawan</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='employeeContact'
                                    id='phone'
                                    value={formData.employeeContact}
                                    onChange={(e) => {
                                        if (/^\d*$/.test(e.target.value) && e.target.value.length < 14) {
                                            handleInputChange(e)
                                        }
                                    }}
                                    placeholder="Masukan Kontak"
                                />
                            </Form.Group>

                           

                            {/* ADDRESS */}
                            {/* <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
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
                            {/* <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                <Form.Label>Catatan</Form.Label>
                                <Form.Control
                                    as="textarea" rows={3}
                                    name='contactNotes'
                                    id='email'
                                    value={formData.contactNotes}
                                    onChange={handleInputChange}
                                    placeholder="Catatan"
                                />
                            </Form.Group> */}


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '50%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        tampilpopup()
                                        console.log(formData)
                                    }}
                                >Tambah Karyawan Baru</Button>
                            </div>
                        </Form>
                    </div>
                </div>
        </div>
    )
}

export default AddNewEmployee
