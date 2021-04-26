import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import Stepper from 'react-stepper-horizontal'

// Libraries
import FIL from '../../../crypto/FIL'
import BigNumber from 'bignumber.js'
import ETH from '../../../crypto/ETH'
import ERC20CollateralLock from '../../../crypto/ERC20CollateralLock'
import Web3 from 'web3'
import { toast } from 'react-toastify'

// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmSignedVoucher } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class FILLoanSignWithdrawVoucherModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: ''
    }

    async componentDidMount() {
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, loanDetails, dispatch, loanId } = this.props
        const { password, ethLender, secretHashB1 } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ signLoading: true })

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        const signedVoucher = await filecoin.createVoucher(
            loanDetails?.filLoan?.paymentChannelId, // paymentChannelId
            '0', // timeLockMin
            '0', // timeLockMax
            loanDetails?.collateralLock?.secretHashA1?.replace('0x', ''), // secretHash
            loanDetails?.filLoan?.principalAmount, // amount
            '0', // lane
            '0', // voucherNonce
            '0', // minSettleHeight
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(signedVoucher)

        if (signedVoucher?.status !== 'OK') {
            toast.error(signedVoucher?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {
            confirmSignedVoucher({ signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filLoan?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        toast.success('Voucher Signed', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filLoan?.paymentChannelId },
                            txHash: signedVoucher?.payload,
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Signed a Voucher of ${loanDetails?.filLoan?.principalAmount} FIL for Payment Channel ${loanDetails?.filLoan?.paymentChannelId}`
                        }))
                        
                        this.setState({ modalState: 1 })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            signLoading, lendLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, prices } = this.props


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

                <div style={{ padding: '24px 48px', height: '100%', }}>
                    <div className="modal-title mt-2 text-center">SIGN FIL VOUCHER</div>


                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are signing a FIL Voucher to allow the Borrower to withdraw the loan's principal.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• The Borrower has linked his collateral to your offer, and you'll now be able to seize part of the collateral in case of default.</div>
                                <div className="mt-2 ">• The Borrower needs a signed voucher to withdraw funds from the FIL Payment Channel.</div>
                                <div className="mt-2">• The Voucher requires the Borrower to reveal his secretA1 in order to be redeemed.</div>
                                <div className="mt-2">• The secretA1 will allow you to seize part of the Borrower's collateral if he fails to pay back the loan.</div>
                            </div>

                            <div className="mt-4">
                                <div>Borrower's HashA1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.collateralLock?.secretHashA1}</div>
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

                            <div className="mt-4 mb-3">
                                <button onClick={this.handleConfirmBtn} disabled={!password || signLoading} className="btn btn_blue btn_lg" style={{ width: '100%' }}>
                                    {
                                        signLoading
                                            ? <span>Signing {this.loadingIndicator}</span>
                                            : 'Sign Voucher'
                                    }
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 1 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Voucher Signed</div>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have signed a voucher to allow the Borrower to withdraw the loan's principal. The Borrower will now be able to withdraw the locked FIL funds and has until the loan expiration date to pay them back.</div>
                                <button style={{ width: '100%' }} onClick={() => toggleModal(false)} className="btn btn_blue btn_lg mt-4">
                                    Close
                                </button>
                            </div>
                        </Fragment>
                    }
                </div>
            </Modal >
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
        width: '520px',
        // height: '680px',
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

function mapStateToProps({ shared, filecoin_wallet, protocolContracts, loanDetails, prices }, ownProps) {

    return {
        prices,
        shared,
        filecoin_wallet,
        protocolContracts,
        loanDetails: loanDetails['FIL'][ownProps?.loanId],
    }
}

export default connect(mapStateToProps)(FILLoanSignWithdrawVoucherModal)