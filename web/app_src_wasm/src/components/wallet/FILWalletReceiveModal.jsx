import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import QRCode from 'qrcode.react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

// Actions
import { saveTempMnemonic } from '../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletReceiveModal extends Component {

    state = {

    }

    componentDidMount() {

    }

    handleSendBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_SEND'))
    }

    handleReceiveBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_RECEIVE'))
    }


    render() {
        const { isOpen, toggleModal, filecoin_wallet, shared } = this.props

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_DASHBOARD')}
                    style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img
                        src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`}
                    />
                </button>

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title mt-4 text-center">FIL ADDRESS</div>

                    <div className="mt-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="box">
                            <QRCode imageSettings={{ src: `${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`, height: 40, width: 40 }} value={filecoin_wallet?.public_key[shared?.filNetwork]} />
                        </div>
                    </div>
                    <div style={{ fontWeight: 500 }} className="mt-5 text-center">{filecoin_wallet?.public_key[shared?.filNetwork]}</div>
                    <div className="mt-4 mb-4">
                        <CopyToClipboard text={filecoin_wallet?.public_key[shared?.filNetwork]}>
                            <button className="btn btn_white btn_lg" style={{ width: '100%', color: '#0062FF' }}>Copy Address</button>
                        </CopyToClipboard>
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
        width: '485px',
        // height: '650px',
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

function mapStateToProps({ shared, filecoin_wallet, }) {
    return {
        shared,
        filecoin_wallet,

    }
}

export default connect(mapStateToProps)(FILWalletReceiveModal)