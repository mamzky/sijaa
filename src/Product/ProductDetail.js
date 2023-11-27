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
import { collection, getDocs, addDoc, doc, updateDoc, where, query } from 'firebase/firestore'
import moment from 'moment/moment'
import { PRODUCT_COLLECTION } from '../Utils/DataUtils'

function ProductDetail() {

    const navigate = useNavigate()

    const size = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', 'Lainnya...']
    const discType = ['%', 'Nominal']
    const [productName, setProductName] = useState('')
    const [productSize, setProductSize] = useState('')
    const [productSizeExtra, setProductSizeExtra] = useState('')
    const [productBasePrice, setProductBasePrice] = useState('')
    const [productSellPrice, setProductSellPrice] = useState('')
    const [discount, setDiscount] = useState('')
    const [discountType, setDiscountType] = useState('')
    const [supplier, setSupplier] = useState('')
    const [qty, setQty] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Detail Product
    const [productData, setProductData] = useState()

    // validationFlag
    const [errorName, setErrorName] = useState('')
    const [errorSize, setErrorSize] = useState('')
    const [errorBasePrice, setErrorBasePrice] = useState('')
    const [errorSellPrice, setErrorSellPrice] = useState('')
    const [errorSupplier, setErrorSupplier] = useState('')
    const [errorQty, setErrorQty] = useState('')
    const { product_code } = useParams()


    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const validation = () => {
        if (isEmpty(productName)) {
            console.log(productName);
            setErrorName(true)
            window.scrollTo(0, 0)
        } else if (isEmpty(productSize) && isEmpty(productSizeExtra)) {
            setErrorSize(true)
            window.scrollTo(0, 0)
        } else if (isEmpty(productBasePrice)) {
            setErrorBasePrice(true)
        } else if (isEmpty(supplier)) {
            setErrorSupplier(true)
        } else {
            setShowModal(true)
        }
    }

    const submitEditProduct = async () => {
        setShowModal(false)
        const newProductData = {
            product_name: productName,
            product_size: productSize,
            base_price: productBasePrice,
            sell_price: productSellPrice,
            discount: discount,
            discout_type: discType,
            qty: productData?.qty,
            supplier: supplier,
            product_code: `JAA${moment().format('DDMMYYhhmm')}`,
            created_at: moment(new Date).toISOString()
        }
        const oldProductDoc = doc(db, PRODUCT_COLLECTION, productData?.id)
        updateDoc(oldProductDoc, newProductData)
        .then(() => {
            setIsLoading(false)
            navigate('/product')
        })
    }

    const getProduct = async (product_code) => {
        setIsLoading(true)
        const q = query(collection(db, PRODUCT_COLLECTION)
            , where('product_code', '==', product_code))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}))
        if (!querySnapshot.empty) {
            setProductData(result[0])
            console.log('RESULT', result);
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.log('FAILED');
        }
    }

    useEffect(() => {
        console.log('ID', product_code);
        getProduct(product_code)
    }, [])

    const loadDataToForm = () => {
        setProductName(productData?.product_name)
        setProductSize(productData?.product_size)
        setProductBasePrice(productData?.base_price)
        setProductSellPrice(productData?.sell_price)
        setDiscountType(productData?.discount_type)
        setDiscount(productData?.discount)
        setSupplier(productData?.supplier)
        console.log(productData)
    }

    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Produk Baru
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama produk', productName)}
                    {productSize === 'Lainnya...' ?
                        summaryItem('Ukuran', productSizeExtra)
                        :
                        summaryItem('Ukuran', productSize)}
                    {summaryItem('Harga dasar', `Rp${DigitFormatter(productBasePrice)}`)}
                    {summaryItem('Harga jual', isEmpty(productSellPrice) ? '-' : `Rp${DigitFormatter(productSellPrice)}`)}
                    {summaryItem('Diskon', isEmpty(discount) ? '0' : `${DigitFormatter(discount)}(${discountType})`)}
                    {summaryItem('Supplier', supplier)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => submitEditProduct()}>Ya, Simpan Produk</Button>
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
                            <h2>Detail Produk</h2>
                        </div>
                    </div>
                    {product_code && !isEdit ?
                        <div className="row mt-4">
                            <div>
                                <p>Nama Barang</p>
                                <h4 style={{ marginTop: -20 }}>{productData?.product_name}</h4>
                            </div>
                            <div>
                                <p>Kode Barang</p>
                                <h4 style={{ marginTop: -20 }}>{productData?.product_code}</h4>
                            </div>
                            <div>
                                <p>Ukuran</p>
                                <h4 style={{ marginTop: -20 }}>{productData?.product_size}</h4>
                            </div>
                            <div>
                                <p>Stok saat ini</p>
                                <h4 style={{ marginTop: -20 }}>{productData?.qty}</h4>
                            </div>
                            <div>
                                <p>Harga Pokok</p>
                                <h4 style={{ marginTop: -20 }}>{DigitFormatter(productData?.base_price)}</h4>
                            </div>
                            <div>
                                <p>Harga Jual</p>
                                <h4 style={{ marginTop: -20 }}>{isEmpty(productData?.sell_price) ? '-' : DigitFormatter(productData?.sell_price)}</h4>
                            </div>
                            <div>
                                <p>Diskon</p>
                                <h4 style={{ marginTop: -20 }}>{isEmpty(productData?.discount) ? '-' :  `${DigitFormatter(productData?.discount)}(${productData?.discount_type})`}</h4>
                            </div>
                            <div>
                                <p>Supplier</p>
                                <h4 style={{ marginTop: -20 }}>{productData?.supplier}</h4>
                            </div>
                            <div>
                                <p>Tanggal Input</p>
                                <h4 style={{ marginTop: -20 }}>{moment(productData?.created_at).locale('id').format('DD MMMM YYYY HH:mm')}</h4>
                            </div>
                            <div className="col-lg-8 col-md-3 my-4" style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                                <Button
                                variant='light'
                                    style={{ width: '25%', alignSelf: 'flex-start', marginRight: 20 }}
                                    onClick={() => {
                                        navigate(-1)
                                    }}
                                >Kembali</Button>
                                <Button
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        loadDataToForm()
                                        setIsEdit(true)
                                    }}
                                >Edit Produk</Button>
                            </div>
                        </div>
                        :
                        <div className="row mt-4">
                            <Form>
                                {/* NAME */}
                                <Form.Group className="col-lg-6 col-md-3" controlId='productName'>
                                    <Form.Label>Nama barang</Form.Label>
                                    <Form.Control
                                        isInvalid={errorName}
                                        type="input"
                                        name='productName'
                                        value={productName}
                                        onChange={(e) => {
                                            setProductName(e.target.value)
                                            setErrorName(isEmpty(e.target.value))
                                        }}
                                        placeholder="Masukan nama produk"
                                    />
                                </Form.Group>

                                {/* SIZE */}
                                <div
                                    className="col-lg-6 col-md-3 mt-4"
                                    style={{
                                        border: 'solid',
                                        borderWidth: '1px',
                                        borderColor: errorSize ? 'red' : 'transparent',
                                        borderRadius: 5
                                    }}>
                                    <Form.Label>Ukuran</Form.Label>
                                    <Row className='p2'>
                                        {size.map((size) => {
                                            return (
                                                <Col
                                                    key={size}
                                                    sm={8}
                                                    md={6}
                                                    lg={4}
                                                >
                                                    <Form.Check
                                                        type="radio"
                                                        name='productSize'
                                                        value={size}
                                                        checked={size === productSize}
                                                        label={size}
                                                        placeholder="Ukuran produk"
                                                        onChange={(e) => {
                                                            if (e.target.value === 'Lainnya...') {
                                                                setProductSize('')
                                                            } else {
                                                                setProductSize(e.target.value)
                                                                setProductSizeExtra('')
                                                            }
                                                            setErrorSize(isEmpty(productSizeExtra) && isEmpty(productSize))
                                                        }}
                                                    />
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                    {(productSize === 'Lainnya...') &&
                                        <Form.Control
                                            style={{ marginLeft: 20, marginBottom: 10, width: '50%', alignSelf: 'center', visibility: productSize === 'Lainnya...' ? 'visible' : 'hidden' }}
                                            type="input"
                                            name='productSizeExtra'
                                            value={productSizeExtra}
                                            onChange={(e) => {
                                                setProductSizeExtra(e.target.value)
                                                setErrorSize(isEmpty(productSizeExtra) && isEmpty(productSize))
                                            }}
                                            placeholder="Masukan ukuran produk"
                                        />
                                    }
                                </div>

                                {/* PRICE */}
                                <Row className='mt-4'>
                                    {/* BASE PRICE */}
                                    <Col className="col-lg-6 col-md-3">
                                        <Form.Label>Harga dasar</Form.Label>
                                        <Form.Control
                                            type="input"
                                            isInvalid={errorBasePrice}
                                            name='productBasePrice'
                                            value={`Rp${DigitFormatter(productBasePrice)}`}
                                            onChange={(e) => {
                                                const onlyDigits = OnlyDigit(e.target.value)
                                                setProductBasePrice(onlyDigits)
                                                setErrorBasePrice(isEmpty(onlyDigits))
                                            }}
                                            placeholder="Masukan harga dasar"
                                        />
                                    </Col>

                                    {/* SELL PRICE */}
                                    <Col className="col-lg-6 col-md-3">
                                        <Form.Label>Harga jual</Form.Label>
                                        <Form.Control
                                            type="input"
                                            name='productSellPrice'
                                            isInvalid={errorSellPrice}
                                            value={`Rp${DigitFormatter(productSellPrice)}`}
                                            onChange={(e) => {
                                                const onlyDigits = OnlyDigit(e.target.value)
                                                setProductSellPrice(onlyDigits)
                                            }}
                                            placeholder="Masukan harga jual"
                                        />
                                    </Col>
                                </Row>

                                {/* DISCOUNT */}
                                <div className="col-lg-6 col-md-3 mt-4">
                                    <Form.Label>Diskon</Form.Label>
                                    <Row>
                                        {discType.map((disc) => {
                                            return (
                                                <Col
                                                    key={disc}
                                                    sm={8}
                                                    md={6}
                                                    lg={4}
                                                >
                                                    <Form.Check
                                                        type="radio"
                                                        name='discountType'
                                                        value={disc}
                                                        checked={disc === discountType}
                                                        label={disc}
                                                        onChange={(e) => {
                                                            setDiscountType(e.target.value)
                                                        }}
                                                    />
                                                </Col>
                                            )
                                        })}
                                    </Row>
                                    <Form.Control
                                        type="input"
                                        name='discount'
                                        value={DigitFormatter(discount)}
                                        onChange={(e) => {
                                            const onlyDigits = OnlyDigit(e.target.value)
                                            setDiscount(onlyDigits)
                                        }}
                                        placeholder="Masukan diskon"
                                    />
                                </div>

                                {/* SUPPLIER */}
                                <div className="col-lg-6 col-md-3 mt-4">
                                    <Form.Label>Nama supplier</Form.Label>
                                    <Form.Control
                                        type="input"
                                        name='supplier'
                                        value={supplier}
                                        isInvalid={errorSupplier}
                                        onChange={(e) => {
                                            setSupplier(e.target.value)
                                            setErrorSupplier(isEmpty(e.target.value))
                                        }}
                                        placeholder="Masukan nama supplier"
                                    />
                                </div>

                                {/* QTY */}
                                {/* <div className="col-lg-6 col-md-3 mt-4">
                                    <Form.Label>Jumlah</Form.Label>
                                    <Form.Control
                                        type="input"
                                        name='qty'
                                        isInvalid={errorQty}
                                        value={qty}
                                        onChange={(e) => {
                                            const digitOnly = OnlyDigit(e.target.value)
                                            setQty(digitOnly)
                                            setErrorQty(isEmpty(digitOnly))
                                        }}
                                        placeholder="Masukan jumlah"
                                    />
                                </div> */}
                                <div className='my-4'>
                                    <Button
                                        type='button'
                                        variant='danger'
                                        style={{ width: '25%', marginRight: 20 }}
                                        onClick={() => {
                                            setIsEdit(false)
                                        }}
                                    >Batal</Button>
                                    <Button
                                        type='button'
                                        variant='success'
                                        style={{ width: '25%' }}
                                        onClick={() => {
                                            validation()
                                        }}
                                    >Simpan Produk</Button>
                                </div>
                            </Form>
                        </div>
                    }
                </div>
            </main>
        </div>
    )
}

export default ProductDetail