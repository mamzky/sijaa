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
            base_price: productBasePrice,
            qty: productData?.qty,
            supplier: supplier,
            product_code: `KNG${moment().format('DDMMYYhhmm')}`,
            updated_at: moment(new Date).toISOString()
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
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            setProductData(result[0])
            setIsLoading(false)
        } else {
            setIsLoading(false)
            console.log('FAILED');
        }
    }

    useEffect(() => {
        getProduct(product_code)
    }, [])

    const loadDataToForm = () => {
        setProductName(productData?.product_name)
        setProductBasePrice(productData?.base_price)
        setSupplier(productData?.supplier)
    }

    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Edit Produk
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama produk', productName)}
                    {summaryItem('Harga dasar', `Rp${DigitFormatter(productBasePrice)}`)}
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
                            <p>Supplier</p>
                            <h4 style={{ marginTop: -20 }}>{productData?.supplier}</h4>
                        </div>
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <div>
                                    <p>Tanggal Input</p>
                                    <h4 style={{ marginTop: -20 }}>{moment(productData?.created_at).locale('id').format('DD MMMM YYYY HH:mm')}</h4>
                                </div>
                                {productData?.updated_at ?
                                    <div style={{ marginLeft: 40 }}>
                                        <p>Tanggal update</p>
                                        <h4 style={{ marginTop: -20 }}>{moment(productData?.updated_at).locale('id').format('DD MMMM YYYY HH:mm')}</h4>
                                        <p style={{ marginTop: -10 }}>{`(${productData?.latest_update})`}</p>
                                    </div>
                                    :
                                    <div></div>
                                }
                            </div>
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
                            {/* PRICE */}
                            <Form.Group className="col-lg-6 col-md-3" controlId='productName'>
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
                            </Form.Group>

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
        </div>
    )
}

export default ProductDetail