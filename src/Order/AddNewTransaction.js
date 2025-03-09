import React, { useEffect, useState } from 'react'
import { Alert, Button, CloseButton, Col, Dropdown, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { DigitFormatter, OnlyDigit } from '../Utils/General'
import { empty, isEmpty, isNil } from 'ramda'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment/moment'
import { CUSTOMER_COLLECTION, EMPLOYEE_COLLECTION, PRODUCT_COLLECTION, ORDER_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog, calculateTotal } from '../Utils/Utils'
import Select from 'react-select'
import AppColors from '../Utils/Colors'

function AddNewOrder() {

    const navigate = useNavigate()
    const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
    const productCollectionRef = collection(db, PRODUCT_COLLECTION)
    const employeeCollectionRef = collection(db, EMPLOYEE_COLLECTION)

    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [address, setAddress] = useState('')
    const [contactPerson, setContactPerson] = useState('')
    const [selectedPIC, setSelectedPIC] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [existingCustomer, setExistingCustomer] = useState(false)
    const [modalItem, setModalItem] = useState(false)

    // DATA LIST
    const [customerList, setCustomerList] = useState([])
    const [productList, setProductList] = useState([])
    const [employeeData, setEmployeeData] = useState([])

    //ORDER
    const [selectedCustomer, setSelectedCustomer] = useState()
    const [orderNotes, setOrderNotes] = useState('')
    const [orderList, setOrderList] = useState([])
    const [orderNumber, setOrderNumber] = useState('')
    const [poNumber, setPoNumber] = useState('')
    const [orderDate, setOrderDate] = useState(new Date());
    const [orderType, setOrdertype] = useState('')
    const [dp, setDp] = useState(0)

    // MODAL
    const [selectedProduct, setSeletedProduct] = useState('')
    const [qtySelectedItem, setQtySelectedItem] = useState('')
    const [discountSelectedItem, setDiscountSelectedItem] = useState('0')
    const [priceSelectedItem, setPriceSelectedItem] = useState('')
    const [productIsExist, setProductIsExist] = useState(false)
    const [isEditItem, setIsEditItem] = useState(false)

    const [withTax, setWithTax] = useState(true)
    const [modalDiscount, setModalDiscount] = useState(false)
    const [discountBill, setDiscountBill] = useState('')

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
        getListEmployee()
        setOrdertype('Tunai')
        setOrderNumber(`KNG${moment().format('DDMMYYYYhhmmss')}`)
        setWithTax(true)
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

    const getListEmployee = async () => {
        setIsLoading(true)
        await getDocs(employeeCollectionRef)
            .then((res) => {
                const listData = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
                setEmployeeData(listData)
            })
            .catch((err) => {
                console.log(err)
            })
            .finally(() => {
                setIsLoading(false)
            })
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
        const orderHolder = orderList.map((_) => {
            delete _.item
            return _
        })
        const body = {
            customer: customerList.find((e) => e.id === selectedCustomer)?.value ?? null,
            customer_id: customerList.find((e) => e.id === selectedCustomer)?.value?.customer_code ?? null,
            order_list: orderHolder,
            order_number: orderNumber,
            order_date: orderDate,
            po_number: poNumber,
            notes: orderNotes,
            type: orderType,
            dp: dp ?? 0,
            pic: selectedPIC,
            total_bill: DigitFormatter(calculateTotal(orderList)),
            status: 'READY TO PACK',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: localStorage.getItem(Constant.USERNAME),
            tax: withTax
        }
        submitOrder(body)
    }

    const submitOrder = async (body) => {
        const orderCollectionRef = collection(db, ORDER_COLLECTION)
        await addDoc(orderCollectionRef, body).then(() => {
            setIsLoading(false)
            addLog(localStorage.getItem(Constant.USERNAME), `create order ${orderNumber}`)
            navigate('/order')
        })
    }

    const resetModalItem = () => {
        setSeletedProduct(undefined)
        setQtySelectedItem(0)
        setPriceSelectedItem(0)
        setModalItem(false)
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
                        {`Order Baru (${orderNumber} - ${moment(orderDate).format('dddd, DD MMMM YYYY')})`}
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <div className='col-lg-6'>
                            {summaryItem('Nomor PO', poNumber)}
                            {summaryItem('Nama customer', `${customerList.find((e) => e.id === selectedCustomer)?.value?.name ?? '-'}(${customerList.find((e) => e.id === selectedCustomer)?.value?.contact_person ?? '-'})` ?? customerName)}
                            {summaryItem('Nomor telepon', phone)}
                            {summaryItem('Email', customerList.find((e) => e.id === selectedCustomer)?.value?.email ?? '-')}
                            {summaryItem('Alamat', address)}
                            {summaryItem('Contact person', contactPerson)}
                            {summaryItem('Catatan', orderNotes != '' ? orderNotes : '-')}
                            {summaryItem('Jenis Order', orderType)}
                        </div>
                        <div className='col-lg-6'>
                            <span style={{ fontWeight: 'bold' }}>Order Item</span><br />
                            {orderList.map((item) => {
                                const price = parseInt(OnlyDigit(item.price));
                                const discount = parseInt(item.discount);
                                const totalPrice = (price * item.qty) - discount;

                                return (
                                    <Row>
                                        <p className='col-lg-6'>{`(${item.qty}) ${item.name}`}</p>
                                        <p className='col-lg-6' style={{ textAlign: 'right', fontWeight: 'bolder' }}>{`Rp${DigitFormatter(totalPrice)}`}</p>
                                    </Row>
                                )
                            })}
                            {withTax &&
                                <Row>
                                    <p className='col-lg-6'>{`Tax`}</p>
                                    <p className='col-lg-6' style={{ textAlign: 'right', fontWeight: 'bolder' }}>{`Rp${DigitFormatter(calculateTotal(orderList) * 0.11)}`}</p>
                                </Row>
                            }
                            <div style={{ height: 1, backgroundColor: 'GrayText' }} />
                            <Row>
                                <p className='col-lg-6'>{`Total`}</p>
                                <p className='col-lg-6' style={{ textAlign: 'right', fontWeight: 'bolder' }}>{`Rp${DigitFormatter(calculateTotal(orderList) + (calculateTotal(orderList) * (withTax ? 0.11 : 0)))}`}</p>
                            </Row>
                        </div>
                    </Row>

                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button disabled={orderList?.length === 0} variant="success" onClick={() => handleSubmit()}>Ya, Submit</Button>
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
                        {selectedProduct && <p>{`stok saat ini: ${selectedProduct?.value?.qty}`}</p>}
                        <div style={{ width: '100%', marginTop: (productIsExist || selectedProduct) ? -10 : 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
                                <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                    <Form.Label>Jumlah</Form.Label>
                                    <Form.Control
                                        style={{ width: '100%' }}
                                        type="input"
                                        name='qtyModal'
                                        value={qtySelectedItem ? DigitFormatter(qtySelectedItem) : null}
                                        onChange={(e) => {
                                            const onlyDigits = OnlyDigit(e.target.value)
                                            setQtySelectedItem(onlyDigits)
                                        }}
                                        placeholder="Jumlah"
                                    />
                                </Form.Group>
                                <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                                    <Form.Label>Harga</Form.Label>
                                    <Form.Control
                                        style={{ width: '100%' }}
                                        type="input"
                                        name='priceSelectedItem'
                                        value={priceSelectedItem ? DigitFormatter(priceSelectedItem) : null}
                                        onChange={(e) => {
                                            const onlyDigits = OnlyDigit(e.target.value)
                                            setPriceSelectedItem(onlyDigits)
                                        }}
                                        placeholder="Harga Jual"
                                    />
                                </Form.Group>
                            </div>
                            <Form.Group style={{ marginTop: 12 }}>
                                <Form.Label>Diskon(Rp)</Form.Label>
                                <Form.Control
                                    style={{ width: '50%' }}
                                    type="input"
                                    name='DiscModal'
                                    value={discountSelectedItem ? DigitFormatter(discountSelectedItem) : null}
                                    onChange={(e) => {
                                        const onlyDigits = OnlyDigit(e.target.value)
                                        setDiscountSelectedItem(onlyDigits)
                                    }}
                                    placeholder="Diskon (Rp)"
                                />
                            </Form.Group>
                        </div>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => {
                        resetModalItem()
                    }}>Batal</Button>
                    <Button variant="success"
                        disabled={productIsExist || parseInt(qtySelectedItem) < 1 || isEmpty(qtySelectedItem) || isNil(selectedProduct?.id)}
                        onClick={() => {
                            if (isEditItem) {
                                updateItem(selectedProduct.id, qtySelectedItem, OnlyDigit(priceSelectedItem))
                            } else if (Number(qtySelectedItem) > selectedProduct?.value?.qty) {
                                alert('Qty pesanan melebihi stok!')
                                setQtySelectedItem(0)
                            } else {
                                const item = {
                                    item: selectedProduct,
                                    id: selectedProduct.id,
                                    name: selectedProduct.value.product_name,
                                    qty: qtySelectedItem,
                                    discount: discountSelectedItem === '' ? 0 : discountSelectedItem,
                                    uom: selectedProduct?.value?.uom ?? '-',
                                    price: OnlyDigit(priceSelectedItem)
                                }
                                addItem(item)
                                resetModalItem()
                            }

                        }}>{isEditItem ? 'Ubah Barang' : 'Ya, Tambah Barang'}</Button>
                </Modal.Footer>
            </Modal>
            <div className="container-fluid py-4">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                        <h2>Tambah Order Baru</h2>
                    </div>
                </div>
                <div className="row mt-4">
                    <Form>
                        <Row>
                            {/* NOMOR ORDER */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Order KNG</Form.Label>
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
                                        onClick={() => { setOrderNumber(`KNG${moment().format('DDMMYYYYhhmmss')}`) }}
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
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='phone'>
                                <Form.Label>Nomor Order Customer</Form.Label>
                                <Row>
                                    <Form.Control
                                        type="input"
                                        name='poNumber'
                                        style={{ width: '90%', height: 40, marginRight: 10 }}
                                        value={poNumber}
                                        onChange={(e) => {
                                            setPoNumber(e.target.value)
                                        }}
                                        placeholder="Masukan nomor order"
                                    />
                                </Row>

                            </Form.Group>
                        </Row>

                        {/* NAME */}
                        <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20, paddingRight: 10, display: 'flex', flex: 1, flexDirection: 'column' }} controlId='productName'>
                            <Form.Label>Customer</Form.Label>
                            <div style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'row-reverse', justifyContent: 'space-between' }}>

                                <div style={{ width: '100%', display: 'flex', flex: 1, flexDirection: 'row' }}>
                                    <Form.Check
                                        style={{ height: '50%', width: '40%', marginTop: 'auto' }}
                                        type={'checkbox'}
                                        label={`Customer terdaftar`}
                                        color={'#FF0000'}
                                        onChange={() => {
                                            setExistingCustomer((e) => !e)
                                        }}
                                    />
                                    {
                                        existingCustomer ?
                                            <Select
                                                style={{ width: '100%' }}
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
                                                style={{ width: '100%' }}
                                                type="input"
                                                name='customerName'
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
                                    value={orderNotes}
                                    onChange={(e) => {
                                        setOrderNotes(e.target.value)
                                    }}
                                    placeholder="Catatan Order"
                                />
                                {/* {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama customer telah didaftarkan</p>} */}
                            </Form.Group>

                            {/* ORDER TYPE */}
                            <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='type'>
                                <Row>
                                    <Col className='col-lg-6'>
                                        <Form.Label>Jenis Order</Form.Label>
                                        <Dropdown className='col-lg-12'>
                                            <Dropdown.Toggle className='col-lg-12' variant="success" id="dropdown-basic">
                                                {orderType ?? 'Jenis Order'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {['Tunai', 'Konsinyasi', 'Purchase Order', 'Sales Canvaser'].map((label) => {
                                                    return (
                                                        <Dropdown.Item onClick={() => setOrdertype(label)}>{label}</Dropdown.Item>
                                                    )
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </Col>
                                    {!['sales canvaser', 'tunai'].includes(orderType?.toLowerCase()) &&
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
                            {/* EMPLOYEE */}
                            <Select
                                className='col-lg-6'
                                options={employeeData.map((e) => {
                                    return { label: e?.employeeName ?? '', value: e?.employeeName ?? '' }
                                })}
                                placeholder="Pilih PIC"
                                onChange={(e) => {
                                    setSelectedPIC(e.value)
                                }}
                            />
                        </Row>

                        <div class="row mt-4">
                            <div className="card-body px-0 pb-2">
                                <div className="table-responsive">
                                    <input
                                        type="checkbox"
                                        checked={withTax}
                                        onChange={() => setWithTax(!withTax)}
                                        className="w-5 h-5"
                                    />
                                    <span>Pajak</span>
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
                                                const price = parseInt(OnlyDigit(item?.price));
                                                const discount = parseInt(item?.discount);
                                                const totalPrice = (price * parseInt(item?.qty)) - discount
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
                                                                setIsEditItem(true)
                                                                setSeletedProduct(item.item)
                                                                setQtySelectedItem(item.qty)
                                                                setPriceSelectedItem(DigitFormatter(item.price))
                                                                setDiscountSelectedItem(item.discount ?? 0)
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
                                                                    <h6 className="mb-0 text-sm">{DigitFormatter(item?.discount)}</h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="ps-3 py-1">
                                                                <div className="d-flex flex-column">
                                                                    <h6 className="mb-0 text-sm">{DigitFormatter(totalPrice)}</h6>
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
                                                    {withTax &&
                                                        <tr
                                                            style={{ backgroundColor: AppColors.MainBrand9 }} // Optional: Change cursor on hover
                                                        >
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td />
                                                            <td >
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
                                                    }
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
                                                                    <h6 className="mb-0 text-sm">{DigitFormatter(calculateTotal(orderList) + calculateTotal(orderList) * (withTax ? 0.11 : 0))}</h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            }
                                        </tbody>
                                    </table>
                                    <div style={{ width: '100%', display: 'flex', gap: 8, flexDirection: 'row', justifyContent: 'center', paddingTop: 20 }}>
                                        <Button onClick={() => {
                                            setModalItem(true)
                                            setIsEditItem(false)
                                        }} variant="primary">+Tambah Barang</Button>
                                        {/* <Button onClick={() => {
                                            setModalDiscount(true)
                                        }} variant="primary">+Tambah Diskon Order</Button> */}
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
                            >Buat Order</Button>
                        </div>
                    </Form>
                </div>
            </div>
            <Modal show={modalDiscount}>
                <Modal.Header>Tambah Diskon Order</Modal.Header>
                <Modal.Body>
                    <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                        <Form.Label>Total Diskon</Form.Label>
                        <Form.Control
                            style={{ width: '100%' }}
                            type="input"
                            name='discountBill'
                            value={discountBill}
                            onChange={(e) => {
                                const onlyDigits = OnlyDigit(e.target.value)
                                setDiscountBill(onlyDigits)
                            }}
                            placeholder="Discount Bill"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => {
                        setDiscountBill(0)
                    }}>Hapus Diskon</Button>
                    <Button variant="success" onClick={() => {
                        setModalDiscount(false)
                    }}>Tutup</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AddNewOrder