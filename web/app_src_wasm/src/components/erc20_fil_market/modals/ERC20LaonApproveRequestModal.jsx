import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import Stepper from 'react-stepper-horizontal'

// Libraries
import FIL from '../../../crypto/FIL'
import BigNumber from 'bignumber.js'
import ETH from '../../../crypto/ETH'
import ERC20Loans from '../../../crypto/ERC20Loans'
import Web3 from 'web3'


// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmERC20LoanOperation, confirmSignUnlockCollateralVoucher } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20LaonApproveRequestModal extends Component {

    state = {
        modalState: 0,
        txLoading: false,
        lendLoading: false,
        secretHashB1: '',
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: ''
    }

    async componentDidMount() {
        const { loanDetails, prices } = this.props
        let modalState = 0
        if(loanDetails?.erc20Loan?.state == 0) modalState = 0
        else if (loanDetails?.erc20Loan?.state == 1) modalState = 3
        this.setState({ modalState })
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleApproveBtn = async (e) => {
        e.preventDefault()
        const { loanDetails, loanId, shared, protocolContracts, dispatch } = this.props
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ modalState: 1 })

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(erc20LoansContract)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 0 })
            return
        }

        const response = await erc20Loans.approveRequest(
            loanDetails?.erc20Loan?.contractLoanId,
            loanDetails?.filCollateral?.ethBorrower,
            loanDetails?.filCollateral?.filBorrower,
            loanDetails?.filCollateral?.secretHashA1,
            loanDetails?.filCollateral?.paymentChannelId,
            loanDetails?.filCollateral?.amount
        )

        console.log(response)

        if (response?.status !== 'OK') {
            this.setState({ modalState: 0 })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Accept Loan Request with ${loanDetails?.filCollateral?.amount} FIL as collateral`,
            networkId: shared?.networkId
        }))

        const params = {
            operation: 'ApproveRequest',
            networkId: shared?.networkId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        this.setState({ modalState: 2 })
                        return
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async (e) => {
        e.preventDefault()

        const { shared, filecoin_wallet, loanDetails, dispatch, } = this.props
        const { password } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ signLoading: true })

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)

        // TODO
        // Add Min/Max Redeem time
        const signedVoucher = await filecoin.createVoucher(
            loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
            '0', // timeLockMin
            '0', // timeLockMax = loanExpiration?
            loanDetails?.erc20Loan?.secretHashB1?.replace('0x', ''), // secretHash
            '0', // amount
            '0', // lane
            '1', // voucherNonce
            '0', // minSettleHeight
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )

        if (signedVoucher?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {
            confirmSignUnlockCollateralVoucher({ signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId },
                            txHash: signedVoucher?.payload,
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Signed a Voucher of ${loanDetails?.filCollateral?.amount} FIL for Payment Channel ${loanDetails?.filCollateral?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 4 })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            txLoading, modalState,
            explorer, password, passwordIsInvalid, passwordErrorMsg, signLoading
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, prices } = this.props


        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                {
                    modalState == 1 &&
                    <button
                        onClick={() => this.setState({ modalState: 0 })}
                        style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px', fontWeight: 500 }}
                    >
                        <img
                            src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`}
                        />
                    </button>
                }

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 48px', height: '100%', }}>
                    <div className="modal-title mt-2 text-center">APPROVE REQUEST</div>

                    {
                        modalState != 1 && modalState != 4 &&
                        <Stepper
                            activeStep={modalState}
                            steps={[
                                { title: 'Accept Request' },
                                { title: 'Sign Voucher' },

                            ]}
                        />
                    }


                    {
                        modalState == 0 &&
                        <Fragment>

                            <div className="mt-4">
                                The Borrower has locked collateral as part of the loan request process.
                            </div>
                            <div className="mt-2">
                                You need to approve the request to enable the Borrower to withdraw the loan's principal.
                            </div>
                            <div className="mt-2">
                                Click "Accept Request" and then "Confirm" on the Metamask-popup to complete this action.
                            </div>

                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                You are accepting a ruquest:
                            </div>

                            <div className="mt-4">
                                <div>Borrower's FIL Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filCollateral?.filBorrower}</div>
                            </div>

                            <div className="mt-4">
                                <div>Borrower's ETH Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filCollateral?.ethBorrower}</div>
                            </div>

                            <div className="mt-4">
                                <div>Secret Hash A1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.filCollateral?.secretHashA1}</div>
                            </div>

                            <div className="mt-4">
                                <div>Locked Collateral</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filCollateral?.amount} FIL</div>
                            </div>

                            <div className="mt-4">
                                <div>Payment Channel Address</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filCollateral?.paymentChannelAddress}</div>
                            </div>

                            <div className="mt-5" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <div style={{ flex: 1 }}>
                                    <button disabled={txLoading} onClick={this.handleApproveBtn} className="btn btn_blue btn_lg">
                                        {
                                            txLoading
                                                ? <span>Accepting Offer {this.loadingIndicator}</span>
                                                : 'Accept Offer'
                                        }
                                    </button>
                                </div>

                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 1 &&
                        <Fragment>
                            <div style={{ padding: '60px 24px 30px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5 }}>Accepting Loan Request </div>

                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 2 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Transaction Submitted</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have accepted the Borrower's request. Now you need to create and sign a FIL voucher to allow the Borrower to unlock his collateral if the successfully repays the loan before the expiration date.</div>
                                <button style={{ width: '100%' }} onClick={() => this.setState({ modalState: 3 })} className="btn btn_blue btn_lg mt-4">
                                    Next
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 3 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are signing a FIL Voucher to enable the Borrower to unlock his collateral only if the successfully repays the loan before expiration date.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div className="mt-2 ">• The Borrower needs a signed voucher to unlock his collateral when he repays the loan.</div>
                                <div className="mt-2">• The Voucher will only be redeemable when you accept the Borrower's payback (reveal secretB1).</div>
                                <div className="mt-2">• The Borrower will not be able to redeem the voucher (and unlock his collateral) if he fails to repay the loan on time and you don't accept the payback.</div>
                            </div>

                            <div className="mt-4">
                                <div>Voucher's secret hash (secretB1)</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.erc20Loan?.secretHashB1}</div>
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
                                <button onClick={this.handleSignVoucherBtn} disabled={!password || signLoading} className="btn btn_blue btn_lg" style={{ width: '100%' }}>
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
                        modalState == 4 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Voucher Signed</div>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have signed a voucher as part of the approval process. The Borrower is now able to withdraw the principal and he has until the expiration date to pay back the loan; otherwise, you'll be able to seize part of his collateral.</div>
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
        width: '520px',
        maxWidth: '100%',
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
        loanDetails: loanDetails['ERC20'][ownProps?.loanId],
    }
}

export default connect(mapStateToProps)(ERC20LaonApproveRequestModal)