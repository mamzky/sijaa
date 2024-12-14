import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import TopNavBar from '../Components/TopNavBar'
import SideNavBar from '../Components/SideNavBar'
import SmallImageCard from '../Components/SmallImageCard'
import CustomTable from '../Components/CustomTable'
import { useNavigate } from 'react-router-dom'
import { db } from '../Config/FirebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from 'firebase/firestore'
import { PRODUCT_COLLECTION } from '../Utils/DataUtils'
import { DigitFormatter } from '../Utils/General'
// import { "product" } from '../Utils/DataUtils'

function Product() {

  const navigate = useNavigate()
  const productCollectionRef = collection(db, PRODUCT_COLLECTION)
  const [productData, setProductData] = useState([])
  const [lowestStock, setLowestStock] = useState([])
  const [loading, setLoading] = useState(false)


  const getProduct = async () => {
    const data = await getDocs(productCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    const lowestData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id })).sort((a, b) => a.qty - b.qty)
    setProductData(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
    setLowestStock(lowestData.length > 4 ? lowestData.slice(0, 4) : lowestData)
    setLoading(false)
  }
  useEffect(() => {
    setLoading(true)
    getProduct()
  }, [])

  useEffect(() => {
    console.log(lowestStock)
  }, [lowestStock])

  const searchProduct = async (productName) => {
    const q = query(collection(db, PRODUCT_COLLECTION.toString()))
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs
      .map(doc => doc.data())
      .filter((e) => e.product_name.toLowerCase()
        .includes(productName.toLowerCase())).sort((a, b) => a.qty - b.qty)
    setProductData(result)
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
              <h2>Produk</h2>
              <h6>Daftar Produk JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button
                style={{ width: '40%', alignSelf: 'flex-end' }}
                onClick={() => {
                  navigate('/product/add-new-product')
                }}
              >+ Tambah Produk Baru</Button>
            </div>
          </div>
          <div>
            <Form.Group className="col-lg-6 col-md-3" controlId='productName'>
              <Form.Control
                isInvalid={false}
                type="input"
                name='productName'
                onChange={(e) => {
                  setTimeout(() => {
                    searchProduct(e.target.value)
                  }, 500);
                  // setProductName(e.target.value)
                  // setErrorName(isEmpty(e.target.value))
                }}
                placeholder="Cari produk"
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
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Produk</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">UoM</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jml. Stock</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Supplier</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Harga Dasar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productData?.map((item, index) => {
                      return (
                        <tr onClick={() => {
                          navigate(`/product/product-detail/${item.product_code}`)
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
                                <h6 className="mb-0 text-sm">{item?.product_name}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">{item?.uom ?? '-'}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.qty}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{item?.supplier}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="progress-wrapper ps-3 py-1">
                              <div className="progress-info">
                                <div className="progress-percentage">
                                  <span className="text-xs font-weight-bold">{`Rp${DigitFormatter(item?.base_price)}`}</span>
                                </div>
                              </div>
                              {/* <div className="progress">
                                <div className="progress-bar bg-gradient-info w-60" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"></div>
                              </div> */}
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

export default Product