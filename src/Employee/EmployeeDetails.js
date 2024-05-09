import { useEffect, useState } from "react"
import SideNavBar from "../Components/SideNavBar"
import TopNavBar from "../Components/TopNavBar"
import { Button, CloseButton, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { useParams } from "react-router"
import { collection, getDoc, getDocs, query, where, doc, updateDoc } from "@firebase/firestore"
import { db } from "../Config/FirebaseConfig"
import { EMPLOYEE_COLLECTION } from "../Utils/DataUtils"
import { useNavigate } from 'react-router-dom'
import { addLog } from '../Utils/Utils'
import moment from 'moment/moment'
import Constant from '../Utils/Constants'


const EmployeeDetail = () => {

    const { employeeId } = useParams()
    const navigate = useNavigate()

    

    const [employeeData, setEmployeeData] = useState()
    const [employeeName, setEmployeeName] = useState('')
    const [employeeRole, setEmployeeRole] = useState('')
    const [employeeStatus, setEmployeeStatus] = useState('')    
    const [employeeContact, setEmployeeContact] = useState('')
    

    const [showModal, setShowModal] = useState(false)
    const [isLoading, setIsLoading] = useState()

    const [employeeDetail, setEmployeeDetail] = useState()
    const [isEdit, setIsEdit] = useState(false)


    const [formData, setFormData] = useState({})
    const getEmployeeDetail = async (employee_id) => {
        setIsLoading(true)
        console.log('employeeId', employee_id)

   

        const q = query(collection(db, EMPLOYEE_COLLECTION)
            , where('employeeId', '==', employee_id))
        await getDocs(q)
            .then((res) => {
                if (res?.docs?.length > 0) {
                    const resultHolder = res.docs?.map((doc) => ({ id: doc?.id, ...doc?.data() }))[0]
                    setEmployeeData(resultHolder)
                }
            })
            .catch((err) => {
                console.log('ERR', err)
            })
    }

    useEffect(() => {
        if (Boolean(employeeId)) {
            getEmployeeDetail(employeeId)
        } else {
            alert('KARYAWAN TIDAK VALID')
        }
        setIsLoading(false)
    }, [])

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prevState => ({
    //         ...prevState,
    //         [name]: value
    //     }));
    // };

    const validation = () => {
        setShowModal(true)
    }

    const summaryItem = (title, value) => {
        return (
            <div className='mb-2'>
                <span style={{ fontWeight: 'bold' }}>{title}</span><br />
                <span style={{ margin: '10px' }}>{value}</span>
            </div>
        )
    }

    const loadDataToForm = (data) => {
        setEmployeeName(data?.name)
        setEmployeeRole(data?.role)
        setEmployeeStatus(data?.status)
        setEmployeeContact(data?.contact)
    }

    const updateDataEmployee = async () => {
        setIsLoading(true)
        const newEmployeeData = {
            name: employeeName,
            role: employeeRole,
            status: employeeStatus,
            contact: employeeContact,
            updated_at: moment(new Date).toISOString(),
            employeeId: employeeData?.employeeId,
            updated_at: moment().format('DD/MMM/YYYY hh:mm')
        }
        const oldContactDoc = doc(db, EMPLOYEE_COLLECTION, employeeData.employeeId)
        updateDoc(oldContactDoc, newEmployeeData)
            .then(() => {
                setIsLoading(false)
                setShowModal(false)
                addLog('UPDATE CONTACT DATA', `${localStorage.getItem(Constant.USERNAME)} update contact ${employeeName}, from ${JSON.stringify(employeeData)} to ${JSON.stringify({
                    name: employeeName,
                    role: employeeRole,
                    status: employeeStatus,
                    contact: employeeContact,
                })}`)
                navigate('/contact')
            })
    }



    return (
        <div>
            <Modal show={showModal} onHide={() => setShowModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title>
                        Ubah Data Customer
                    </Modal.Title>
                    <CloseButton onClick={() => setShowModal(false)} />
                </Modal.Header>
                <Modal.Body>
                    {summaryItem('Nama karyawan', employeeName)}
                    {summaryItem('Role Karyawan', employeeRole)}
                    {summaryItem('Status Karyawan', employeeStatus)}
                    {summaryItem('kontak Karyawan', employeeContact)}
                </Modal.Body>
                <Modal.Footer>
                    <p style={{ width: '100%', textAlign: 'center' }}>Apakah data yang dimasukkan sudah benar?</p>
                    <Button variant="danger" onClick={() => setShowModal(false)}>Batal</Button>
                    <Button variant="success" onClick={() => { updateDataEmployee() }}>Ya, Ubah</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={isLoading} centered>

                <Modal.Body backdrop={'false'} show={true} onHide={() => setShowModal(false)}
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
            <SideNavBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <TopNavBar />
                <div className="container-fluid py-4">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div className="col-lg-6 col-md-3 mb-md-0 mb-4">
                            <h2>{employeeData?.employeeName}</h2>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <Form>
                            <Row>
                                {/* NAME */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='name'>
                                    <Form.Label>Nama karyawan</Form.Label>
                                    {isEdit ?
                                        <Form.Control
                                            // isInvalid={errorName}
                                            type="input"
                                            name='name'
                                            value={employeeName}
                                            onChange={(e) => {
                                                setEmployeeName(e.target.value)
                                            }}
                                            placeholder="Masukan Nama Karyawan"
                                        />
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{employeeData?.employeeName}</h4>
                                    }

                                </Form.Group>
                                   {/* ROLE */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='role'>
                                <Form.Label>Role Karyawan</Form.Label>
                                {isEdit ?
                                    <Form.Select
                                        name='role'
                                        value={employeeRole}
                                        onChange={(e) => {
                                            setEmployeeRole(e.target.value)
                                        }}
                                    >
                                        <option value="">Pilih Role Karyawan</option>
                                        <option value="gudang">Gudang</option>
                                        <option value="sales">Sales</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </Form.Select>
                                    :
                                    <h4 style={{ marginTop: -10, marginBottom: -10 }}>{employeeData?.employeeRole}</h4>
                                }
                            </Form.Group>

                            </Row>

                            <Row>
                                {/* STATUS */}
                                <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='status'>
                            <Form.Label>Status Karyawan</Form.Label>
                            {isEdit ?
                                <>
                                    <Form.Check
                                        type="radio"
                                        label="Active"
                                        name="status"
                                        id="active"
                                        value="active"
                                        checked={employeeStatus === 'active'}
                                        onChange={(e) => {
                                            setEmployeeStatus(e.target.value)
                                        }}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Inactive"
                                        name="status"
                                        id="inactive"
                                        value="inactive"
                                        checked={employeeStatus === 'inactive'}
                                        onChange={(e) => {
                                            setEmployeeStatus(e.target.value)
                                        }}
                                    />
                                </>
                                :
                                <h4 style={{ marginTop: -10, marginBottom: -10 }}>{employeeData?.employeeStatus}</h4>
                            }
                        </Form.Group>


                                    {/* KONTAK */}
                                    <Form.Group className="col-lg-6 col-md-3" style={{ marginBottom: 20 }} controlId='contact'>
                                    <Form.Label>Kontak Karyawan</Form.Label>
                                    {isEdit ?
                                        <Form.Control
                                            type="number" // Change type to "number"
                                            name='contact'
                                            value={employeeContact}
                                            onChange={(e) => {
                                                setEmployeeContact(e.target.value)
                                            }}
                                            placeholder="Masukan Kontak Karyawan"
                                        />
                                        :
                                        <h4 style={{ marginTop: -10, marginBottom: -10 }}>{employeeData?.employeeContact}</h4>
                                    }
                                </Form.Group>

                                </Row>


                            <div className="col-lg-8 col-md-3 my-4" style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                                <Button
                                    variant='light'
                                    style={{ width: '25%', alignSelf: 'flex-start' }}
                                    onClick={() => {
                                        isEdit ? setIsEdit(false) : navigate(-1)
                                    }}
                                >{isEdit ? 'Batal' : 'Kembali'}</Button>
                                <Button
                                    variant='success'
                                    className='mx-2'
                                    style={{ width: '25%', alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        if (isEdit) {
                                            validation()
                                        } else {
                                            loadDataToForm(employeeData)
                                            setIsEdit(true)
                                        }
                                    }}
                                >{isEdit ? 'Simpan' : 'Edit Data Contact'}</Button>
                                <Button
                                    style={{ width: '25%', alignSelf: 'flex-end', visibility: isEdit ? 'hidden' : 'visible' }}
                                    onClick={() => {
                                        navigate(`/employee/detail/${employeeId}`)
                                    }}
                                >{'Lihat Contact'}</Button>
                            </div>
                        </Form>
                    </div>

                    {/* <div class="row mt-4">
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
                                                <tr key={item?.id}>
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
                                                                <h6 style={{ cursor: 'pointer' }} className="mb-0 text-sm">{item?.order_number}</h6>
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
                                                                <h6 className="mb-0 text-sm">{item?.status ? 'Aktif' : 'Non-Aktif'}</h6>
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
                                                                <h6 className="mb-0 text-sm">{`Rp${item.total_bill}`}</h6>
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
                    </div> */}
                </div>
            </main>
        </div>
    )
}

export default EmployeeDetail