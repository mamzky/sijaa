import React from "react"
import { Modal, Spinner } from "react-bootstrap"

function ModalLoading({ isLoading, onHide }) {
    <Modal show={isLoading} centered>
        <Modal.Body backdrop={'false'} show={isLoading} onHide={onHide}
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
}

export default ModalLoading