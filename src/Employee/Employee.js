import React, { useEffect, useState } from 'react'
import SideNavBar from '../Components/SideNavBar'
import TopNavBar from '../Components/TopNavBar'
import CustomTable from '../Components/CustomTable'
import { Button, Form, Modal, CloseButton } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, doc, deleteDoc } from '@firebase/firestore'
import { db } from '../Config/FirebaseConfig'
import { EMPLOYEE_COLLECTION } from '../Utils/DataUtils'
import Constant from '../Utils/Constants';
import { addLog } from '../Utils/Utils';

function Employee() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [loading, setIsLoading] = useState(false)
  const [employee, setEmployee] = useState([])
  const employeeCollectionRef = collection(db, EMPLOYEE_COLLECTION)
  const [employeeData, setEmployeeData] = useState([])
  const [deleteEmployee, setDeleteEmployee] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getListContact = async () => {
    setIsLoading(true)
    await getDocs(employeeCollectionRef)
      .then((res) => {
        const listData = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        setEmployeeData(listData)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    getListContact()
  }, [])

  const getEmployee = async () => {
    const data = await getDocs(employeeCollectionRef)
    const sortedData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setEmployee(sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
  }

  const tampilpopup = () => {
    // Melakukan sesuatu dengan data JSON, misalnya menampilkan di konsol
    setShowModal(true);
    // Jika Anda ingin melakukan sesuatu yang lain dengan data JSON, Anda bisa menambahkan kode di sini
};

  const deletekaryawan = async () => {
    console.log(selectedEmployee);
    const productDoc = doc(db, EMPLOYEE_COLLECTION, selectedEmployee.id);
    await deleteDoc(productDoc).then(() => {
      addLog('DELETE PRODUCT', `${localStorage.getItem(Constant.USERNAME)} deleted product "${selectedEmployee?.employeeName}"`);
      getListContact();
      setShowDeleteModal(false);
      setIsLoading(false);
    });
  };
//   const deletekaryawan = async () => {
//     console.log(selectedEmployee);
//     const productDoc = doc(db, EMPLOYEE_COLLECTION, selectedEmployee.employeeId);
//     await deleteDoc(productDoc).then(() => {
//         addLog('DELETE PRODUCT', `${localStorage.getItem(Constant.USERNAME)} deleted product "${selectedEmployee?.employeeName}"`);
//         getEmployee();
//         setDeleteEmployee(false);
//         setIsLoading(false);
//     });
// };

const handleDeleteClick = (employee) => {
  setSelectedEmployee(employee);
  setShowDeleteModal(true);
};
  

  const searchContact = async (contactName) => {
    const q = query(collection(db, EMPLOYEE_COLLECTION.toString()))
    const querySnapshot = await getDocs(q);
    const result = querySnapshot.docs
      .map(doc => doc.data())
      .filter((e) => e.employeeName.toLowerCase()
        .includes(contactName.toLowerCase())).sort((a, b) => a.qty - b.qty)
    setEmployeeData(result)
  }
   

  return (
    <div>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
        <Modal.Header>
          <Modal.Title>Hapus Karyawan</Modal.Title>
          <CloseButton onClick={() => setShowDeleteModal(false)} />
        </Modal.Header>
        <Modal.Body>
          <div>
            <h3 style={{ marginBottom: 40, textAlign: 'center' }}>{selectedEmployee?.employeeName ?? '-'}</h3>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <p style={{ width: '100%', textAlign: 'center' }}>Apakah Yakin Ingin Menghapus Karyawan?</p>
          <Button variant="danger" onClick={() => setShowDeleteModal(false)}>Batal</Button>
          <Button variant="success" onClick={() => deletekaryawan()}>Ya, Hapus</Button>
        </Modal.Footer>
      </Modal>
      {/* <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Hapus Karyawan
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                <div>
            <h3 style={{ marginBottom: 40, textAlign: 'center' }}>{selectedEmployee?.employeeName ?? '-'}</h3>
               </div>
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah Yakin Ingin Menghapus Karyawan?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => deletekaryawan()}>Ya, Hapus</Button>
                </Modal.Footer>
            </Modal> */}
      <SideNavBar />
      <main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
        <TopNavBar />
        <div class="container-fluid py-4">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
              <h2>Karyawan</h2>
              <h6>Daftar karyawan JAA Alkesum</h6>
            </div>
            <div className="col-lg-8 col-md-3" style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
              <Button style={{ width: '40%', alignSelf: 'flex-end' }}
                onClick={() => {
                  navigate('/employee/new-employee')
                }}
              >+ Tambah karyawan Baru</Button>
            </div>
          </div>

          <div>
            <Form.Group className="col-lg-6 col-md-3" controlId='employeeName'>
            <Form.Control
                isInvalid={false}
                type="input"
                name='employeeName'
                onChange={(e) => {
                  setTimeout(() => {
                    searchContact(e.target.value)
                  }, 500);
                  // setProductName(e.target.value)
                  // setErrorName(isEmpty(e.target.value))
                }}
                placeholder="Cari Karyawan"
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
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Karyawan</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Role Karyawan</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Kontak Karyawan</th>
                      <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Action</th>
                    </tr>
                  </thead>
                  <tbody>

                    {employeeData.map((employee, index) => {
                      return (
                        <tr
                          key={employee.employeeId}
                          onClick={() => {
                            navigate(`/employee/detail/${employee.employeeId}`)
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
                                <h6 className="mb-0 text-sm">{employee.employeeName}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{employee.employeeRole}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                              <div className="ps-3 py-1">
                                  <div className="d-flex flex-column">
                                  {employee.employeeStatus === 'active' ? (
                                    <Button style={{ display: 'flex', flexDirection: 'row', backgroundColor:'green', width:'50%', justifyContent:'center'}}>AKTIF</Button>
                                    ) : (
                                      <Button style={{ display: 'flex', flexDirection: 'row', backgroundColor:'red', width:'50%', justifyContent:'center'}}>NON AKTIF</Button>
                                    )}
                                  </div>
                              </div>
                          </td>
                          <td>
                            <div className="ps-3 py-1">
                              <div className="d-flex flex-column">
                                <h6 className="mb-0 text-sm">{employee.employeeContact}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button
                                style={{ width: '50%', marginTop: 10, justifyContent:'center',zIndex: 20 }}
                                variant="danger"
                                key={employee.employeeId}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick(employee);
                                }}
                              >Hapus</Button>
                                </div>
                              </td>
                              
                        </tr >
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

// 

export default Employee