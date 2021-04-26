import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import Checkbox from 'rc-checkbox'
import 'rc-checkbox/assets/index.css'

// Actions
import { saveCurrentModal } from '../../actions/shared'
Modal.setAppElement('#root')

class FILWalletWarningModal extends Component {

    state = {
        terms: false
    }


    handleTermsChange = (e) => {
        this.setState({ terms: !this.state.terms })
    }

    handleConfirmBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_NEW_PASSWORD'))
    }


    render() {
        const { isOpen, toggleModal, } = this.props
        const { terms } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_INTRO')}
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

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title">Warning</div>
                    <div style={{ margin: '12px 0px' }}>
                        <div style={{ marginTop: 0 }} className="terms_text">1. We do not store your private keys and/or seed word on this web wallet. You are entirely responsible for your funds and your own security.</div>
                        <div className="terms_text">2. Please make sure to keep backups of your private keys or seed words, do not give them to anyone. We cannot recover your funds if you lose your backups.</div>
                        <div className="terms_text">3. Please make sure to keep an updated antivirus and operating system. Prevent phishing and other possible attacks.</div>
                        <div className="terms_text">4. If you use seed words to import your wallet, please make sure it is absolutely correct. A slight difference may result in a different address.</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ marginRight: 10 }}>
                            <input style={{ height: 24, width: 24, marginTop: 4, WebkitAppearance:'auto' }} type="checkbox" onChange={this.handleTermsChange} checked={terms} />
                        </div>
                        <div>I've read and agree to Filecoin Loans wallet Agreement.</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
                        <button disabled={!terms} onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg">Confirm</button>
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

export default connect(mapStateToProps)(FILWalletWarningModal)