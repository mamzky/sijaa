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
import Select from 'react-select'
import AppColors from '../Utils/Colors'

function AddNewTransaction() {

    const navigate = useNavigate()
    const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
    const productCollectionRef = collection(db, PRODUCT_COLLECTION)

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [notes, setNotes] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [existingCustomer, setExistingCustomer] = useState(false)
    const [modalItem, setModalItem] = useState(false)

    // validationFlag
    const [errorName, setErrorName] = useState('')
    const [errNameExist, setErrNameExist] = useState(false)
    const [errorSize, setErrorSize] = useState('')
    const [errorBasePrice, setErrorBasePrice] = useState('')
    const [errorSellPrice, setErrorSellPrice] = useState('')
    const [errorSupplier, setErrorSupplier] = useState('')
    const [errorQty, setErrorQty] = useState('')

    // DATA LIST
    const [customerList, setCustomerList] = useState([])
    const [productList, setProductList] = useState([])

    //ORDER
    const [selectedCustomer, setSeletedCustomer] = useState()
    const [selectedProduct, setSeletedProduct] = useState()
    const [transactionNotes, setTransactionNotes] = useState('')
    const [orderList, setOrderList] = useState([])


    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const checkCustomerExist = async (name) => {
        let isExist
        let customerExist = []
        const q = query(collection(db, CUSTOMER_COLLECTION)
            , where('name', '==', name))
        const querySnapshot = await getDocs(q);
        const result = querySnapshot?.docs?.map(doc => doc.data())
        if (!querySnapshot?.empty) {
            customerExist = result?.findIndex((e) => e.name.toLowerCase() === name.toLowerCase())
            isExist = customerExist >= 0
        } else {
            isExist = false
        }
        return isExist
    }

    const validation = () => {
        checkCustomerExist(customerName)
            .then((val) => {
                if (val) {
                    setErrNameExist(true)
                    window.scrollTo(0, 0)
                } else {
                    if (isEmpty(customerName)) {
                        console.log('customerName');
                        setErrorName(true)
                        window.scrollTo(0, 0)
                    } else {
                        setShowModal(true)
                    }
                }
            })
            .catch((err) => {
                setIsLoading(false)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    const submitNewProduct = async () => {
        setShowModal(false)
        const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
        await addDoc(customerCollectionRef, {
            name: customerName,
            phone: phone,
            email: email,
            address: address,
            contact_person: customerName,
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
        getCustomer()
        getProduct()
    }, [])

    const getCustomer = async () => {
        const data = await getDocs(customerCollectionRef)
        const sortedData = data.docs.map((doc) => ({ id: doc.id, label: doc.data().name, value: doc.data() }))
        setCustomerList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    }

    const getProduct = async () => {
        const data = await getDocs(productCollectionRef)
        const sortedData = data.docs.map((doc) => ({ id: doc.id, label: doc.data().product_name, value: doc.data() }))
        setProductList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      }

    const addItem = () => {
        setModalItem(false)
    }

    return (
        <div>
            {/* MODAL SUMMARY */}
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Transaksi Baru
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
            {/* LOADING */}
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
            {/* MODAL ITEM */}
            <Modal show={modalItem} onHide={() => setModalItem(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Tambah Barang
                    </Modal.Title>
                    <CloseButton onClick={() => setModalItem(false)} />
                </Modal.Header>
                <Modal.Body>
                    <Row style={{display: 'flex', justifyContent:'space-between'}}>
                        <div style={{width: '100%'}}>
                            <Select
                                value={selectedProduct}
                                options={productList}
                                placeholder="Pilih produk"
                                onChange={(e) => {
                                    setSeletedProduct(e)
                                }}
                            />
                        </div>
                        <div style={{width: '100%', marginTop: 20, display: 'flex', flexDirection: 'row', justifyContent:'space-between' }}>
                            <Form.Control
                            style={{width:'49%'}}
                                type="input"
                                name='customerPhone'
                                value={DigitFormatter(phone)}
                                onChange={(e) => {
                                    const onlyDigits = OnlyDigit(e.target.value)
                                    setPhone(onlyDigits)
                                }}
                                placeholder="Jumlah"
                            />
                            <Form.Control
                            style={{width:'49%'}}

                                type="input"
                                name='customerPhone'
                                value={phone}
                                onChange={(e) => {
                                    const onlyDigits = OnlyDigit(e.target.value)
                                    setPhone(onlyDigits)
                                }}
                                placeholder="Harga Jual"
                            />
                        </div>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setModalItem(false)}>Batal</Button>
                    <Button variant="success" onClick={() => addItem()}>Ya, Tambah Barang</Button>
                </Modal.Footer>
            </Modal>
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Tambah Transaksi Baru</h2>
                        </div>
                    </div>
                    <div className="row mt-4">

                        <Form>
                            {/* NOMOR ORDER */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Order</Form.Label>
                                <Form.Control
                                    // isInvalid={errorName}
                                    type="input"
                                    name='customerPhone'
                                    value={phone}
                                    onChange={(e) => {
                                        const onlyDigits = OnlyDigit(e.target.value)
                                        setPhone(onlyDigits)
                                    }}
                                    placeholder="Masukan nomor order"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='productName'>
                                <Form.Label>Customer</Form.Label>
                                <div className="col-lg-4 col-md-3" style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Form.Check
                                        style={{ height: '100%', marginTop: 'auto' }}
                                        type={'checkbox'}
                                        label={`Customer terdaftar`}
                                        color={'#FF0000'}
                                        onChange={() => {
                                            setExistingCustomer((e) => !e)
                                        }}
                                    />
                                    <div className='col-lg-8 col-md-3'>
                                        {
                                            existingCustomer ?
                                                <Select
                                                    // styles={{ width: '100%' }} 
                                                    value={selectedCustomer}
                                                    options={customerList}
                                                    placeholder="Pilih customer"
                                                    onChange={(e) => {
                                                        console.log(e)
                                                        setPhone(e.value.phone)
                                                        setAddress(e.value.address)
                                                        setContactPerson(e.value.contact_person)
                                                    }}
                                                />
                                                :
                                                <Form.Control
                                                    type="input"
                                                    name='customerPhone'
                                                    value={phone}
                                                    onChange={(e) => {
                                                        const onlyDigits = OnlyDigit(e.target.value)
                                                        setPhone(onlyDigits)
                                                    }}
                                                    placeholder="Masukan nama customer"
                                                />
                                        }
                                    </div>
                                </div>
                            </Form.Group>

                            {/* PHONE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Telepon Customer</Form.Label>
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
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* ADDRESS */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                <Form.Label>Alamat Pengiriman</Form.Label>
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
                                    value={transactionNotes}
                                    onChange={(e) => {
                                        setTransactionNotes(e.target.value)
                                    }}
                                    placeholder="Catatan transaksi"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

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
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderList?.map((item, index) => {
                                                    return (
                                                        <tr
                                                            style={{ cursor: 'pointer' }} // Optional: Change cursor on hover
                                                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'black')}
                                                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                                                        >
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
                                                                        <h6 className="mb-0 text-sm">{item?.name}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{item?.phone}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{item?.email}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{item?.contact_person}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}

                                            </tbody>
                                        </table>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: 20 }}>
                                            <Button onClick={() => setModalItem(true)} variant="primary">+Tambah Barang</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '50%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        setIsLoading(true)
                                        validation()
                                    }}
                                >Buat Transaksi</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AddNewTransaction