import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import FIL from '../../crypto/FIL'

// Actions
import { savePendingTx, saveTempMnemonic } from '../../actions/filecoin_wallet'
import { removePrepareTx } from '../../actions/prepareTx'

Modal.setAppElement('#root')

class FILWalletConfirmTxModal extends Component {

    state = {
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: 'Invalid password',
        txState: 0,
        txHash: ''
    }

    componentDidMount() {

    }

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleConfirmBtn = async (e) => {
        console.log('CONFIRM_BTN')
        e.preventDefault()
        const { shared, filecoin_wallet, prepareTx, dispatch } = this.props
        const { password } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true })
            return
        }

        this.setState({ txState: 1 })

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        const tx = await filecoin.send(prepareTx?.address, prepareTx?.amount, wallet?.payload?.private_base64, shared?.filNetwork)
        console.log(tx)

        if (tx?.status !== 'OK') {
            this.setState({ txState: 3 })
            return
        }

        const txData = { tx: { [tx?.payload.CID['/']]: { ...tx?.payload } }, network: shared?.filNetwork }
        dispatch(savePendingTx(txData))
        dispatch(removePrepareTx())
        this.setState({ txState: 2, txHash: tx?.payload.CID['/'] })
    }


    render() {
        const { isOpen, toggleModal, shared, filecoin_wallet, prepareTx } = this.props
        const { txState, password, passwordIsInvalid, passwordErrorMsg, txHash } = this.state
        const explorer = shared?.filNetwork === 'mainnet'
            ? `https://filfox.info/en/message/${txHash}`
            : `https://calibration.filscan.io/#/tipset/message-detail?cid=${txHash}`


        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => txState == 0 ? toggleModal('FIL_WALLET_SEND') : toggleModal('FIL_WALLET_DASHBOARD')}
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
                    {
                        txState == 0 &&
                        <Fragment>
                            <div className="modal-title mt-4 text-center">CONFIRM TRANSACTION</div>

                            <div className="mt-5" style={{ fontWeight: '600' }}>
                                Available Balance: <span>{parseFloat(filecoin_wallet?.balance[shared?.filNetwork]).toFixed(2)} FIL</span>
                            </div>

                            <div className="mt-4">
                                <div>
                                    <label className="form-label">Send to:</label>
                                    <input readOnly={true} value={prepareTx?.address} placeholder="FIL Address" className="form-control" type="text" />
                                </div>
                                <div className="mt-4">
                                    <label className="form-label">Amount:</label>
                                    <input readOnly={true} value={prepareTx?.amount} placeholder="FIL Amount" className="form-control" type="text" />
                                </div>
                            </div>
                            <div className="mt-4" style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                <label className="form-label">Enter your password to confirm:</label>
                                <div className="input-group">
                                    <input value={password} onChange={this.handlePasswordChange} placeholder="Password" className={passwordIsInvalid ? "form-control is-invalid" : "form-control"} type="password" />
                                    <div className="invalid-feedback">
                                        {passwordErrorMsg}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 mb-3">
                                <button onClick={this.handleConfirmBtn} disabled={!password} className="btn btn_blue btn_lg" style={{ width: '100%' }}>Confirm</button>
                            </div>
                        </Fragment>
                    }

                    {
                        txState == 1 &&
                        <Fragment>
                            <div style={{ padding: '100px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5 }}>Sending {prepareTx?.amount} FIL to</div>
                                <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}>{prepareTx?.address}</div>
                            </div>
                        </Fragment>
                    }

                    {
                        txState == 2 &&
                        <Fragment>
                            <div style={{ padding: '100px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Transaction Submitted</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>

                                <button style={{ width: '100%' }} onClick={() => toggleModal(false)} className="btn btn_blue btn_lg mt-4">
                                    Close
                                </button>
                            </div>
                        </Fragment>
                    }


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

function mapStateToProps({ shared, filecoin_wallet, prepareTx }) {
    return {
        shared,
        filecoin_wallet,
        prepareTx
    }
}

export default connect(mapStateToProps)(FILWalletConfirmTxModal)