import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { CUSTOMER_COLLECTION, TRANSACTION_COLLECTION } from '../Utils/DataUtils'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import moment from 'moment'
import { calculateTotal } from '../Utils/Utils'
import { DigitFormatter } from '../Utils/General'

function Transaction() {

  const navigate = useNavigate()
  const transactionCollectionRef = collection(db, TRANSACTION_COLLECTION)
  const [transactionData, setTransactionData] = useState([])

  const getTransactionList = async () => {
    const data = await getDocs(transactionCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    console.log(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    setTransactionData(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }
  useEffect(() => {
    getTransactionList()
  }, [])

  // const searchCustomer = async (customerName) => {
  //   const q = query(collection(db, CUSTOMER_COLLECTION.toString()))
  //   const querySnapshot = await getDocs(q);
  //   console.log(querySnapshot.docs
  //     .map(doc => doc.data()))
  //   const result = querySnapshot.docs
  //     .map(doc => doc.data())
  //     .filter((e) => e.name.toLowerCase()
  //       .includes(customerName.toLowerCase()))
  //   setTransactionData(result)
  // }

  return (
    <div>
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Transaksi</h2>
              <h6>Data transaksi JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button
                style={{ width: '40%', alignSelf: 'flex-end' }}
                onClick={() => {
                  navigate('/transaction/new-transaction')
                }}
              >+ Tambah Transaksi Baru</Button>
            </div>
          </div>

          {/* <div>
            <Form.Group className="col-lg-6 col-md-3" controlId='customerName'>
              <Form.Control
                isInvalid={false}
                type="input"
                name='customerName'
                onChange={(e) => {
                  setTimeout(() => {
                    searchCustomer(e.target.value)
                  }, 500);
                  // setProductName(e.target.value)
                  // setErrorName(isEmpty(e.target.value))
                }}
                placeholder="Cari customer"
              />
            </Form.Group>
          </div> */}

          <div class="row mt-4">
            <div className="card-body px-0 pb-2">
              <div className="table-responsive">
                <table className="table align-items-center mb-0">
                  <thead>
                    <tr>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nomor Transaksi</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Customer</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData?.map((item, index) => {
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
                                <h6 style={{cursor: 'pointer'}}  className="mb-0 text-sm">{item?.order_number}</h6>
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
                                <h6 className="mb-0 text-sm">{'Aktif'}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{moment(item.created_at).format('DD MMM YYYY')}</h6>
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
      </main>
    </div>
  )
}

export default Transaction