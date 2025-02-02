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
import { LOG_COLLECTION, PRODUCT_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants'
import { addLog } from '../Utils/Utils'
import AppColors from '../Utils/Colors'

function AddNewProduct() {

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
    const [uom, setUom] = useState('pcs')
    const [qty, setQty] = useState('')
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

    const checkProductExist = async (productName) => {
        let isExist
        let productExist = []
        const q = query(collection(db, PRODUCT_COLLECTION)
            , where('product_name', '==', productName))
        const querySnapshot = await getDocs(q);
        const result = querySnapshot?.docs?.map(doc => doc.data())
        if (!querySnapshot?.empty) {
            productExist = result?.findIndex((e) => e.product_name.toLowerCase() === productName.toLowerCase())
            isExist = productExist >= 0
        } else {
            isExist = false
        }
        return isExist
    }

    const validation = () => {
        checkProductExist(productName)
            .then((val) => {
                if (val) {
                    setErrNameExist(true)
                    window.scrollTo(0, 0)
                } else {
                    if (isEmpty(productName)) {
                        console.log(productName);
                        setErrorName(true)
                        window.scrollTo(0, 0)
                    }  else if (isEmpty(productBasePrice)) {
                        setErrorBasePrice(true)
                    } else if (isEmpty(supplier)) {
                        setErrorSupplier(true)
                    } else if (isEmpty(qty)) {
                        setErrorQty(true)
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
        const productCollectionRef = collection(db, PRODUCT_COLLECTION)
        await addDoc(productCollectionRef, {
            product_name: productName,
            uom: uom,
            base_price: productBasePrice,
            sell_price: productSellPrice,
            // discount: discount,
            // discount_type: discountType,
            qty: qty,
            supplier: supplier,
            product_code: `JAA${moment().format('DDMMYYhhmm')}`,
            created_at: new Date().toISOString(),
            created_by: localStorage.getItem(Constant.USERNAME) ?? '-'
        }).then((res) => {
            console.log(res);
            addLog(localStorage.getItem(Constant.USERNAME), `add product ${productName}`)
            navigate('/product')
        })
        .catch((error) => {
            console.log('ERROR', error);
        })
        .finally(() => setShowModal(false))
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
                        Produk Baru
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama produk', productName)}
                    {/* {productSize === 'Lainnya...' ?
                        summaryItem('Ukuran', productSizeExtra)
                        :
                        summaryItem('Ukuran', productSize)} */}
                    {summaryItem('Harga dasar', `Rp${DigitFormatter(productBasePrice)}`)}
                    {summaryItem('Harga jual', isEmpty(productSellPrice) ? '-' : `Rp${DigitFormatter(productSellPrice)}`)}
                    {/* {summaryItem('Diskon', isEmpty(discount) ? '0' : `${DigitFormatter(discount)}(${discountType} Rupiah)`)} */}
                    {summaryItem('Supplier', supplier)}
                    {summaryItem('Jumlah', qty)}
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
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Tambah Produk Baru</h2>
                        </div>
                    </div>
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
                                        setErrNameExist(false)
                                    }}
                                    placeholder="Masukan nama produk"
                                />
                                {errNameExist && <p style={{ color: AppColors.Error1 }}>Nama produk telah didaftarkan</p>}
                            </Form.Group>

                            {/* SIZE */}
                            {/* <div
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
                                                    name='productName'
                                                    value={size}
                                                    checked={size === productSize}
                                                    label={size}
                                                    placeholder="Masukan nama produk"
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
                            </div> */}
                            <div className="col-lg-6 col-md-3 mt-4">
                                <Form.Label>Unit of Measurement(UoM)</Form.Label>
                                <Form.Control
                                    type="input"
                                    name='uom'
                                    value={uom}
                                    onChange={(e) => {
                                        setUom(e.target.value)
                                    }}
                                    placeholder="Masukan UoM"
                                />
                            </div>

                            {/* PRICE */}
                            <Row className='mt-4 px-2'>
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
                            {/* <div className="col-lg-6 col-md-3 mt-4">
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
                            </div> */}

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
                            <div className="col-lg-6 col-md-3 mt-4">
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
                                >Tambah Produk Baru</Button>
                            </div>
                        </Form>
                    </div>
                </div>
        </div>
    )
}

export default AddNewProduct