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


// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmSignedVoucher } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class FILLoanWithdrawPrincipalModal extends Component {

    state = {
        modalState: 0,
        redeemLoading: false,
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: '',
        secretHashA1: '',
        amount: ''
    }

    async componentDidMount() {
        const { loanDetails } = this.props
        const response = await FIL.decodeVoucher(loanDetails?.filLoan?.signedVoucher)
        this.setState({
            secretHashA1: response.secretHash,
            amount: BigNumber(response.amount).dividedBy(1e18).toString()
        })
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, protocolContracts, loanDetails, dispatch, loanId } = this.props
        const { password, ethLender, secretHashB1 } = this.state
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ redeemLoading: true })

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(collateralLockContract)
        } catch (e) {
            console.log(e)
            return
        }

        const accountLoans = await collateralLock.getAccountLoans(shared?.account)
        
        if(accountLoans?.status !== 'OK') {
            this.setState({redeemLoading: false})
            return
        }

        let userLoansCount = 0
        for (let l of accountLoans?.payload) {
            userLoansCount++
            if(l == loanDetails?.collateralLock?.contractLoanId) break;
        }
        console.log(userLoansCount)

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${userLoansCount}. Contract: ${collateralLockContract}`
        const secretData = await ETH.generateSecret(message)
        // const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        // const response = await filecoin.redeemVoucher(
        //     loanDetails?.filLoan?.paymentChannelId, // paymentChannelId
        //     loanDetails?.filLoan?.signedVoucher, // signedVoucher
        //     secretA1, // secretA1
        //     wallet?.payload?.private_base64, // privateKey
        //     shared?.filNetwork // filecoin network
        // )
        // console.log(signedVoucher)

        // if (response?.status !== 'OK') {
        //     this.setState({ redeemLoading: false })
        //     return
        // }

        // // Save Signed Voucher
        // this.confirmOpInterval = setInterval(async () => {
        //     confirmSignedVoucher({ signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filLoan?.paymentChannelId })
        //         .then((data) => data.json())
        //         .then((res) => {
        //             console.log(res)

        //             if (res.status === 'OK') {
        //                 clearInterval(this.confirmOpInterval)

        //                 // Save Tx
        //                 dispatch(saveTx({
        //                     receipt: { signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filLoan?.paymentChannelId },
        //                     txHash: signedVoucher?.payload,
        //                     from: filecoin_wallet?.public_key?.[shared?.filNetwork],
        //                     summary: `Signed a Voucher of ${loanDetails?.filLoan?.principalAmount} FIL for Payment Channel ${loanDetails?.filLoan?.paymentChannelId}`
        //                 }))
                        
        //                 this.setState({ modalState: 1 })
        //             }
        //         })
        // }, 3000)
    }

    render() {
        const {
            redeemLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer, secretHashA1, amount
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
                    <div className="modal-title mt-2 text-center">WITHDRAW PRINCIPAL</div>


                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are withdrawing the loan's principal ({loanDetails?.filLoan?.principalAmount} FIL). 
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• The Lender has signed a voucher to allow you to withdraw the loan's principal from the FIL Payment Channel.</div>
                                <div className="mt-2 " style={{fontWeight:'bold'}}>• Make sure the voucher amount is correct before redeeming the voucher; otherwise, you'll reveal your preimage (secretA1) and withdraw an incorrect amount.</div>
                                
                            </div>

                            <div className="mt-4">
                                <div>Voucher's Secret Hash</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{`0x${secretHashA1}`}</div>
                            </div>

                            <div className="mt-4">
                                <div>Voucher Amount</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{amount} FIL</div>
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
                                <button onClick={this.handleConfirmBtn} disabled={!password || redeemLoading} className="btn btn_blue btn_lg" style={{ width: '100%' }}>
                                    {
                                        redeemLoading
                                            ? <span>Redeeming {this.loadingIndicator}</span>
                                            : 'Redeem Voucher'
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
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Voucher Redeemed</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have withdrawn the loan's principal and you have until the loan's expiration date to pay back your debt. The Lender will be able to seize part of your collateral in case of default.</div>
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

export default connect(mapStateToProps)(FILLoanWithdrawPrincipalModal)