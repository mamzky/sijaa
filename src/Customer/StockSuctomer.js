import React, { useEffect, useState } from "react"
import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ORDER_COLLECTION } from "../Utils/DataUtils";
import { useParams } from "react-router-dom";
import LargeImageCard from "../Components/LargeImageCard";
import SmallImageCard from "../Components/SmallImageCard";
import { Alert, Button, CloseButton, Form, Modal, Row, Spinner } from "react-bootstrap";
import Select from 'react-select'
import moment from "moment";
import Constant from "../Utils/Constants";
import ModalLoading from "../Components/ModalLoading";

function StockCustomer() {

    const [orderData, setOrderData] = useState([])
    const [loading, setLoading] = useState(false)
    const { customer_code } = useParams()
    const [productList, setProductList] = useState([])
    const [productListOptions, setProductListOptions] = useState([])
    const [modalRetur, setModalRetur] = useState(false)
    const [listSelectedItem, setListSelectedItem] = useState([])



    const getStockByOrder = async () => {
        setLoading(true)
        const q = query(collection(db, ORDER_COLLECTION)
            , where('customer_id', '==', customer_code)
            , where('status', '==', true)
        )
        const querySnapshot = await getDocs(q)
        const result = querySnapshot?.docs?.map((doc) => (doc.data()))[0]
        let productListHolder = []
        try {
            result?.order_list?.map((item) => {
                const idx = productListHolder.findIndex((e) => e?.id === item?.id)
                if (idx < 0) {
                    productListHolder.push(item)
                } else {
                    productListHolder[idx].qty = parseInt(productListHolder[idx]?.qty) + item?.qty
                }
            })
            let productListOptionsHolder = []
            productListHolder?.map((_) => {
                productListOptionsHolder.push({
                    label: _.name,
                    value: _
                })
            })
            setProductList(productListHolder)
            setProductListOptions(productListOptionsHolder)
        } catch (error) {
            setProductList([])
        }
        setLoading(false)
    }

    const handleStockReturn = () => {
        const body = {
            customer: '',
            customer_id: customer_code,
            order_list: 'orderHolder',
            order_number: 'orderNumber',
            order_date: 'orderDate',
            notes: 'orderNotes',
            type: 'orderType',
            dp: 0,
            pic: 'selectedPIC',
            total_bill: 'DigitFormatter(calculateTotal(orderList))',
            status: 'isActive',
            created_at: moment().locale('id').toISOString(),
            updated_at: moment().locale('id').toISOString(),
            created_by: localStorage.getItem(Constant.USERNAME)
        }
    }

    useEffect(() => {
        getStockByOrder()
    }, [])

    useEffect(() => {
        console.log('list selected item', listSelectedItem)
    }, [listSelectedItem])

    const handleChangeItem = (item, qty) => {
        const newArr = listSelectedItem?.map((value) => {
            if (value?.value?.id === item?.value?.id) {
                const newItem = { ...item }
                newItem.value.qty = qty
                return newItem
            } else {
                return item
            }
        })
        setListSelectedItem(newArr)
    }
    const addEmptySelectedItem = () => {
        const newObj = {
            label: null,
            value: {
                name: null,
                qty: 0
            }
        }
        setListSelectedItem([newObj])
    }

    return (
        <div>
                <div className="container-fluid py-4">
                    <ModalLoading isLoading={loading} onHide={() => setLoading(false)} />
                    <Modal show={modalRetur} onHide={() => setModalRetur(false)}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered>
                        <Modal.Header>
                            <Modal.Title>
                                {`Barang Masuk`}
                            </Modal.Title>
                            <CloseButton onClick={() => setModalRetur(false)} />
                        </Modal.Header>
                        <Modal.Body style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* MAP SELECTED STOCK */}
                            {listSelectedItem?.map((item, index) => {
                                return (
                                    <div className="gap-3" style={{ display: 'flex', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div style={{ width: '60%' }}>
                                            <Select className="w-full"
                                                placeholder={'Pilih Produk'}
                                                options={productListOptions}
                                                onChange={(e) => {
                                                    e.value.qty = 0
                                                    if (listSelectedItem.length === 1) {
                                                        console.log([e])
                                                        setListSelectedItem([e])
                                                    } else {
                                                        listSelectedItem?.findIndex((e) => e.id === item?.id)
                                                        console.log('E', e)
                                                        setListSelectedItem((prev) => [...prev, e])
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button variant="primary" style={{ width: '10%', height: 30, alignSelf: 'center', padding: 'auto' }}
                                            onClick={() => {
                                                console.log(item)
                                            }}
                                        >
                                            <p style={{ alignSelf: 'center' }}>{`>>>`}</p>
                                        </Button>
                                        <Form.Control style={{ width: '20%', height: 40 }} max={10} type="input"
                                            value={item?.value.qty}
                                            onChange={(e) => {
                                                handleChangeItem(item, e.target.value)
                                            }}
                                        />
                                        {/* DELETE SELECTED STOCK */}
                                        <Button variant="danger" style={{ width: '10%' }}
                                            onClick={() => {
                                                setListSelectedItem((e) => e.filter((e, idx) => idx !== index))
                                            }}
                                        >
                                            <i className="material-icons opacity-10 -pt-2">delete</i>
                                        </Button>
                                    </div>
                                )
                            })}
                        </Modal.Body>
                        <Modal.Footer>
                            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 4 }}>
                                <Button
                                    onClick={() => {
                                        console.log('LIST SELECTED ITEM', listSelectedItem)
                                    }}
                                    variant="success">Submit</Button>
                                <Button
                                    onClick={() => {
                                        setModalRetur(false)
                                    }}
                                    variant="secondary">Batal</Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>Stock Customer</h2>
                        </div>
                    </div>
                    <div>
                        <Button
                            type='button'
                            variant='secondary'
                            style={{ width: '25%', alignSelf: 'flex-end' }}
                            onClick={() => {
                                if (listSelectedItem.length === 0) {
                                    addEmptySelectedItem()
                                }
                                setModalRetur(true)
                            }}
                        >Barang Masuk
                            <i className="material-icons opacity-10 -pt-2">login</i></Button>
                    </div>
                    <div className="row mt-4">
                        {productList?.map((_) => {
                            return (
                                <SmallImageCard title={_.name} subtitle={_.qty} />
                            )
                        })}
                    </div>
                </div>
        </div>
    )
}
export default StockCustomer