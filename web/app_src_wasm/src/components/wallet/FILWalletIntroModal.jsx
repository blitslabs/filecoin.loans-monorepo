import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Actions
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletIntroModal extends Component {
    
    handleCreateBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_WARNING'))
    }

    handleImportBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_WARNING'))
    }
    
    render() {
        const { isOpen, toggleModal, } = this.props

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', padding: '24px', height: '100%' }}>
                    <div className="modal-title">Filecoin Wallet</div>
                    <div style={{ margin: '40px 0px' }}>
                        <img style={{ height: 150 }} src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} alt="" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '0px 12px 0px 12px' }}>
                        <button onClick={this.handleCreateBtn} className="btn btn_blue btn_lg">Create Wallet</button>
                        <button onClick={this.handleImportBtn} style={{ marginTop: 10 }} className="btn btn_white btn_lg">Import Wallet</button>
                    </div>
                </div>
            </Modal>
        )
    }
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '15px',
        maxHeight: '95vh',
        minWidth: '418px',
        width: '425px',
        height: '550px',
        maxWidth: '100%',
        padding: '0px'
    },
    overlay: {
        backgroundColor: 'rgb(0 0 0 / 60%)'
    },
    parent: {
        overflow: 'hidden',
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
}

function mapStateToProps({ shared, settings, }) {
    return {
        shared,
        settings,

    }
}

export default connect(mapStateToProps)(FILWalletIntroModal)