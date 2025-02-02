import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import { Button, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CUSTOMER_COLLECTION, ORDER_COLLECTION } from '../Utils/DataUtils'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment'
import { calculateTotal } from '../Utils/Utils'
import { DigitFormatter, PaymentTypeList, StatusTypeList, filterByList } from '../Utils/General'
import { isEmpty } from 'ramda'
import Select from 'react-select'
import ModalLoading from '../Components/ModalLoading'

function Delivery() {

  const navigate = useNavigate()
  const orderCollectionRef = collection(db, ORDER_COLLECTION)
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)

  const [orderData, setOrderData] = useState([])
  const [customerList, setCustomerList] = useState([])
  const [loading, setLoading] = useState(false)

  // FILTER
  const [filterField, setFilterField] = useState('')

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
    getPackingOrder()
  }, [])

  const getPackingOrder = async () => {
    const q = query(collection(db, ORDER_COLLECTION)
      , where('status', 'in', ['READY TO DELIVERY', 'ON DELIVERY'])
    )
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setOrderData(result)
    setLoading(false)
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

      <div class="container-fluid py-4">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
            <h2>Delivery</h2>
            <h6>Data Delivery JAA Alkesum</h6>
          </div>
        </div>

        <div class="row mt-4">
          <div className="card-body px-0 pb-2">
            <div className="table-responsive">
              <table className="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Order</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tipe</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"></th>
                  </tr>
                </thead>
                <tbody style={{ visibility: orderData.length > 0 }} >
                  {orderData?.
                    sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).
                    sort((a, b) => b?.status - a?.status).
                    map((item, index) => {
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
                                <h6
                                  style={{ cursor: 'pointer', color: 'blue' }}
                                  className="mb-0 text-sm"
                                  onClick={() => {
                                    navigate(`/order/detail/${item?.order_number}`)
                                  }}
                                >{item?.order_number}</h6>
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
                                <h6 className="mb-0 text-sm">{item?.status}</h6>
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
                                <h6 className="mb-0 text-sm">{moment(item?.created_at).format('DD-MMM-YYYY HH:mm')}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <Button style={{ width: '100%' }} variant={item?.status === 'READY TO DELIVERY' ? 'primary' : 'success'} type="button"
                                  onClick={() => {
                                    navigate(`/delivery/detail/${item?.order_number}`)
                                  }}
                                >
                                  {item?.status === 'READY TO DELIVERY' ? 'Proses' : 'Detail'}
                                </Button>
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
        </div>

      </div>
    </div>
  )
}

export default Delivery