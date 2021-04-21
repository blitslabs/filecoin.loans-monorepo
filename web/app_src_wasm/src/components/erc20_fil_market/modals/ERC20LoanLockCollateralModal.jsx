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
import { confirmPaybackPaymentChannel, confirmPaybackVoucher } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20LoanLockCollateralModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
        paybackLoading: false,
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: '',
        repayAmount: 0
    }

    async componentDidMount() {
        const { loanDetails } = this.props
        const interestAmountPeYear = BigNumber(loanDetails?.collateralLock?.interestRate).multipliedBy(loanDetails?.collateralLock?.principalAmount)
        const loanExpirationPeriod = BigNumber(loanDetails?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3)
        const interestAmountPeriod = interestAmountPeYear.dividedBy(365).multipliedBy(loanExpirationPeriod)
        const repayAmount = interestAmountPeriod.plus(loanDetails?.collateralLock?.principalAmount)

        let modalState = 0
        if (!loanDetails?.filPayback?.state) modalState = 0
        else if (loanDetails?.filPayback?.state == 0) modalState = 3

        this.setState({
            repayAmount: parseFloat(repayAmount).toFixed(8),
            modalState
        })
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, loanDetails, dispatch, loanId } = this.props
        const { password, repayAmount } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ modalState: 1 })

        // Prepare Payment Channel Data
        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : ''

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        const tx = await filecoin.createPaymentChannel(
            filLender, // to
            repayAmount, // amount
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(tx)

        if (tx?.status !== 'OK') {
            this.setState({ modalState: 0 })
            return
        }

        const paymentChannelId = tx?.payload?.data?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.payload?.data?.ReturnDec?.RobustAddress

        const message = {
            loanId: loanId,
            contractLoanId: loanDetails?.collateralLock?.contractLoanId,
            erc20CollateralLock: loanDetails?.collateralLock?.collateralLockContractAddress,
            CID: tx?.payload?.CID,
            paymentChannelId,
            paymentChannelAddress,
            filLender,
            filBorrower: filecoin_wallet?.public_key?.[shared?.filNetwork],
            secretHashB1: loanDetails?.collateralLock?.secretHashB1,
            repayAmount,
            network: shared?.filNetwork,
            collateralNetwork: loanDetails?.collateralLock?.networkId
        }

        const signature = FIL.signMessage(JSON.stringify(message), wallet?.payload?.private_base64)

        console.log('message: ', message)
        console.log('signature: ', signature)

        this.confirmOpInterval = setInterval(async () => {
            confirmPaybackPaymentChannel({ assetType: 'FIL', message, signature })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Save Tx
                        dispatch(saveTx({
                            receipt: tx?.payload,
                            txHash: tx?.payload?.CID['/'],
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Create a Payment Channel with ${filLender} to pay back ${repayAmount} FIL`
                        }))

                        // Send Message & signature to API
                        this.setState({ modalState: 2, txHash: tx?.payload.CID['/'], password: '' })
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async (e) => {
        e.preventDefault()

        const { shared, filecoin_wallet, loanDetails, dispatch, loanId } = this.props
        const { password, repayAmount } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ signLoading: true })

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)

        const loanExpiration = BigNumber(loanDetails?.collateralLock?.loanExpiration).minus(259200).toString()

        // Create Voucher with TimeLockMax < LoanExpiration
        // TimeLockMax sets a max epoch beyond which the voucher cannot be redeemed
        const signedVoucher = await filecoin.createVoucher(
            loanDetails?.filPayback?.paymentChannelId, // paymentChannelId
            '0', // timeLockMin
            loanExpiration, // timeLockMax = loanExpiration
            loanDetails?.collateralLock?.secretHashB1?.replace('0x', ''), // secretHash
            repayAmount, // amount
            '0', // lane
            '0', // voucherNonce
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
            confirmPaybackVoucher({ signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filPayback?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filPayback?.paymentChannelId },
                            txHash: signedVoucher?.payload,
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Signed a Voucher of ${loanDetails?.filPayback?.amount} FIL for Payment Channel ${loanDetails?.filPayback?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 4 })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            signLoading, paybackLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer, repayAmount
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, prices } = this.props
        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : '-'

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
                    <div className="modal-title mt-2 text-center">LOCK COLLATERAL</div>

                    {
                        modalState != 1 &&
                        <Stepper
                            activeStep={modalState}
                            steps={[
                                { title: 'Create Payment Channel' },
                                { title: 'Sign Voucher' },
                            ]}
                        />
                    }

                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are creating a Payment Channel with the Lender to pay off your debt of {parseFloat(repayAmount).toFixed(8)} FIL
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• You are transferring and locking {parseFloat(repayAmount).toFixed(8)} FIl into a Payment Channel contract.</div>
                                <div className="mt-2 ">• Once created, you'll have to create and sign a Voucher to allow the Lender to accept the payback.</div>
                                <div className="mt-2">• When the payback is accepted, the Lender will reveal secretB1, which will allow you to unlock your collateral.</div>
                                <div className="mt-2">• If the Borrower fails to accept the payback before the loan's expiration date, you'll be able to refund the payback and unlock part of your collateral.</div>
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
                                <button onClick={this.handleConfirmBtn} disabled={!password} className="btn btn_blue btn_lg" style={{ width: '100%' }}>Confirm</button>
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
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5, textAlign: 'center' }}>Creating a Payment Channel of {parseFloat(repayAmount).toFixed(8)} FIL with</div>
                                <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}>Lender {filLender}</div>
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
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have crated a Payment Channel with the Lender, and now you need to create a voucher to complete the payback process.</div>
                                <button style={{ width: '100%' }} onClick={() => toggleModal(false)} className="btn btn_blue btn_lg mt-4">
                                    Next
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 3 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are signing a FIL Voucher to allow the Lender to redeem the payback.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div className="mt-2 ">• The Lender needs a signed voucher to withdraw funds from the FIL Payment Channel.</div>
                                <div className="mt-2">• The Voucher requires the Lender to reveal his secretB1 in order to be redeemed.</div>
                                <div className="mt-2">• The secretB1 will allow you to unlock your collateral.</div>
                            </div>

                            <div className="mt-4">
                                <div>Lender's HashB1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.collateralLock?.secretHashB1}</div>
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
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have signed a voucher to allow the Lender to accept the loan's payback. When the Lender redeems the voucher, the secretB1 will be revealed, which will allow you to unlock your collateral. If the Lender fails to redeem the voucher before the loan's expiration date, then you will be able to refund the payback and unlock part of your collateral.</div>
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

export default connect(mapStateToProps)(ERC20LoanLockCollateralModal)