import React, { useEffect, useState } from 'react'
import { Alert, Button, CloseButton, Col, Dropdown, DropdownDivider, Form, Modal, Row, Spinner } from 'react-bootstrap'
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
import Select from 'react-select'
import AppColors from '../Utils/Colors'
import DatePicker from "react-datepicker"

function AddNewTransaction() {

    const navigate = useNavigate()
    const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
    const productCollectionRef = collection(db, PRODUCT_COLLECTION)

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')

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
    const [selectedCustomer, setSelectedCustomer] = useState()
    const [transactionNotes, setTransactionNotes] = useState('')
    const [orderList, setOrderList] = useState([])
    const [orderNumber, setOrderNumber] = useState('')
    const [orderDate, setOrderDate] = useState(new Date());
    const [transactionType, setTransactiontype] = useState()
    const [dp, setDp] = useState(0)
    const [isActive, setIsActive] = useState(true)

    // MODAL
    const [selectedProduct, setSeletedProduct] = useState()
    const [qtySelectedItem, setQtySelectedItem] = useState(1)
    const [priceSelectedItem, setPriceSelectedItem] = useState(0)
    const [productIsExist, setProductIsExist] = useState(false)
    const [isEditItem, setIsEditItem] = useState(false)



    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    useEffect(() => {
        getCustomer()
        getProduct()
    }, [])

    const getCustomer = async () => {
        const data = await getDocs(customerCollectionRef)
        const sortedData = data.docs.map((doc) => ({ id: doc.id, label: `${doc.data().name}(${doc.data().contact_person})`, value: doc.data() }))
        setCustomerList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    }

    const getProduct = async () => {
        const data = await getDocs(productCollectionRef)
        const sortedData = data.docs.map((doc) => ({ id: doc.id, label: doc.data().product_name, value: doc.data() }))
        setProductList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    }

    const addItem = (data) => {
        setModalItem(false)
        setOrderList((_) => _.concat(data))
    }

    const updateItem = (id, newQty, newPrice) => {
        setOrderList(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, qty: newQty, price: newPrice } : item
            )
        );
    };

    const handleSubmit = () => {
        setShowModal(true)
        const body = {
            customer: customerList.find((e) => e.id === selectedCustomer).value,
            customer_id: customerList.find((e) => e.id === selectedCustomer).value?.customer_code,
            order_list: orderList,
            order_number: orderNumber,
            order_date: orderDate,
            notes: transactionNotes,
            type: transactionType,
            dp: dp ?? 0,
            total_bill: DigitFormatter(calculateTotal(orderList)),
            status: isActive,
            created_at: moment().locale('id').toISOString(),
            updated_at: moment().locale('id').toISOString(),
            created_by: localStorage.getItem(Constant.USERNAME)
        }
        submitTransaction(body)
    }

    const submitTransaction = async (body) => {
        console.log(body);
        const transactionCollectionRef = collection(db, TRANSACTION_COLLECTION)
        await addDoc(transactionCollectionRef, body).then(() => {
            setIsLoading(false)
            addLog(localStorage.getItem(Constant.USERNAME), `create transaction ${orderNumber}`)
            navigate('/transaction')
        })
    }

    return (
        <div>
            {/* MODAL SUMMARY */}
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        {`Transaksi Baru (${orderNumber} - ${orderDate})`}
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <div className='col-lg-6'>
                            {summaryItem('Nama customer', customerList.find((e) => e.id === selectedCustomer)?.value?.name ?? customerName)}
                            {summaryItem('Nomor telepon', phone)}
                            {summaryItem('Email', customerList.find((e) => e.id === selectedCustomer)?.value?.email ?? '-')}
                            {summaryItem('Alamat', address)}
                            {summaryItem('Contact person', contactPerson)}
                            {summaryItem('Catatan', transactionNotes != '' ? transactionNotes : '-')}
                            {summaryItem('Jenis Transaksi', transactionType)}
                        </div>
                        <div className='col-lg-6'>
                            <span style={{ fontWeight: 'bold' }}>Order Item</span><br />
                            {orderList.map((item) => {
                                return (
                                    <Row>
                                        <p className='col-lg-6'>{`(${item.qty}) ${item.name}`}</p>
                                        <p className='col-lg-6' style={{ textAlign: 'right', fontWeight: 'bolder' }}>{`Rp${DigitFormatter(item.qty * item.price)}`}</p>
                                    </Row>
                                )
                            })}
                            <div style={{ height: 1, backgroundColor: 'GrayText' }} />
                            <Row>
                                <p className='col-lg-6'>{`Total`}</p>
                                <p className='col-lg-6' style={{ textAlign: 'right', fontWeight: 'bolder' }}>{`Rp${DigitFormatter(calculateTotal(orderList))}`}</p>
                            </Row>
                        </div>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => handleSubmit()}>Ya, Submit</Button>
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
                        {isEditItem ? 'Ubah Keterangan Barang' : 'Tambah Barang'}
                    </Modal.Title>
                    <CloseButton onClick={() => setModalItem(false)} />
                </Modal.Header>
                <Modal.Body>
                    <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '100%' }}>
                            <Select
                                isDisabled={isEditItem}
                                value={selectedProduct}
                                options={productList}
                                placeholder="Pilih produk"
                                onChange={(e) => {
                                    console.log(e.id)
                                    console.log()
                                    if (orderList.findIndex((val) => val.id === e.id) < 0) {
                                        setProductIsExist(false)
                                        setSeletedProduct(e)
                                        setPriceSelectedItem(e.value.base_price)
                                    } else {
                                        setSeletedProduct()
                                        setPriceSelectedItem()
                                        setProductIsExist(true)
                                    }
                                }}
                            />
                        </div>
                        {productIsExist && <p style={{ color: AppColors.Error1 }}>Produk sudah ada dalam list</p>}
                        <div style={{ width: '100%', marginTop: productIsExist ? -10 : 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Form.Control
                                style={{ width: '49%' }}
                                type="input"
                                name='qtyModal'
                                value={DigitFormatter(qtySelectedItem)}
                                onChange={(e) => {
                                    const onlyDigits = OnlyDigit(e.target.value)
                                    setQtySelectedItem(onlyDigits)
                                }}
                                placeholder="Jumlah"
                            />
                            <Form.Control
                                style={{ width: '49%' }}
                                type="input"
                                name='priceSelectedItem'
                                value={DigitFormatter(priceSelectedItem)}
                                onChange={(e) => {
                                    const onlyDigits = OnlyDigit(e.target.value)
                                    setPriceSelectedItem(onlyDigits)
                                }}
                                placeholder="Harga Jual"
                            />
                        </div>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setModalItem(false)}>Batal</Button>
                    <Button variant="success"
                        disabled={productIsExist || parseInt(qtySelectedItem) < 1 || isEmpty(qtySelectedItem)}
                        onClick={() => {
                            if (isEditItem) {
                                updateItem(selectedProduct.id, qtySelectedItem, OnlyDigit(priceSelectedItem))
                            } else {
                                const item = {
                                    item: selectedProduct,
                                    id: selectedProduct.id,
                                    name: selectedProduct.value.product_name,
                                    qty: qtySelectedItem,
                                    price: OnlyDigit(priceSelectedItem)
                                }
                                addItem(item)
                            }

                            setSeletedProduct()
                            setQtySelectedItem('')
                            setPriceSelectedItem('')
                            setModalItem(false)
                        }}>{isEditItem ? 'Ubah Barang' : 'Ya, Tambah Barang'}</Button>
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
                            <Row>
                                {/* NOMOR ORDER */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                    <Form.Label>Nomor Order</Form.Label>
                                    <Row>
                                        <Form.Control
                                            type="input"
                                            name='orderNumber'
                                            style={{ width: '90%', height: 40, marginRight: 10 }}
                                            value={orderNumber}
                                            onChange={(e) => {
                                                setOrderNumber(e.target.value)
                                            }}
                                            placeholder="Masukan nomor order"
                                        />
                                        <Button
                                            style={{ width: '8%' }}
                                            onClick={() => { setOrderNumber(`JAA${moment().format('DDMMYYYYhhmm')}`) }}
                                        ><i className="material-icons opacity-10">cached</i></Button>
                                    </Row>

                                </Form.Group>

                                {/* DATE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='date'>
                                    <Form.Label>Tanggal</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name='orderDate'
                                        value={orderDate}
                                        onChange={(e) => {
                                            setOrderDate(e.target.value)
                                        }}
                                        placeholder="Tanggal order"
                                    />
                                </Form.Group>
                            </Row>

                            {/* NAME */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20, paddingRight: 10 }} controlId='productName'>
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
                                                    options={customerList}
                                                    placeholder="Pilih customer"
                                                    onChange={(e) => {
                                                        setSelectedCustomer(e.id)
                                                        setPhone(e.value.phone)
                                                        setAddress(e.value.address)
                                                        setContactPerson(e.value.contact_person)
                                                        setEmail(e.value.email)
                                                    }}
                                                />
                                                :
                                                <Form.Control
                                                    type="input"
                                                    name='customerPhone'
                                                    value={customerName}
                                                    onChange={(e) => {
                                                        setCustomerName(e.target.value)
                                                    }}
                                                    placeholder="Masukan nama customer"
                                                />
                                        }
                                    </div>
                                </div>
                            </Form.Group>

                            {/* PHONE */}
                            <Row>
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
                                </Form.Group>

                                {/* EMAIL */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                    <Form.Label>Email</Form.Label>
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
                                </Form.Group>
                            </Row>


                            <Row>
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
                                        }}
                                        placeholder="Masukan nama contact person"
                                    />
                                </Form.Group>
                                {/* ADDRESS */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='address'>
                                    <Form.Label>Alamat Pengiriman</Form.Label>
                                    <Form.Control
                                        // isInvalid={errorName}
                                        type="input"
                                        name='customerAddress'
                                        value={address}
                                        onChange={(e) => {
                                            setAddress(e.target.value)
                                        }}
                                        placeholder="Masukan alamat"
                                    />
                                </Form.Group>
                            </Row>


                            <Row>
                                {/* NOTES */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='notes'>
                                    <Form.Label>Catatan</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name='cuctomerNotes'
                                        value={transactionNotes}
                                        onChange={(e) => {
                                            setTransactionNotes(e.target.value)
                                        }}
                                        placeholder="Catatan transaksi"
                                    />
                                    {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                                </Form.Group>

                                {/* TRANSACTION TYPE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='type'>
                                    <Row>
                                        <Col className='col-lg-4'>
                                            <Form.Label>Jenis Transaksi</Form.Label>
                                            <Dropdown className='col-lg-12'>
                                                <Dropdown.Toggle className='col-lg-12' variant="success" id="dropdown-basic">
                                                    {transactionType ?? 'Jenis Transaksi'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {['Tunai', 'Konsinyasi', 'Purchase Order'].map((label) => {
                                                        return (
                                                            <Dropdown.Item onClick={() => setTransactiontype(label)}>{label}</Dropdown.Item>
                                                        )
                                                    })}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Col>
                                        {transactionType?.toLowerCase() != 'tunai' &&
                                            <Col>
                                                <Form.Label>DP</Form.Label>
                                                <Form.Control
                                                    className='col-lg-6'
                                                    type="input"
                                                    name='dp'
                                                    value={DigitFormatter(dp)}
                                                    onChange={(e) => {
                                                        setDp(e.target.value)
                                                    }}
                                                    placeholder="Jumlah DP"
                                                />
                                            </Col>
                                        }

                                    </Row>
                                </Form.Group>
                            </Row>

                            <Row>
                                {/* Status */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contactPerson'>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Check // prettier-ignore
                                        checked={isActive}
                                        onChange={() => setIsActive((e) => !e)}
                                        type="switch"
                                        label={isActive ? 'Aktif' : 'Non-Aktif'}
                                    />
                                </Form.Group>
                            </Row>

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
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 col-lg-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderList?.map((item, index) => {
                                                    return (
                                                        <tr>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{index + 1}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td
                                                                style={{ cursor: 'pointer' }} // Optional: Change cursor on hover
                                                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F5F5F5')}
                                                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                                                                onClick={() => {
                                                                    console.log(item);
                                                                    setIsEditItem(true)
                                                                    setSeletedProduct(item.item)
                                                                    setQtySelectedItem(item.qty)
                                                                    setPriceSelectedItem(DigitFormatter(item.price))
                                                                    setModalItem(true)
                                                                }}
                                                            >
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{item?.name}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{item?.qty}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{DigitFormatter(item?.price)}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className='col-lg-2'>
                                                                <div className="ps-2 py-1">
                                                                    <div className="d-flex flex-column">

                                                                        {/* <Form.Control
                                                                            // isInvalid={errorName}
                                                                            type="input"
                                                                            name='customerAddress'
                                                                            // value={address}
                                                                            onChange={(e) => {
                                                                                // setAddress(e.target.value)
                                                                            }}
                                                                            placeholder="Input Diskon"
                                                                        /> */}

                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <h6 className="mb-0 text-sm">{DigitFormatter(parseInt(item?.qty) * parseInt(OnlyDigit(item?.price)))}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="col-lg-6 ps-1 py-1">
                                                                    <div className="d-flex flex-column">
                                                                        <Button variant='danger'
                                                                            onClick={() => {
                                                                                const tempArr = orderList
                                                                                setOrderList(tempArr.filter((e) => e.id != item.id))
                                                                            }}
                                                                        >Hapus</Button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {orderList.length > 0 &&
                                                    <>
                                                    <tr
                                                            style={{ backgroundColor: AppColors.MainBrand9 }} // Optional: Change cursor on hover
                                                        >
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{'SUBTOTAL'}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{DigitFormatter(calculateTotal(orderList))}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            style={{ backgroundColor: AppColors.MainBrand9 }} // Optional: Change cursor on hover
                                                        >
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{'Tax'}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{DigitFormatter(calculateTotal(orderList) * 0.11)}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr
                                                            style={{ backgroundColor: AppColors.MainBrand9 }} // Optional: Change cursor on hover
                                                        >
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{'TOTAL'}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="ps-3 py-1">
                                                                    <div className="d-flex flex-column justify-content-center">
                                                                        <h6 className="mb-0 text-sm">{DigitFormatter(calculateTotal(orderList) + calculateTotal(orderList) * 0.11)}</h6>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </>
                                                }

                                            </tbody>
                                        </table>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: 20 }}>
                                            <Button onClick={() => {
                                                setModalItem(true)
                                                setIsEditItem(false)
                                            }} variant="primary">+Tambah Barang</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className='my-4'>
                                <Button
                                    type='button'
                                    variant='success'
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        setShowModal(true)
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