import React, { useEffect, useState } from "react"
import { Form, useNavigate, useParams } from "react-router-dom"
import ModalLoading from "../Components/ModalLoading"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { ORDER_COLLECTION } from "../Utils/DataUtils";
import { Button, FormCheck } from "react-bootstrap";
import { addLog } from "../Utils/Utils";
import Constant from "../Utils/Constants";
import moment from "moment";

const PackingDetailPage = () => {

    const navigate = useNavigate()
    const { order_number } = useParams()
    const [loading, setLoading] = useState(false)
    const [orderList, setOrderList] = useState([])
    const [orderData, setOrderData] = useState()

    useEffect(() => {
        getOrderData(order_number)
    }, [])

    const getOrderData = async (order_number) => {
        setLoading(true)
        const q = query(collection(db, ORDER_COLLECTION)
            , where('order_number', '==', order_number))
        const querySnapshot = await getDocs(q)
        const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        if (!querySnapshot.empty) {
            setLoading(false)
            setOrderData(result[0])
            const list = result?.[0]?.order_list?.map((order) => {
                return {
                    ...order,
                    checked: false
                }
            })
            setOrderList(list)
        } else {
            setLoading(false)
        }
    }

    const proceedOrder = () => {
        const newData = { ...orderData }
        newData.order_list = orderList
        newData.status = 'READY TO DELIVERY'
        newData.updated_at = moment()
        const oldData = doc(db, ORDER_COLLECTION, orderData?.id)
        updateDoc(oldData, newData)
            .then((val) => {
                setLoading(false)
                addLog('UPDATE STATUS ORDER', `${localStorage.getItem(Constant.USERNAME)} update selesai cek data`)
                navigate(-1)
            })
    }

    return (
        <div>
            <ModalLoading isLoading={loading} onHide={() => setLoading(false)} />
            <div class="container-fluid py-4">
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                        <h2>Packing Detail</h2>
                        <h6>Nomor Order {order_number}</h6>
                    </div>
                </div>

                <div class="row mt-4 w-full">
                    <div className="card-body px-0 pb-2">
                        <div className="table-responsive">
                            <table className="table align-items-center mb-0">
                                <thead>
                                    <tr>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah</th>
                                        <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Checklist</th>
                                    </tr>
                                </thead>
                                <tbody style={{ visibility: orderList.length > 0 }} >
                                    {orderList?.map((item, index) => {
                                        return (
                                            <tr className='border border-neutral-100 h-4' style={{ background: '#6FC276' }}>
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
                                                                <h6 className="mb-0 text-sm">{item?.qty}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="ps-3 py-1">
                                                            <div className="d-flex flex-column justify-content-center">
                                                                <div className="form-check flex cursor-pointer"
                                                                    onClick={() => {
                                                                        setOrderList((e) => e.map((val) => {
                                                                            if (item?.id === val?.id) {
                                                                                return {
                                                                                    ...val,
                                                                                    checked: !Boolean(val.checked)
                                                                                }
                                                                            } else {
                                                                                return val
                                                                            }
                                                                        }))
                                                                    }}
                                                                >
                                                                    {item?.checked ? (
                                                                        <i className="material-icons" style={{ fontSize: 30, fontWeight: 'bold', color: 'green' }}>check</i>
                                                                    ) :
                                                                        (
                                                                            <Button
                                                                                className="w-full flex"
                                                                                variant="secondary"
                                                                            >OK</Button>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                            </tr>

                                        )
                                    })}
                                </tbody>

                            </table>
                        </div>
                        <div className='my-4' style={{ width: '100%', display: 'flex', flexDirection: 'row-reverse', paddingRight: 16 }}>
                            <Button
                                type='button'
                                variant='success'
                                style={{ width: '20%' }}
                                disabled={orderList?.some(item => item?.checked === false)}
                                onClick={proceedOrder}
                            >Proses Order</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PackingDetailPage