import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query } from '@firebase/firestore'
import { db } from '../Config/FirebaseConfig'
import { SALES } from '../Utils/DataUtils'

function Sales() {
  const navigate = useNavigate()
  const [loading, setIsLoading] = useState(false)
  //   const contactCollectionRef = collection(db, CONTACT_COLLECTION)
  const [contactData, setContactData] = useState([])

  //   const getListContact = async () => {
  //     setIsLoading(true)
  //     await getDocs(contactCollectionRef)
  //       .then((res) => {
  //         const listData = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  //         setContactData(listData)
  //       })
  //       .catch((err) => {
  //         console.log(err)
  //       })
  //       .finally(() => {
  //         setIsLoading(false)
  //       })
  //   }

  //   useEffect(() => {
  //     getListContact()
  //   }, [])

  //   const searchContact = async (contactName) => {
  //     const q = query(collection(db, CONTACT_COLLECTION.toString()))
  //     const querySnapshot = await getDocs(q);
  //     const result = querySnapshot.docs
  //       .map(doc => doc.data())
  //       .filter((e) => e.contactName.toLowerCase()
  //         .includes(contactName.toLowerCase())).sort((a, b) => a.qty - b.qty)
  //     setContactData(result)
  //   }

  return (
    <div>
      <div class="container-fluid py-4">
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
            <h2>Kontak</h2>
            <h6>Daftar sales JAA Alkesum</h6>
          </div>
          <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <Button style={{ width: '40%', alignSelf: 'flex-end' }}
              onClick={() => {
                navigate('/sales/new-sales')
              }}
            >+ Tambah Sales Baru</Button>
          </div>
        </div>

        <div>
          <Form.Group className="col-lg-6 col-md-3" controlId='contactName'>
            <Form.Control
              isInvalid={false}
              type="input"
              name='contactName'
              placeholder="Cari Sales"
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
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Sales</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tujuan</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal</th>
                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Detail</th>
                  </tr>
                </thead>
                <tbody>

                  {/* {contactData.map((contact, index) => { */}
                  {/* return ( */}
                  {/* <tr
                          key={contact.contactId}
                          onClick={() => {
                            navigate(`/contact/detail/${contact.contactId}`)
                          }}
                          style={{ cursor: 'pointer' }} // Optional: Change cursor on hover
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'black')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                        > */}
                  <td>
                    <div className="ps-3 py-1">
                      <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">1</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ps-3 py-1">
                      <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">john doe</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ps-3 py-1">
                      <div className="d-flex flex-column">
                        <h6 className="mb-0 text-sm">lorem ipsum</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ps-3 py-1">
                      <div className="d-flex flex-column">
                        <h6 className="mb-0 text-sm">01/01/1999</h6>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ps-3 py-1">
                      <div className="d-flex flex-column">
                        <h6 className="mb-0 text-sm"> <Button
                          style={{ width: '50%', alignSelf: 'flex-end' }}
                          onClick={() => {
                            navigate(`/sales/detail`)
                          }}
                        >{'detail'}</Button></h6>
                      </div>
                    </div>
                  </td>
                  {/* </tr> */}



                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// 

export default Sales