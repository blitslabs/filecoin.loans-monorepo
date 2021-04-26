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
import { toast } from 'react-toastify'

// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmFILCollateralLock, confirmSignSeizeCollateralVoucher } from '../../../utils/api'

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
        repayAmount: 0,
        secretHashA1: ''
    }

    async componentDidMount() {
        const { loanDetails, prices } = this.props
        const lockAmount = parseFloat(BigNumber(loanDetails?.erc20Loan?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5)).toFixed(8)
        let modalState = 0
        if (!loanDetails?.filCollateral?.state) modalState = 0
        else if (loanDetails?.filCollateral?.state == 0) modalState = 4

        this.setState({
            lockAmount,
            modalState
        })
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleSignBtn = async (e) => {
        e.preventDefault()
        const { protocolContracts, shared } = this.props
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ signLoading: true })

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(erc20LoansContract)
        } catch (e) {
            console.log(e)
            this.setState({ signLoading: false })
            return
        }

        const account = (await ETH.getAccount())?.payload
        const userLoansCount = await erc20Loans.getUserLoansCount(account)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${erc20LoansContract}`
        const secretData = await ETH.generateSecret(message)
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            ethBorrower: account,
            secretHashA1: secretData?.payload?.secretHash,
            secretA1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })
    }

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, loanDetails, dispatch, loanId, prices } = this.props
        const { password, lockAmount, secretHashA1, ethBorrower } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ modalState: 2 })

        // Prepare Payment Channel Data
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : ''

        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        const tx = await filecoin.createPaymentChannel(
            filLender, // to
            lockAmount, // amount
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(tx)

        if (tx?.status !== 'OK') {
            toast.error(tx?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ modalState: 1 })
            return
        }

        const paymentChannelId = tx?.payload?.data?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.payload?.data?.ReturnDec?.RobustAddress

        const message = {
            loanId: loanId,
            contractLoanId: loanDetails?.erc20Loan?.contractLoanId,
            erc20LoansContract: loanDetails?.erc20Loan?.erc20LoansContract,
            CID: tx?.payload?.CID,
            paymentChannelId,
            paymentChannelAddress,
            ethBorrower,
            ethLender: loanDetails?.erc20Loan?.lender,
            filLender,
            filBorrower: filecoin_wallet?.public_key?.[shared?.filNetwork],
            secretHashA1,
            lockAmount,
            network: shared?.filNetwork,
            erc20LoansNetworkId: loanDetails?.erc20Loan?.networkId
        }

        const signature = FIL.signMessage(JSON.stringify(message), wallet?.payload?.private_base64)

        console.log('message: ', message)
        console.log('signature: ', signature)

        this.confirmOpInterval = setInterval(async () => {
            confirmFILCollateralLock({ message, signature })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        toast.success('Payment Channel Created', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });

                        // Save Tx
                        dispatch(saveTx({
                            receipt: tx?.payload,
                            txHash: tx?.payload?.CID['/'],
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Create a Payment Channel with ${filLender} to lock ${lockAmount} FIL as collateral`
                        }))

                        // Send Message & signature to API
                        this.setState({ modalState: 3, txHash: tx?.payload.CID['/'], password: '' })
                    }
                })
        }, 3000)
    }

    handleSignVoucherBtn = async (e) => {
        e.preventDefault()

        const { shared, filecoin_wallet, loanDetails, dispatch, loanId } = this.props
        const { password, lockAmount,} = this.state

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
        const loanExpiration = BigNumber(loanDetails?.collateralLock?.loanExpiration).minus(259200).toString()

        // Create Voucher with TimeLockMax < LoanExpiration
        // TimeLockMax sets a max epoch beyond which the voucher cannot be redeemed
        const signedVoucher = await filecoin.createVoucher(
            loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId
            '0', // timeLockMin
            '0', // timeLockMax = loanExpiration?
            loanDetails?.filCollateral?.secretHashA1?.replace('0x', ''), // secretHash
            lockAmount, // amount
            '0', // lane
            '0', // voucherNonce
            '0', // minSettleHeight
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )

        if (signedVoucher?.status !== 'OK') {
            toast.error(signedVoucher?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ signLoading: false })
            return
        }

        // Save Signed Voucher
        this.confirmOpInterval = setInterval(async () => {
            confirmSignSeizeCollateralVoucher({ signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        toast.success('Voucher Signed', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { signedVoucher: signedVoucher?.payload, paymentChannelId: loanDetails?.filCollateral?.paymentChannelId },
                            txHash: signedVoucher?.payload,
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Signed a Voucher of ${loanDetails?.filCollateral?.amount} FIL for Payment Channel ${loanDetails?.filCollateral?.paymentChannelId}`
                        }))

                        this.setState({ modalState: 5 })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            signLoading, paybackLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer, repayAmount, lockAmount, secretHashA1
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, loanAssets, prices } = this.props

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const lender = loanDetails?.erc20Loan?.lender && loanDetails?.erc20Loan?.lender != emptyAddress ? loanDetails?.erc20Loan.lender : '-'
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : '-'
        const asset = loanAssets?.[loanDetails?.erc20Loan?.token]

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
                        modalState != 2 && modalState != 3 &&
                        <Stepper
                            activeStep={modalState}
                            steps={[
                                { title: 'Sign Message' },
                                { title: 'Create Payment Channel' },
                                { title: 'Sign Voucher' },
                            ]}
                        />
                    }

                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16 }}>
                                You are borrowing {loanDetails?.erc20Loan?.principalAmount} {asset?.symbol} from:
                            </div>

                            <div className="mt-4">
                                <div>Lender's FIL Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{filLender}</div>
                            </div>

                            <div className="mt-4">
                                <div>Lender's ETH Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{lender}</div>
                            </div>

                            <div className="mt-4">
                                <div>Principal</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{loanDetails?.erc20Loan?.principalAmount}</div>
                            </div>

                            <div className="mt-4">
                                <div>Collateralization Ratio</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>150%</div>
                            </div>


                            <div className="mt-4">
                                To continue click `Sign` to generate the secret required to seize the borrower's collateral in case of default.
                            </div>

                            <div className="mt-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <div style={{ flex: 1 }}>
                                    <button disabled={signLoading} onClick={this.handleSignBtn} className="btn btn_blue btn_lg">
                                        {
                                            signLoading
                                                ? <span>Signing {this.loadingIndicator}</span>
                                                : 'Sign'
                                        }
                                    </button>
                                </div>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 1 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are creating a Payment Channel with the Lender to lock the required collateral for the loan.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• You are transferring and locking {parseFloat(lockAmount).toFixed(8)} FIl into a Payment Channel contract.</div>
                                <div className="mt-2 ">• Once created, you'll have to create and sign a Voucher to allow the Lender to seize part of your collateral in case you fail to repay the loan.</div>
                                <div className="mt-2">• When the principal is withdrawn, you will reveal secretA1, which will allow the Lender to redeem the voucher.</div>
                                <div className="mt-2">• Once the Lender accepts the payback, he will reveal secretB1, which will allow you to unlock your collateral from the Payment Channel.</div>
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
                        modalState == 2 &&
                        <Fragment>
                            <div style={{ padding: '60px 24px 30px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5, textAlign: 'center' }}>Creating a Payment Channel of {parseFloat(lockAmount).toFixed(8)} FIL with</div>
                                <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}>Lender {filLender}</div>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 3 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Transaction Submitted</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have crated a Payment Channel with the Lender, and now you need to create a voucher to complete the collateral locking process.</div>
                                <button style={{ width: '100%' }} onClick={() => this.setState({ modalState: 4 })} className="btn btn_blue btn_lg mt-4">
                                    Next
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 4 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are signing a FIL Voucher lock the required collateral for the loan.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div className="mt-2 ">• The Lender needs a signed voucher to seize the funds from the FIL Payment Channel in case you fail to repay the loan on time.</div>
                                <div className="mt-2">• The Voucher will only be redeemable when you withdraw the loan's principal (reveal secretA1) and you fail to pay back the loan on time.</div>
                                <div className="mt-2">• You will be able to unlock your collateral once the Lender accept the repayment (reveals secretB1).</div>
                            </div>

                            <div className="mt-4">
                                <div>Voucher's secret hash (secretA1)</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{secretHashA1}</div>
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
                        modalState == 5 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Voucher Signed</div>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have signed a voucher as part of the collateral locking process. The Lender will be able to seize part of your collateral with this voucher if you fail to repay the loan before the expiration date.</div>
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

function mapStateToProps({ shared, filecoin_wallet, protocolContracts, loanDetails, prices, loanAssets }, ownProps) {

    return {
        prices,
        shared,
        filecoin_wallet,
        protocolContracts,
        loanDetails: loanDetails['ERC20'][ownProps?.loanId],
        loanAssets
    }
}

export default connect(mapStateToProps)(ERC20LoanLockCollateralModal)