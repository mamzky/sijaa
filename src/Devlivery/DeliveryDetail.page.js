import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ModalLoading from "../Components/ModalLoading"
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { CUSTOMER_COLLECTION, ORDER_COLLECTION } from "../Utils/DataUtils";
import { Button, CloseButton, Form, Modal, ModalBody, Spinner } from "react-bootstrap";
import { addLog } from "../Utils/Utils";

import Constant from "../Utils/Constants";
import moment from "moment";
import PdfDocument from "./PdfDocument";
import { Document, Page, pdfjs } from "react-pdf";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import IMGJAA from '../assets/img/jaa.png'
import AppColors from "../Utils/Colors";

const DeliveryDetail = () => {

  const navigate = useNavigate()
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
  const { order_number } = useParams()
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState()
  const [orderDataHolder, setOrderDataHolder] = useState()
  const [modalResult, setModalResult] = useState(false)
  const [modalDelivered, setModalDelivered] = useState(false)
  const [deliveryNote, setDeliveryNotes] = useState()
  const [customerList, setCustomerList] = useState([])
  const [showInvoice, setShowInvoice] = useState(false)
  const [showDeliveryNote, setShowDeliveryNote] = useState(false)
  const [soldItem, setSoldItem] = useState([])
  const [overQty, setOverQty] = useState([])
  const [showModalCloseSales, setShowModalCloseSales] = useState(false)

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
      setOrderData(order)
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

  const handleCloseDelivery = (data) => {
    const newData = data
    newData.status = 'DELIVERED'
    newData.updated_at = moment().toString()
    newData.delivery_note = deliveryNote ?? 'Sales Canvaser'

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
    setSoldItem((e) => [...e, { customer: null, qty: 0, id: item?.id, unique_id: Math.floor(Math.random() * 9999) }])
  }

  const validateResult = () => {
    const validateQty = orderData?.order_list?.map((order_list, idx) => {
      const totalQty = soldItem?.filter((item) => item.id === order_list?.id)?.reduce((acc, item) => acc + item.qty, 0)
      return Boolean(totalQty > order_list.qty)
    })
    setOverQty(validateQty)
  }

  const saveOrderSales = () => {
    validateResult()
    const newOrderList = orderData?.order_list?.map((item) => ({ ...item, sold: soldItem?.filter((e) => e.id === item?.id) }))
    const hasNullCustomer = newOrderList?.some(item =>
      item.sold?.some(sale => sale.customer === null || sale.qty === 0)
    );
    if (hasNullCustomer) {
      alert('Data penjualan belum valid, terdapat transaksi dengan jumlah (qty) yang belum terisi atau pelanggan (customer) belum ditentukan.')
    } else {
      const updatedOrderData = { ...orderData, order_list: newOrderList }
      setOrderData(updatedOrderData)
      // handleCloseDelivery(updatedOrderData)
      setShowModalCloseSales(true)
    }
  }

  useEffect(() => {
    validateResult()

  }, [soldItem])

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
                <tbody style={{ visibility: orderData?.order_list.length > 0 }} >
                  {orderData?.order_list?.map((item, index) => {
                    return (
                      <tr className='border border-neutral-100 h-4'>
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
                onClick={() => setShowInvoice(true)}
              >
                <i className="material-icons opacity-10">print</i>
                Cetak Invoice</Button>
              <Button type='button'
                variant={'primary'}
                style={{ width: '20%', visibility: orderData?.status === 'READY TO DELIVERY' ? 'visible' : 'hidden' }}
                onClick={() => setShowDeliveryNote(true)}
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
                      <tr className={`border border-neutral-100 table ${Boolean(overQty && overQty[index]) ? 'table-danger' : ''}`}>
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
                              {soldItem?.filter((e) => e.id === item?.id).map((val, idx) => {
                                return (
                                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Form.Select size="sm"
                                      style={{ width: '70%', height: 32 }}
                                      defaultValue={null}
                                      defaultChecked={null}
                                      onChange={(inputCustomer) => {
                                        const customer = customerList.find((e) => e.label === inputCustomer?.target.value)?.value
                                        const isExist = soldItem?.findIndex((e) => e?.id === item?.id && e?.customer?.customer_code === customer?.customer_code)
                                        if (isExist === -1) {
                                          setSoldItem((e) =>
                                            e.map((items) => items?.unique_id === val?.unique_id ? { ...val, customer } : items))
                                        } else {
                                          alert('Customer sudah terpilih dengan item yang sama')
                                          setSoldItem((e) => e.filter((item) => item?.unique_id !== val.unique_id))
                                        }
                                      }}
                                    >
                                      <option value={null}>Pilih Customer</option>
                                      {customerList?.map((cust) => {
                                        return (
                                          <option defaultChecked={null} defaultValue={null} value={cust?.value?.id}>{cust?.label}</option>
                                        )
                                      })}
                                    </Form.Select>
                                    <Form.Select size="sm"
                                      defaultValue={0}
                                      defaultChecked={0}
                                      style={{ width: '30%', height: 32 }}
                                      onChange={(inputQty) => {
                                        setSoldItem((e) =>
                                          e.map((items) => items?.unique_id === val?.unique_id ? { ...val, qty: Number(inputQty.target?.value) } : items))
                                      }}
                                    >
                                      <option value={null}>0</option>
                                      {Array.from({ length: Number(item?.qty) + 1 }, (_, i) => i).map((soldQty) => {
                                        if (soldQty > 0) {
                                          return (
                                            <option defaultChecked={null} defaultValue={null} value={soldQty}>{soldQty}</option>
                                          )
                                        }
                                      })}
                                    </Form.Select>
                                    <Button variant="danger" style={{ height: 32, marginLeft: 4 }}
                                      onClick={() => {
                                        setSoldItem((e) => e.filter((item) => item?.unique_id !== val.unique_id))
                                      }}
                                    >
                                      x
                                    </Button>
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
          <Button variant="success" disabled={overQty?.some(e => e)} onClick={saveOrderSales}>Selesai</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showModalCloseSales}
        onHide={() => setModalDelivered(false)}
        centered
      >
        <ModalBody>
          <div>
            <h4>Item Terjual</h4>
            {orderData?.order_list?.map((order) => (
              <div style={{ paddingLeft: '5%' }}>
                <h5>{order?.name}</h5>
                {order?.sold?.length > 0 ?
                  (
                    order?.sold?.map((sold) => (
                      <div style={{ width: '70%', marginLeft: '7%', display: 'flex', flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                        <span>{`${sold?.customer?.name} (${sold?.customer?.contact_person})`}</span>
                        <span>{`${sold?.qty} (pcs)`}</span>
                      </div>
                    ))
                  )
                  : (
                    <div><span>*Tidak Ada Data*</span></div>
                  )}
              </div>
            ))}
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModalCloseSales(false)}>Batal</Button>
          <Button variant="success" onClick={() => {
            console.log('orderData', orderData);
            handleCloseDelivery(orderData)
          }}>Selesai</Button>
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
          <Button variant="success" onClick={() => handleCloseDelivery(orderData)}>Selesai</Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showInvoice}
        onHide={() => setShowInvoice(false)}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            Invoice
          </Modal.Title>
          <CloseButton onClick={() => setShowInvoice(false)} />
        </Modal.Header>
        <Modal.Body style={{ height: '70vh' }}>
          <PDFViewer style={{ display: 'flex', flex: 1, height: '100%', width: '100%' }}>
            <PdfDocument order={orderData} type={'INVOICE'} />
          </PDFViewer>
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeliveryNote}
        onHide={() => setShowDeliveryNote(false)}
        size="lg"
      >
        <Modal.Header>
          <Modal.Title>
            Dokumen Perjalanan
          </Modal.Title>
          <CloseButton onClick={() => setShowDeliveryNote(false)} />
        </Modal.Header>
        <Modal.Body style={{ height: '70vh' }}>
          <PDFViewer style={{ display: 'flex', flex: 1, height: '100%', width: '100%' }}>
            <PdfDocument order={orderData} type={'DELIVERY_NOTES'} />
          </PDFViewer>
        </Modal.Body>
      </Modal>

    </div>
  )
}

export default DeliveryDetail