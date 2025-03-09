import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import { Button, Dropdown, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CUSTOMER_COLLECTION, ORDER_COLLECTION } from '../Utils/DataUtils'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment'
import { calculateTotal } from '../Utils/Utils'
import { DigitFormatter, PaymentTypeList, StatusTypeList, filterByList } from '../Utils/General'
import { isEmpty } from 'ramda'
import Select from 'react-select'
import Constant from '../Utils/Constants'
import { toast } from 'react-toastify'

function Order() {

  const navigate = useNavigate()
  const orderCollectionRef = collection(db, ORDER_COLLECTION)
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)

  const [orderData, setOrderData] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalDelete, setModalDelete] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [searchOrderNumber, setSearchOrderNumber] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState()


  const getCustomer = async () => {
    const data = await getDocs(customerCollectionRef)
    const sortedData = data?.docs?.map((doc) => ({ id: doc?.id, label: `${doc?.data()?.name}(${doc?.data()?.contact_person})`, value: doc?.data() }))
    if (sortedData?.length > 0) {
      setCustomerList(sortedData?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at)))
    }
  }
  useEffect(() => {
    setLoading(true)
    getCustomer()
    getListOrder()
  }, [])

  const getListOrder = () => {
    getDocs(orderCollectionRef).then((res) => {
      const rawData = res?.docs?.map((doc) => ({ ...doc?.data(), id: doc?.id })).filter((e) => e.status !== 'DELETED')
      setOrderData(rawData?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at)))
    })
      .catch((err) => {
        toast.error('Terjadi Kesalahan, silahkan ulangi beberapa saat dan reload halaman')
        console.log('ERR 2', err);
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const cancelOrder = async () => {
    setModalDelete(false)
    setLoading(true)
    const holderOrder = { ...selectedOrder, cancel_reason: cancelReason, status: 'DELETED', deleted_at: new Date().toISOString(), deleted_by: localStorage.getItem(Constant.USERNAME) }
    const oldOrderDoc = doc(db, ORDER_COLLECTION, selectedOrder?.id)
    updateDoc(oldOrderDoc, holderOrder)
      .then(() => {
        console.log('DONE');
      })
      .catch((err) => {
        console.log('ERR', err);
      })
    setLoading(false)
  }

  const searchOrderbyId = (id) => {
    return orderData.filter((e) => e?.order_number?.toString()?.toUpperCase()?.includes(id?.toUpperCase()))
  }

  const searchByCustomerId = async (id) => {
    setLoading(true)
    const q = query(collection(db, ORDER_COLLECTION)
      , where('customer_id', '==', id))
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    if (!querySnapshot.empty) {
      console.log('RESULT', result);
      setOrderData(result)
      setLoading(false)
    } else {
      setLoading(false)
      console.log('FAILED');
    }
  }

  useEffect(() => {
    if (searchOrderNumber?.length > 0) {
      setOrderData(searchOrderbyId(searchOrderNumber))
    } else {
      getListOrder()
    }
  }, [searchOrderNumber])

  useEffect(() => {
    if (Boolean(selectedCustomer)) {
      searchByCustomerId(selectedCustomer)
    } else {
      getListOrder()
    }
  }, [selectedCustomer])

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
      <div class="container-fluid py-4">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
            <h2>Order</h2>
            <h6>Data order KNG</h6>
          </div>
          <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <Button
              style={{ width: '40%', alignSelf: 'flex-end' }}
              onClick={() => {
                navigate('/order/add-order')
              }}
            >+ Tambah Order Baru</Button>
          </div>
        </div>

        <Row style={{ marginTop: 20, marginBottom: -20, gap: 8 }}>
          <Form.Control
            style={{ width: '30%' }}
            type="input"
            name='searchByOrderNumber'
            value={searchOrderNumber}
            onChange={(e) => {
              setSearchOrderNumber(e.target.value)
            }}
            placeholder="Cari Berdasarkan Order Number"
          />
          <Form.Select
            style={{ width: "20%" }}
            name="customerSelect"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            placeholder='Semua Customer'
          >
            <option value="">Semua Customer</option>
            {customerList
              ?.slice()
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((customer) => (
                <option key={customer?.value?.customer_code} value={customer?.value?.customer_code}>
                  {customer.label}
                </option>
              ))}
          </Form.Select>
        </Row>

        <div class="row mt-4">
          <div className="card-body px-0 pb-2">
            <div className="table-responsive">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Order</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"></th>
                  </tr>
                </thead>
                <tbody style={{ visibility: orderData?.length > 0 }}>
                  {orderData?.map((item, index) => {
                    return (
                      <tr>
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
                              <h6
                                style={{ cursor: 'pointer', color: 'blue' }}
                                onClick={() => {
                                  navigate(`/order/detail/${item?.order_number}`)
                                }}
                                className="mb-0 text-sm">{item?.order_number}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column">
                              <h6 className="mb-0 text-sm">{item?.customer?.name}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column">
                              <h6 className="mb-0 text-sm">{item?.type}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column">
                              <h6 className="mb-0 text-sm">{item?.status}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column">
                              <h6 className="mb-0 text-sm">{moment(item?.created_at).format('DD MMM YYYY  HH:mm')}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="ps-3 py-1">
                            <div className="d-flex flex-column">
                              {item?.status === 'DELIVERED' ?
                                <h6 className="mb-0 text-sm">-</h6>
                                :
                                <h6 className="mb-0 text-sm">{isNaN(calculateTotal(item?.order_list)) ? `-` : `Rp${DigitFormatter(calculateTotal(item?.order_list))}`}</h6>
                              }
                            </div>
                          </div>
                        </td>
                        <td>
                          {['READY TO DELIVERY', 'READY TO PACK'].includes(item?.status) &&
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <Button variant="danger" onClick={() => {
                                  setSelectedOrder(item)
                                  setModalDelete(true)
                                }}>X</Button>
                              </div>
                            </div>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Modal show={modalDelete}>
        <Modal.Header>Batalkan Pesanan</Modal.Header>
        <Modal.Body>
          <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <Form.Label>Alasan</Form.Label>
            <Form.Control
              style={{ width: '100%' }}
              type="input"
              name='cancelReason'
              value={cancelReason}
              onChange={(e) => {
                setCancelReason(e.target.value)
              }}
              placeholder="Alasan Pembatalan"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={() => {
            setModalDelete(false)
            setCancelReason('')
          }}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            setModalDelete(false)
            cancelOrder()
          }}>Ya, Batalkan</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Order