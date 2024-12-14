import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import { Button, Modal, Form } from 'react-bootstrap'
import { db } from '../Config/FirebaseConfig';
import { PRODUCT_COLLECTION } from '../Utils/DataUtils'
import { collection, doc, getDocs, query, updateDoc } from 'firebase/firestore'
import { OnlyDigit } from '../Utils/General'
import { addLog } from '../Utils/Utils';
import Constant from '../Utils/Constants';
import moment from 'moment';

function Stock() {

  const productCollectionRef = collection(db, PRODUCT_COLLECTION)
  const [loading, setLoading] = useState(false)
  const [stock, setStock] = useState([])
  const [modalUpdateStock, setModalUpdateStock] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [newStock, setNewStock] = useState(0)
  const [reason, setReason] = useState('')

  const getStock = async () => {
    const data = await getDocs(productCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setStock(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  useEffect(() => {
    getStock()
  }, [])

  const updateStock = async () => {
    console.log(selectedProduct)
    const productHolder = { ...selectedProduct }
    productHolder.qty = newStock
    productHolder.latest_update = reason
    productHolder.updated_at = moment().format('DD/MMM/YYYY HH:mm')

    const producDoc = doc(db, PRODUCT_COLLECTION, selectedProduct.id)
    await updateDoc(producDoc, productHolder).then((res) => {
      addLog('UPDATE STOCK', `${localStorage.getItem(Constant.USERNAME)} update stock "${selectedProduct?.product_name}" dari ${selectedProduct?.qty} menjadi ${newStock}`)
      getStock()
      setModalUpdateStock(false)
      setLoading(false)
      setNewStock(0)
    })
  }

  const searchProduct = async (productName) => {
    const q = query(collection(db, PRODUCT_COLLECTION.toString()))
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs
      .map(doc => doc.data())
      .filter((e) => e.product_name.toLowerCase()
        .includes(productName.toLowerCase())).sort((a, b) => a.qty - b.qty)
    setStock(result)
  }



  return (
    <div>
      <Modal
        show={modalUpdateStock}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title>
            Update Stok
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h3 style={{ marginBottom: 40, textAlign: 'center' }}>{selectedProduct?.product_name ?? '-'}</h3>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ flex: 1 }}>
                <h6 style={{ textAlign: 'center' }}>Jumlah stok sebelum</h6>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ textAlign: 'center', marginTop: -20 }}>{selectedProduct?.qty}</h4>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h6 style={{ textAlign: 'center' }}>Jumlah stok terbaru</h6>
                <Form.Group>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexDirection: 'row'
                    }}
                  >
                    <Form.Control
                      style={{
                        width: '30%',
                        fontSize: 24
                      }}
                      type='input'
                      name='newStock'
                      value={newStock}
                      onChange={(e) => {
                        const digitOnly = OnlyDigit(e.target.value)
                        setNewStock(digitOnly)
                      }}
                    />
                  </div>
                </Form.Group>
              </div>

            </div>
            <div>
              <h6 style={{ textAlign: 'center' }}>Keterangan<p>{'(Wajib diisi)'}</p></h6>
              <Form.Control
                style={{
                  width: '100%'
                }}
                type='input'
                name='reason'
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setModalUpdateStock(false)}>Batal</Button>
          <Button disabled={reason === ''} variant="success" onClick={() => updateStock()}>Ya, Update</Button>
        </Modal.Footer>
      </Modal>
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Stok</h2>
              <h6>Daftar Stok JAA Alkesum</h6>
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
                }}
                placeholder="Cari produk"
              />
            </Form.Group>
          </div>
          <div class="row mt-4">
            <div className="col-lg-12 col-md-6 mb-md-0 mb-4">
              <div className="card">
                <div className="card-header pb-0">
                  <div className="row">
                    <div className="col-lg-6 col-7">
                      <h6>{`Total Data: ${stock.length}`}</h6>
                    </div>
                  </div>
                </div>

                <div className="card-body px-0 pb-2">
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Produk</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ textAlign: 'center' }}>Jumlah Stock</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style={{ textAlign: 'center' }}>Update Terakhir</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {stock?.map((item, index) => {
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
                                    <h6 className="mb-0 text-sm">{item?.product_name}</h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="ps-3 py-1">
                                  <div className="d-flex flex-column">
                                    <h6 className="mb-0 text-sm" style={{ textAlign: 'center' }}>{item?.qty}</h6>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="ps-3 py-1">
                                  <div className="d-flex flex-column">
                                    <h6 className="mb-0 text-sm" style={{ textAlign: 'center' }}>{item?.latest_update}</h6>
                                    <span style={{alignSelf: 'center', fontSize: 11}}>{`Last Update ${item?.updated_at} (${item?.updated_by ?? '-'})`}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                  <Button
                                    style={{ width: '60%', marginTop: 10 }}
                                    onClick={() => {
                                      setSelectedProduct(item)
                                      setModalUpdateStock(true)
                                    }}
                                  >Update Stok</Button>
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
        </div>
    </div>
  )
}

export default Stock