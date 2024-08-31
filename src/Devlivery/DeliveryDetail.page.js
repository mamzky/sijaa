import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ModalLoading from "../Components/ModalLoading"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { ORDER_COLLECTION } from "../Utils/DataUtils";
import { Button, CloseButton, Form, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { addLog } from "../Utils/Utils";
import Constant from "../Utils/Constants";
import moment from "moment";

const DeliveryDetail = () => {

  const navigate = useNavigate()
  const { order_number } = useParams()
  const [loading, setLoading] = useState(false)
  const [orderList, setOrderList] = useState([])
  const [orderData, setOrderData] = useState()
  const [orderDataHolder, setOrderDataHolder] = useState()
  const [modalResult, setModalResult] = useState(false)
  const [salesStatus, setSalesStatus] = useState('SALES')

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
          sold_qty: 0
        }
      })
      setOrderList(list)
    } else {
      setLoading(false)
    }
  }

  const proceedOrder = () => {
    const newData = { ...orderData }
    newData.status = 'ON DELIVERY'
    newData.updated_at = moment()
    const oldData = doc(db, ORDER_COLLECTION, orderData?.id)
    updateDoc(oldData, newData)
      .then((val) => {
        setLoading(false)
        addLog('ORDER DALAM PENGANTARAN', `${localStorage.getItem(Constant.USERNAME)} mengantar order`)
        navigate(-1)
      })
  }

  return (
    <div>
      <ModalLoading isLoading={loading} onHide={() => setLoading(false)} />
      <div class="container-fluid py-4">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
            <h2>Delivery Detail</h2>
            <h6>Nomor Order {order_number}</h6>
            <h4 className="mt-6">{`${orderData?.customer?.name} - ${orderData?.customer?.contact_person}(${orderData?.customer?.phone})`}</h4>
            <h6>Catatan: {orderData?.notes === '' ? '-' : orderData?.notes}</h6>
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
                      </tr>
                    )
                  })}
                </tbody>

              </table>
            </div>
            <div className='my-4' style={{ width: '100%', display: 'flex', flexDirection: 'row-reverse', paddingRight: 16 }}>
              <Button
                type='button'
                variant={orderData?.status === 'READY TO DELIVERY' ? 'primary' : 'success'}
                style={{ width: '20%' }}
                onClick={() => {
                  if (orderData?.status === 'READY TO DELIVERY') {
                    proceedOrder()
                  } else {
                    setOrderDataHolder(orderData)
                    setModalResult(true)
                  }
                }}
              >{orderData?.status === 'READY TO DELIVERY' ? 'Proses Order' : 'Selesai'}</Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={modalResult}
        size="lg"
        centered
      >
        <Modal.Header>
          <Modal.Title>
            Status Pesanan
          </Modal.Title>
          <CloseButton onClick={() => setModalResult(false)} />
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <ToggleButtonGroup className="flex w-full" type="radio" name="options" defaultValue={'SALES'} value={salesStatus}>
              <ToggleButton id="tbg-radio-1" value={'RETUR'}
                onClick={() => setSalesStatus('RETUR')}>
                Retur
              </ToggleButton>
              <ToggleButton id="tbg-radio-2" value={'STOK'}
                onClick={() => setSalesStatus('STOK')}>
                Stok Customer
              </ToggleButton>
              <ToggleButton id="tbg-radio-3" value={'SALES'}
                onClick={() => setSalesStatus('SALES')}>
                Sales
              </ToggleButton>
            </ToggleButtonGroup>
            <div className="table-responsive">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah Terjual</th>
                  </tr>
                </thead>
                <tbody style={{ visibility: orderDataHolder?.order_list?.length > 0 }} >
                  {orderDataHolder?.order_list?.map((item, index) => {
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
                              <Form.Select size="sm" value={item?.sold_qty}>
                                {Array.from({ length: Number(item?.qty) + 1 }, (_, i) => i).map((qty) => {
                                  return (
                                    <option>{qty}</option>
                                  )
                                })}
                              </Form.Select>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setModalResult(false)}>Batal</Button>
          <Button variant="success" onClick={() => { }}>Selesai</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default DeliveryDetail