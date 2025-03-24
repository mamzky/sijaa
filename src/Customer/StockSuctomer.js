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
    const [orderDetail, setOrderDetail] = useState(null)
    const [modalDetail, setModalDetail] = useState(false)



    const getStockByOrder = async () => {
        const q = query(collection(db, ORDER_COLLECTION)
            , where('customer_id', '==', customer_code)
            , where('status', 'in', ['DELIVERED', 'RETUR'])
        )
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {

            const mergedData = Object.values(
                result.flatMap(order =>
                    order.order_list.map(item => ({
                        id: item.id,
                        order_number: { number: order.order_number, created_at: order.created_at },
                        created_at: order.created_at,
                        name: item.name,
                        total_qty: item.qty * (order.status === "RETUR" ? -1 : 1) // Kurangi jika status RETUR
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
        } else {
            setOrderData([])
        }
    }

    useEffect(() => {
        getStockByOrder()
    }, [])

    return (
        <div>
            <div className="container-fluid py-4">
                <ModalLoading isLoading={loading} onHide={() => setLoading(false)} />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                        <h2>Stock Customer</h2>
                    </div>
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
                    <div className="overflow-auto" style={{ maxHeight: '60vh' }}>
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
                    </div>
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