import React, { useEffect, useState } from "react"
import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ORDER_COLLECTION } from "../Utils/DataUtils";
import { useNavigate, useParams } from "react-router-dom";
import LargeImageCard from "../Components/LargeImageCard";
import SmallImageCard from "../Components/SmallImageCard";
import { Alert, Button, CloseButton, Form, Modal, Row, Spinner } from "react-bootstrap";
import Select from 'react-select'
import moment from "moment";
import Constant from "../Utils/Constants";
import ModalLoading from "../Components/ModalLoading";

function StockCustomer() {

    const navigate = useNavigate()
    const [orderData, setOrderData] = useState([])
    const [loading, setLoading] = useState(false)
    const { customer_code } = useParams()
    const [productList, setProductList] = useState([])
    const [productListOptions, setProductListOptions] = useState([])
    const [modalRetur, setModalRetur] = useState(false)
    const [listSelectedItem, setListSelectedItem] = useState([])
    const [orderDetail, setOrderDetail] = useState(null)
    const [modalDetail, setModalDetail] = useState(false)



    const getStockByOrder = async () => {
        const q = query(collection(db, ORDER_COLLECTION)
            , where('customer_id', '==', customer_code))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            console.log('RESULT', result);

            const mergedData = Object.values(
                result.flatMap(order =>
                    order.order_list.map(item => ({
                        id: item.id,
                        order_number: { number: order.order_number, created_at: order.created_at },
                        created_at: order.created_at,
                        name: item.name,
                        total_qty: item.qty
                    }))
                ).reduce((acc, item) => {
                    if (!acc[item.id]) {
                        acc[item.id] = { ...item, order_number: [item.order_number] };
                    } else {
                        acc[item.id].total_qty += item.total_qty;
                        acc[item.id].order_number.push(item.order_number);
                    }
                    return acc;
                }, {})
            );
            setProductList(mergedData)
            console.log('RESULT STOCKS', mergedData);
        } else {
            setOrderData([])
            console.log('FAILED');
        }
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
                    <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Product</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Stock</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Order Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productList?.map((item, index) => {
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
                                                    <h6 className="mb-0 text-sm">{item?.name}</h6>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ps-3 py-1">
                                                <div className="d-flex flex-column justify-content-center">
                                                    <h6 className="mb-0 text-sm">{item?.total_qty}</h6>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ps-3 py-1">
                                                <div className="d-flex flex-column justify-content-center">
                                                    <Button variant="success" onClick={() => {
                                                        setOrderDetail(item)
                                                        setModalDetail(true)
                                                    }}>Detail Order</Button>
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
            <Modal show={modalDetail}>
                <Modal.Header>Order Detail</Modal.Header>
                <Modal.Body>
                    <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Order Number</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetail?.order_number?.map((item, index) => {
                                return (
                                    <tr key={item?.id}>
                                        <td>
                                            <div className="ps-3 py-1">
                                                <div className="d-flex flex-column justify-content-center">
                                                    <h6 style={{ cursor: 'pointer', color: 'blue' }}
                                                        onClick={() => {
                                                            navigate(`/order/detail/${item?.number}`)
                                                        }}>{item?.number}</h6>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ps-3 py-1">
                                                <div className="d-flex flex-column justify-content-center">
                                                    <h6 className="mb-0 text-sm">{moment(item?.created_at).format('DD MMM YYYY HH:mm')}</h6>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => {
                        setModalDetail(false)
                    }}>Tutup</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}
export default StockCustomer