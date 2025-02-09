import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import { Button, Modal, Form, Spinner } from 'react-bootstrap'
import { db } from '../Config/FirebaseConfig';
import { CUSTOMER_COLLECTION, ORDER_COLLECTION, PRODUCT_COLLECTION } from '../Utils/DataUtils'
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { OnlyDigit } from '../Utils/General'
import { addLog } from '../Utils/Utils';
import Constant from '../Utils/Constants';
import moment from 'moment';
import Select from 'react-select'

function Stock() {

  const productCollectionRef = collection(db, PRODUCT_COLLECTION)
  const customerCollectionRef = collection(db, CUSTOMER_COLLECTION)
  const [loading, setLoading] = useState(false)
  const [stock, setStock] = useState([])
  const [modalUpdateStock, setModalUpdateStock] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [newStock, setNewStock] = useState(0)
  const [reason, setReason] = useState('')
  const [modalRetur, setModalRetur] = useState(false)
  const [customerList, setCustomerList] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [productList, setProductList] = useState([])
  const [productOptions, setProductOptions] = useState([])
  const [qtyRetur, setQtyRetur] = useState('')
  const [disabledRetur, setDisabledRetur] = useState(true)
  const [returReason, setReturReason] = useState('')

  const getStock = async () => {
    const data = await getDocs(productCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setStock(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  useEffect(() => {
    getStock()
    getCustomer()
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


  const getCustomer = async () => {
    const data = await getDocs(customerCollectionRef)
    const sortedData = data?.docs?.map((doc) => ({ id: doc?.id, label: `${doc?.data()?.name}(${doc?.data()?.contact_person})`, value: doc?.data() }))
    if (sortedData?.length > 0) {
      setCustomerList(sortedData?.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at)))
    }
  }

  const getStockByOrder = async (customer_code) => {
    const q = query(collection(db, ORDER_COLLECTION)
      , where('customer_id', '==', customer_code)
      , where('status', '==', 'DELIVERED')
    )
    const querySnapshot = await getDocs(q)
    const result = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    if (!querySnapshot.empty) {
      const mergedData = Object.values(
        result.flatMap(order =>
          order.order_list.map(item => ({
            id: item.id,
            order_number: { number: order.order_number, created_at: order.created_at },
            created_at: order.created_at,
            name: item.name,
            total_qty: item.qty
          }))
        ).reduce((acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = { ...item, order_number: [item.order_number] };
          } else {
            acc[item.id].total_qty += item.total_qty;
            acc[item.id].order_number.push(item.order_number);
          }
          return acc;
        }, {})
      );
      const optionsHolder = mergedData?.map((item) => {
        return {
          id: item?.id,
          label: item?.name,
          value: item
        }
      })
      setProductOptions(optionsHolder)
      console.log('PROD', optionsHolder);

      setProductList(mergedData)
      console.log('RESULT STOCKS', mergedData);
    } else {
      setProductList([])
      console.log('FAILED');
    }
  }

  const proceedRetur = () => {
    console.log(selectedProduct);

    const payload = {
      customer: selectedCustomer?.value ?? null,
      customer_id: selectedCustomer?.value?.customer_code ?? null,
      order_list: [{
        id: selectedProduct?.id,
        name: selectedProduct?.label,
        qty: qtyRetur,
        discount: '0',
        price: '0'
      }],
      order_number: 'RETUR',
      order_date: new Date().toISOString(),
      po_number: 'RETUR',
      notes: returReason,
      type: 'RETUR',
      dp: '0',
      pic: localStorage.getItem(Constant.USERNAME),
      total_bill: '0',
      status: 'RETUR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: localStorage.getItem(Constant.USERNAME)
    }
    submitOrder(payload)
  }

  const submitOrder = async (body) => {
    const orderCollectionRef = collection(db, ORDER_COLLECTION)
    await addDoc(orderCollectionRef, body).then(() => {
      setLoading(false)
      addLog(localStorage.getItem(Constant.USERNAME), `retur item RETUR-${new Date()}`)
      getStock()
      setModalRetur(false)
    })
  }

  useEffect(() => {
    if (selectedCustomer?.value?.customer_code) {
      getStockByOrder(selectedCustomer?.value?.customer_code)
    }
  }, [selectedCustomer])

  useEffect(() => {
    if (Number(qtyRetur) > selectedProduct?.value?.total_qty || qtyRetur === '') {
      setDisabledRetur(true)
    } else {
      setDisabledRetur(false)
    }
  }, [qtyRetur])


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
          <div className="flex col-lg-12 col-md-6 mb-md-0 mb-4">
            <h2>Stok</h2>
            <h6>Daftar Stok JAA Alkesum</h6>
          </div>
        </div>
        <div className="d-flex flex-column justify-content-center">
          <Button variant="danger"
            onClick={() => {
              setModalRetur(true)
            }}
          >Retur Barang</Button>
        </div>
        <div>
          <Form.Group className="col-lg-12 col-md-6" controlId='productName'>
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
                                  <span style={{ alignSelf: 'center', fontSize: 11 }}>{`Last Update ${item?.updated_at} (${item?.updated_by ?? '-'})`}</span>
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
      <Modal show={modalRetur}>
        <Modal.Header>Retur Barang</Modal.Header>
        <Modal.Body>
          <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <Form.Label>Customer</Form.Label>
            <Select
              options={customerList}
              placeholder="Pilih customer"
              onChange={(e) => {
                console.log(e);
                setSelectedCustomer(e)
              }}
              value={selectedCustomer}
            />
          </Form.Group>
          {(productOptions && productOptions?.length > 0) && (
            <>

              <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <Form.Label>Produk</Form.Label>
                <Select
                  options={productOptions}
                  placeholder="Pilih Produk"
                  onChange={(e) => {
                    setSelectedProduct(e)
                  }}
                  value={selectedProduct}
                />
              </Form.Group>
              <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <Form.Label>Jumlah</Form.Label>
                <Form.Control
                  style={{ width: '100%' }}
                  type="input"
                  name='qtyRetur'
                  value={qtyRetur}
                  onChange={(e) => {
                    const onlyDigits = OnlyDigit(e.target.value)
                    setQtyRetur(onlyDigits)
                  }}
                  placeholder="Jumlah"
                />
                <label className='text-danger'>stok saat ini {JSON.stringify(selectedProduct?.value?.total_qty)}</label>
              </Form.Group>
              <Form.Group style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <Form.Label>Alasan</Form.Label>
                <Form.Control
                  style={{ width: '100%' }}
                  type="input"
                  name='returReason'
                  value={returReason}
                  onChange={(e) => {
                    setReturReason(e.target.value)
                  }}
                  placeholder="Alasan"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => {
            setModalRetur(false)
          }}>Tutup</Button>
          <Button variant="success"
            disabled={disabledRetur}
            onClick={() => {
              proceedRetur()
            }}>Proses Retur</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Stock