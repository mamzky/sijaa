import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ModalLoading from "../Components/ModalLoading"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { CUSTOMER_COLLECTION, ORDER_COLLECTION } from "../Utils/DataUtils";
import { Button, CloseButton, Form, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { addLog } from "../Utils/Utils";

import Constant from "../Utils/Constants";
import moment from "moment";
import PdfDocument from "./PdfDocument";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";

const DeliveryDetail = () => {

  const navigate = useNavigate()
  const defaultSold = { customer: null, qty: 0 }
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
  const { order_number } = useParams()
  const [loading, setLoading] = useState(false)
  const [orderList, setOrderList] = useState([])
  const [orderData, setOrderData] = useState()
  const [orderDataHolder, setOrderDataHolder] = useState()
  const [modalResult, setModalResult] = useState(false)
  const [salesStatus, setSalesStatus] = useState('SALES')
  const [modalDelivered, setModalDelivered] = useState(false)
  const [deliveryNote, setDeliveryNotes] = useState()
  const [customerList, setCustomerList] = useState([])
  const [showPDF, setShowPDF] = useState(false)

  useEffect(() => {
    getOrderData(order_number)
    getCustomer()
  }, [])

  const getOrderData = async (order_number) => {
    setLoading(true)
    const q = query(collection(db, ORDER_COLLECTION)
      , where('order_number', '==', order_number))
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    if (!querySnapshot.empty) {
      setLoading(false)
      const order = result[0]
      // setOrderData(result[0])
      const list = result?.[0]?.order_list?.map((order) => {
        return {
          ...order,
          sold: [defaultSold]
        }
      })
      order.order_list = list
      setOrderData(order)
      setOrderList(list)
    } else {
      setLoading(false)
    }
  }

  const proceedOrder = () => {
    setLoading(true)
    const newData = { ...orderData }
    newData.status = 'ON DELIVERY'
    newData.updated_at = moment().toString()
    const oldData = doc(db, ORDER_COLLECTION, orderData?.id)
    updateDoc(oldData, newData)
      .then((val) => {
        setLoading(false)
        addLog('ORDER DALAM PENGANTARAN', `${localStorage.getItem(Constant.USERNAME)} mengantar order`)
        navigate(-1)
        setLoading(false)
      })
  }

  const handleCloseDelivery = () => {
    const newData = { ...orderData }
    newData.status = 'DELIVERED'
    newData.updated_at = moment().toString()
    newData.delivery_note = deliveryNote
    const oldData = doc(db, ORDER_COLLECTION, orderData?.id)
    updateDoc(oldData, newData)
      .then((val) => {
        setLoading(false)
        addLog('ORDER SELESAI', `${localStorage.getItem(Constant.USERNAME)} menyelesaikan order`)
        navigate(-1)
      })
  }

  const getCustomer = async () => {
    const data = await getDocs(customerCollectionRef)
    const sortedData = data.docs.map((doc) => ({ id: doc.id, label: `${doc.data().name}(${doc.data().contact_person})`, value: doc.data() }))
    setCustomerList(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  const addSoldItem = (item) => {
    const newItem = {
      ...item,
      sold: [...item?.sold, ...[defaultSold]]
    }
    const newOrderList = []
    orderDataHolder?.order_list?.map((order) => {
      newOrderList.push(order?.id === newItem?.id ? newItem : order)
    })
    setOrderDataHolder((val) => {
      return {
        ...val,
        order_list: newOrderList
      }
    })
  }

  return (
    <div>
      <Modal show={loading} centered>
        <Modal.Body backdrop={'false'} show={true} onHide={() => setLoading(false)}
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
            <h2>Delivery Detail</h2>
            <h6>Nomor Order {order_number}</h6>
            <h4 className="mt-6">{`Tujuan: ${orderData?.customer?.name ?? ''} - ${orderData?.customer?.contact_person ?? ''}(${orderData?.customer?.phone ?? ''})`}</h4>
            <h6>Catatan: {orderData?.notes === '' ? '-' : orderData?.notes}</h6>
          </div>
        </div>

        <div className="row mt-4 w-full">
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
            <div className='my-4' style={{ gap: 8, width: '100%', display: 'flex', flexDirection: 'row-reverse', paddingRight: 16 }}>
              <Button
                type='button'
                variant={orderData?.status === 'READY TO DELIVERY' ? 'primary' : 'success'}
                style={{ width: '20%' }}
                onClick={() => {
                  if (orderData?.status === 'READY TO DELIVERY') {
                    proceedOrder()
                  } else if (orderData?.type.toUpperCase() === 'SALES CANVASER') {
                    setOrderDataHolder(orderData)
                    setModalResult(true)
                  } else {
                    setModalDelivered(true)
                  }
                }}
              >{orderData?.status === 'READY TO DELIVERY' ? 'Proses Order' : 'Selesai'}</Button>
              <Button type='button'
                variant={'primary'}
                style={{ width: '20%', visibility: orderData?.status === 'READY TO DELIVERY' ? 'visible' : 'hidden' }}
                onClick={() => setShowPDF(true)}
              >
                <i className="material-icons opacity-10">print</i>
                Cetak Surat Jalan</Button>
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
            <div className="table-responsive" style={{ overflowY: 'auto' }}>
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Terjual</th>
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
                        <td style={{ width: '5%' }}>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column justify-content-center">
                              <h6 className="mb-0 text-sm">{item?.qty}</h6>
                            </div>
                          </div>
                        </td>
                        <td style={{ width: '50%' }}>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column justify-content-center">
                              {item?.sold?.map((soldItem) => {
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Form.Select size="sm"
                                      value={soldItem?.customer}
                                      style={{ width: '70%' }}
                                      defaultValue={null}
                                      defaultChecked={null}
                                    >
                                      <option value={null}>Pilih Customer</option>
                                      {customerList?.map((cust) => {
                                        return (
                                          <option defaultChecked={null} defaultValue={null} value={cust?.value}>{cust?.label}</option>
                                        )
                                      })}
                                    </Form.Select>
                                    <Form.Select size="sm"
                                      defaultValue={null}
                                      defaultChecked={null}
                                      value={item.qty}
                                      style={{ width: '30%' }}>
                                      <option value={null}>Pilih Qty</option>
                                      {Array.from({ length: Number(item?.qty) + 1 }, (_, i) => i).map((soldQty) => {
                                        return (
                                          <option defaultChecked={null} defaultValue={null} value={soldQty}>{soldQty}</option>
                                        )
                                      })}
                                    </Form.Select>
                                  </div>
                                )
                              })}

                              <Button
                                style={{ padding: 2, marginTop: 8 }}
                                onClick={() => addSoldItem(item)}
                              >+ Tambah</Button>
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

      <Modal
        show={modalDelivered}
        onHide={() => setModalDelivered(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>
            Selesaikan Pesanan
          </Modal.Title>
          <CloseButton onClick={() => setModalResult(false)} />
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table align-items-center mb-0">
              <thead>
                <tr>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Barang</th>
                  <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah</th>
                </tr>
              </thead>
              <tbody style={{ visibility: orderData?.order_list?.length > 0 }} >
                {orderData?.order_list?.map((item, index) => {
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
            <Form.Group className="col-lg-12" style={{ marginBottom: 20 }}>
              <Form.Label>Catatan Pesanan</Form.Label>
              <Form.Control
                as="textarea"
                value={deliveryNote}
                onChange={(e) => {
                  setDeliveryNotes(e.target.value)
                }}
                placeholder="Catatan Pengiriman"
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setModalDelivered(false)}>Batal</Button>
          <Button variant="success" onClick={handleCloseDelivery}>Selesai</Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showPDF}
        onHide={() => setShowPDF(false)}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            Dokumen Perjalanan
          </Modal.Title>
          <CloseButton onClick={() => setShowPDF(false)} />
        </Modal.Header>
        <Modal.Body style={{ height: '70vh' }}>
          <PDFViewer style={{ display: 'flex', flex: 1, height: '100%', width: '100%' }}>
            <PdfDocument order={orderData} />
          </PDFViewer>
        </Modal.Body>
      </Modal>

    </div>
  )
}

export default DeliveryDetail