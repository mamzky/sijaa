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

function Order() {

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
    getDocs(orderCollectionRef).then((res) => {
      const rawData = res?.docs?.map((doc) => ({ ...doc?.data(), id: doc?.id }))
      setOrderData(rawData?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at)))
    })
      .catch((err) => {
        console.log('ERR 2', err);
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filterByOrderNumber = async (order_number) => {
    const q = query(collection(db, ORDER_COLLECTION)
      , where('order_number', '==', order_number))
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    setOrderData(result)
  }

  const searchElement = () => {
    switch (filterField) {
      case 'Nomor Order':
        return (
          <Form.Control
            isInvalid={false}
            type="input"
            name='filterOrder'
            onChange={(e) => {
              setTimeout(() => {
                filterByOrderNumber(e.target.value)
              }, 500);
            }}
            placeholder="Pencarian..."
          />
        )
        break;
      case 'Customer':
        return (
          <Select
            options={customerList}
            placeholder="Pilih customer"
            onChange={(e) => {
              // setSelectedCustomer(e.id)
            }}
          />
        )
        break;
      case 'Jenis':
        return (
          <Select
            options={PaymentTypeList}
            placeholder="Jenis Pembayaran"
            onChange={(e) => {
              // setSelectedCustomer(e.id)
            }}
          />
        )
        break;
      case 'Tanggal':
        return (
          <Form.Control
            type="date"
            // name='orderDate'
            // value={orderDate}
            onChange={(e) => {
              // setOrderDate(e.target.value)
            }}
            placeholder="Tanggal order"
          />
        )
        break;
      case 'Status':
        return (
          <Select
            options={StatusTypeList}
            placeholder="Status Order"
            onChange={(e) => {
              console.log(e)
            }}
          />
        )
        break;
      default:
        return (
          null
        )
        break;
    }
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
            <h2>Order</h2>
            <h6>Data order JAA Alkesum</h6>
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

        <Row style={{ marginTop: 20, marginBottom: -20 }}>
          <Dropdown className='col-lg-2'>
            <Dropdown.Toggle className='col-lg-12' variant="success" id="dropdown-basic">
              {isEmpty(filterField) ? 'Filter' : filterField}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {filterByList.map(({ label, value }) => {
                return (
                  <Dropdown.Item
                    onClick={() => setFilterField(label)}
                  >{label}</Dropdown.Item>
                )
              })}
            </Dropdown.Menu>
          </Dropdown>
          <Form.Group className="col-lg-4 col-md-3" controlId='filterOrder'>
            {searchElement()}
          </Form.Group>
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
                  </tr>
                </thead>
                <tbody style={{ visibility: orderData.length > 0 }}>
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
                              <h6 className="mb-0 text-sm">{`Rp${DigitFormatter(calculateTotal(item?.order_list))}`}</h6>
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

export default Order