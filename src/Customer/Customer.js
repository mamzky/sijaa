import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CUSTOMER_COLLECTION } from '../Utils/DataUtils'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'

function Customer() {

  const navigate = useNavigate()
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
  const [customerData, setCustomerData] = useState([])
  const [loading, setLoading] = useState(false)

  const getCustomerList = async () => {
    const data = await getDocs(customerCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setCustomerData(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setLoading(false)
  }
  useEffect(() => {
    setLoading(true)
    getCustomerList()
  }, [])

  const searchCustomer = async (customerName) => {
    const q = query(collection(db, CUSTOMER_COLLECTION.toString()))
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot.docs
      .map(doc => doc.data()))
    const result = querySnapshot.docs
      .map(doc => doc.data())
      .filter((e) => e?.name?.toLowerCase()
        .includes(customerName?.toLowerCase()))
    setCustomerData(result)
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
              <h2>Customer</h2>
              <h6>Daftar Customer KNG</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button
                style={{ width: '40%', alignSelf: 'flex-end' }}
                onClick={() => {
                  navigate('/customer/new-customer')
                }}
              >+ Tambah Customer Baru</Button>
            </div>
          </div>

          <div>
            <Form.Group className="col-lg-6 col-md-3" controlId='customerName'>
              <Form.Control
                isInvalid={false}
                type="input"
                name='customerName'
                onChange={(e) => {
                  setTimeout(() => {
                    searchCustomer(e.target.value)
                  }, 500);
                }}
                placeholder="Cari customer"
              />
            </Form.Group>
          </div>

          <div class="row mt-4">
            <div className="card-body px-0 pb-2">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Customer</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Telepon</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Contact Person</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerData?.map((item, index) => {
                      return (
                        <tr onClick={() => {
                          navigate(`/customer/detail/${item.customer_code}`)
                        }}
                          style={{ cursor: 'pointer' }} // Optional: Change cursor on hover
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'black')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
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
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.phone}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.email}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.contact_person}</h6>
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

export default Customer