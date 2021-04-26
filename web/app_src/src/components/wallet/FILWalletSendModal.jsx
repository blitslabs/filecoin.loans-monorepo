import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import FIL from '../../crypto/FIL'

// Actions
import { saveCurrentModal } from '../../actions/shared'
import { savePrepareTx } from '../../actions/prepareTx'

Modal.setAppElement('#root')

class FILWalletSendModal extends Component {

    state = {
        address: '',
        addressIsInvalid: false,
        addressErrorMsg: 'Enter a valid FIL address',
        amount: '',
        amountIsInvalid: false,
        amountErrorMsg: 'Enter a valid amount',
        
    }

    componentDidMount() {

    }

    handleAddressChange = (e) => {
        const address = e.target.value
        this.setState({ address })

        if (!FIL.isValidAddress(address)) {     
            this.setState({ addressIsInvalid: true, })
            return
        }

        this.setState({ addressIsInvalid: false })
    }

    handleAmountChange = (e) => {
        const amount = e.target.value
        if (!(amount === '' || (/^\d*\.?\d*$/).test(amount))) return
        this.setState({ amount })
    }

    handleContinueBtn = (e) => {
        e.preventDefault()
        console.log('test')
        const { dispatch } = this.props
        const { address, amount } = this.state
        dispatch(savePrepareTx({ address, amount }))
        dispatch(saveCurrentModal('FIL_WALLET_CONFIRM_TX'))
    }

    render() {
        const { isOpen, toggleModal, shared, filecoin_wallet } = this.props
        const {
            address, amount, addressIsInvalid, amountIsInvalid,
            addressErrorMsg, amountErrorMsg
        } = this.state

        const disableContinueBtn = (amountIsInvalid || addressIsInvalid || !amount || !address) ? true : false

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
                    <div className="modal-title mt-4 text-center">SEND FIL</div>

                    <div className="mt-5" style={{ fontWeight: '600' }}>
                        Available Balance: <span>{parseFloat(filecoin_wallet?.balance[shared?.filNetwork]).toFixed(2)} FIL</span>
                    </div>

                    <div className="mt-4">

                        <label className="form-label">Send to:</label>
                        <div className="input-group">
                            <input onChange={this.handleAddressChange} value={address} placeholder="FIL Address" className={addressIsInvalid ? "form-control is-invalid" : "form-control"} type="text" />
                            <div className="invalid-feedback">
                                {addressErrorMsg}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="form-label">Amount:</label>
                            <div className="input-group">
                                <input onChange={this.handleAmountChange} value={amount} placeholder="FIL Amount" className={amountIsInvalid ? "form-control is-invalid" : "form-control"} type="text" />
                                <div className="invalid-feedback">
                                    {amountErrorMsg}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 mb-3">
                        <button onClick={this.handleContinueBtn} disabled={disableContinueBtn} className="btn btn_blue btn_lg" style={{ width: '100%' }}>Next</button>
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

export default connect(mapStateToProps)(FILWalletSendModal)