import { useEffect, useState } from "react"
import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { Button, CloseButton, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { useParams } from "react-router"
import { collection, getDoc, getDocs, query, where, doc, updateDoc } from "@firebase/firestore"
import { db } from "../Config/FirebaseConfig"
import { CONTACT_COLLECTION } from "../Utils/DataUtils"
import { useNavigate } from 'react-router-dom'
import { addLog } from '../Utils/Utils'
import moment from 'moment/moment'
import Constant from '../Utils/Constants'


const SalesDetail = () => {

    const { contactId } = useParams()
    const navigate = useNavigate()

    

    const [contactData, setContactData] = useState()
    const [contactName, setContactName] = useState('')
    const [contactPhone, setContactPhone] = useState('')
    const [contactEmail, setContactEmail] = useState('')    
    const [contactAddress, setContactAddress] = useState('')
    

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState()


    const [isEdit, setIsEdit] = useState(false)


    const [formData, setFormData] = useState({})
    const getContactDetail = async (contact_id) => {
        setIsLoading(true)
        console.log('contactId', contact_id)

   

        const q = query(collection(db, CONTACT_COLLECTION)
            , where('contactId', '==', contact_id))
        await getDocs(q)
            .then((res) => {
                if (res?.docs?.length > 0) {
                    const resultHolder = res.docs?.map((doc) => ({ id: doc?.id, ...doc?.data() }))[0]
                    setContactData(resultHolder)
                }
            })
            .catch((err) => {
                console.log('ERR', err)
            })
    }

    useEffect(() => {
        if (Boolean(contactId)) {
            getContactDetail(contactId)
        } else {
            alert('KONTAK TIDAK VALID')
        }
        setIsLoading(false)
    }, [])

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prevState => ({
    //         ...prevState,
    //         [name]: value
    //     }));
    // };

    const validation = () => {
        setShowModal(true)
    }

    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const loadDataToForm = (data) => {
        setContactName(data?.name)
        setContactPhone(data?.phone)
        setContactEmail(data?.email)
        setContactAddress(data?.address)
    }

    const updateDataContact = async () => {
        setIsLoading(true)
        const newContactData = {
            name: contactName,
            phone: contactPhone,
            email: contactEmail,
            address: contactAddress,
            updated_at: moment(new Date).toISOString(),
            contactId: contactData?.contactId,
            updated_at: moment().format('DD/MMM/YYYY hh:mm')
        }
        const oldContactDoc = doc(db, CONTACT_COLLECTION, contactData?.id)
        updateDoc(oldContactDoc, newContactData)
            .then(() => {
                setIsLoading(false)
                setShowModal(false)
                addLog('UPDATE CONTACT DATA', `${localStorage.getItem(Constant.USERNAME)} update contact ${contactName}, from ${JSON.stringify(contactData)} to ${JSON.stringify({
                    name: contactName,
                    phone: contactPhone,
                    email: contactEmail,
                    address: contactAddress,
                })}`)
                navigate('/contact')
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
                    {summaryItem('Nama kontak', contactName)}
                    {summaryItem('Nomor telepon', contactPhone)}
                    {summaryItem('Email', contactEmail)}
                    {summaryItem('Alamat', contactAddress)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => { updateDataContact() }}>Ya, Ubah</Button>
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
                            <h2>{contactData?.contactName}</h2>
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
                                            name='contactName'
                                            value={contactName}
                                            onChange={(e) => {
                                                setContactName(e.target.value)
                                            }}
                                            placeholder="Masukan nama"
                                        />
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{contactData?.contactName}</h4>
                                    }

                                </Form.Group>

                                {/* PHONE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                    <Form.Label>Nomor Telepon Customer</Form.Label>
                                   {isEdit?
                                   <Form.Control
                                   type="input"
                                   name='contactPhone'
                                   value={contactPhone}
                                   onChange={(e) => {
                                    setContactPhone(e.target.value)
                                   }}
                                   placeholder="masukan nomor telepon"
                                   />
                                   :
                                    <h4 style={{ marginTop: -10, marginBottom: -10 }}>{contactData?.contactPhone}</h4>
                                }
                                </Form.Group>
                            </Row>

                            <Row>
                                {/* EMAIL */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='email'>
                                    <Form.Label>Email Customer</Form.Label>
                                    {isEdit?
                                   <Form.Control
                                   type="input"
                                   name='contactPhone'
                                   value={contactEmail}
                                   onChange={(e) => {
                                    setContactEmail(e.target.value)
                                   }}
                                   placeholder="masukan alamat email"
                                   />
                                   :
                                    <h4 style={{ marginTop: -10, marginBottom: -10 }}>{contactData?.contactEmail}</h4>
                                }
                                </Form.Group>

                                {/* ADDRESS */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                    <Form.Label>Alamat Customer</Form.Label>
                                    {isEdit?
                                   <Form.Control
                                   type="input"
                                   name='contactPhone'
                                   value={contactAddress}
                                   onChange={(e) => {
                                    setContactAddress(e.target.value)
                                   }}
                                   placeholder="masukan alamat email"
                                   />
                                   :
                                    <h4 style={{ marginTop: -10, marginBottom: -10 }}>{contactData?.contactAddress}</h4>
                                }
                                </Form.Group>
                            </Row>


                            <div className="col-lg-8 col-md-3 my-4" style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                                <Button
                                    variant='light'
                                    style={{ width: '25%', alignSelf: 'flex-start' }}
                                    onClick={() => {
                                        isEdit ? setIsEdit(false) : navigate(-1)
                                    }}
                                >{isEdit ? 'Batal' : 'Kembali'}</Button>
                                <Button
                                    variant='success'
                                    className='mx-2'
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        if (isEdit) {
                                            validation()
                                        } else {
                                            loadDataToForm(contactData)
                                            setIsEdit(true)
                                        }
                                    }}
                                >{isEdit ? 'Simpan' : 'Edit Data Contact'}</Button>
                                <Button
                                    style={{ width: '25%', alignSelf: 'flex-end', visibility: isEdit ? 'hidden' : 'visible' }}
                                    onClick={() => {
                                        navigate(`/contact/detail/${contactId}`)
                                    }}
                                >{'Lihat Contact'}</Button>
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
                                        {orderData?.map((item, index) => {
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
        </div>
    )
}

export default SalesDetail