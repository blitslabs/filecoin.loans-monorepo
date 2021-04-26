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
import moment from 'moment'
import { toast } from 'react-toastify'

// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmRedeemUnlockCollateralVoucher, confirmSettleUnlockCollateral, confirmCollectUnlockCollateral } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20LoanCanceledUnlockCollateralModal extends Component {

    state = {
        modalState: 0,
        redeemLoading: false,
        signLoading: false,
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: '',
        secretHashB1: '',
        amount: '',
        secretB1: ''
    }

    async componentDidMount() {
        const { loanDetails } = this.props


        let modalState = 0
        if (loanDetails?.filCollateral?.state == 1) modalState = 0
        else if (loanDetails?.filCollateral?.state == 4) modalState = 3
        this.setState({ modalState })

    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleSettleBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, protocolContracts, loanDetails, dispatch, loanId } = this.props
        const { password } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        // Loading
        this.setState({ modalState: 1 })

        // Settle Payment Channel
        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)

        const response = await filecoin.settlePaymentChannel(
            loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId            
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(response)

        if (response?.status !== 'OK') {
            toast.error(response?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ modalState: 0 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmSettleUnlockCollateral({ CID: response?.payload?.CID['/'], network: shared?.filNetwork })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        toast.success('Settlement Period Started', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { ...response?.payload },
                            txHash: response?.payload?.CID['/'],
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Settle Payback Payment Channel`
                        }))

                        this.setState({ modalState: 2, password: '' })
                    }
                })
        }, 3000)
    }

    handleCollectBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, protocolContracts, loanDetails, dispatch, loanId } = this.props
        const { password } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        // Loading
        this.setState({ modalState: 4 })

        // Settle Payment Channel
        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)

        const response = await filecoin.collectPaymentChannel(
            loanDetails?.filCollateral?.paymentChannelId, // paymentChannelId            
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(response)

        if (response?.status !== 'OK') {
            toast.error(response?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ modalState: 3 })
            return
        }

        // Save Settle Tx
        this.confirmOpInterval = setInterval(async () => {
            confirmCollectUnlockCollateral({ CID: response?.payload?.CID['/'], network: shared?.filNetwork })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)

                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)

                        toast.success('Funds Collected', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });

                        // Save Tx
                        dispatch(saveTx({
                            receipt: { ...response?.payload },
                            txHash: response?.payload?.CID['/'],
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Collect Funds from Payment Channel`
                        }))

                        this.setState({ modalState: 5, password: '' })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            redeemLoading, signLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer, secretHashB1, secretB1, amount,
            settleLoading
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
                    <div className="modal-title mt-2 text-center">UNLOCK COLLATERAL</div>

                    {
                        modalState != 1 && modalState != 4 &&
                        <Stepper
                            activeStep={
                                modalState == 3 ? 1 :
                                    modalState == 6 ? 3 : modalState
                            }
                            steps={[
                                { title: 'Settle Payment Channel' },
                                { title: 'Collect Funds' }
                            ]}
                        />
                    }

                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are settling the payment channel to unlock your collateral ({loanDetails?.filCollateral?.amount} FIL).
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• The Lender canceled the offer and you are now settling the payment channel to collect your collateral.</div>
                                <div className="mt-2">• Once you start the Payment Channel's settling process, you'll have to wait 12 hrs before you can collect the funds.</div>
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
                                <button onClick={this.handleSettleBtn} disabled={!password || settleLoading} className="btn btn_blue btn_lg" style={{ width: '100%' }}>
                                    {
                                        settleLoading
                                            ? <span>Settling {this.loadingIndicator}</span>
                                            : 'Settle Payment Channel'
                                    }
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 1 &&
                        <Fragment>
                            <div style={{ padding: '60px 24px 30px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 36px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5, textAlign: 'center' }}>Settling Payment Channel</div>
                                {/* <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}></div> */}
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
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Settle Process Started</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have started the Payment Channel's settling process and you'll be able to collect the funds in approximately 12 hours.</div>
                                <button style={{ width: '100%' }} onClick={() => this.setState({ modalState: 3 })} className="btn btn_blue btn_lg mt-4">
                                    Next
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 3 &&
                        <Fragment>
                            {
                                parseFloat(moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).asHours()).toFixed(2) > 0
                                    ?
                                    <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                        You'll be able to collect the funds in the Payment Channel in
                                        {` ${moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).hours()} hours and
                                        ${moment.duration(moment.unix(loanDetails?.filCollateral?.settlingAtEstTimestamp).diff(moment())).minutes()} minutes`}
                                        .
                                    </div>
                                    :
                                    <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                        You can now collect the funds in the Payment Channel ({loanDetails?.filCollateral?.principalAmount} FIL).
                                    </div>
                            }

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• You have started the settling process in the Payment Channel, and you'll be able to collect the funds once the process ends (12hrs approx).</div>

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
                                <button onClick={this.handleCollectBtn} disabled={!password || settleLoading} className="btn btn_blue btn_lg" style={{ width: '100%' }}>
                                    {
                                        settleLoading
                                            ? <span>Collecting {this.loadingIndicator}</span>
                                            : 'Collect Funds'
                                    }
                                </button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 4 &&
                        <Fragment>
                            <div style={{ padding: '60px 24px 30px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 36px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5, textAlign: 'center' }}>Collecting Funds from Payment Channel</div>
                                {/* <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}></div> */}
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
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Funds Collected</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have unlocked and collected your collateral from the FIL Payment Channel and the loan is now closed.</div>
                                <button style={{ width: '100%' }} onClick={() => this.props.dispatch(saveCurrentModal(false))} className="btn btn_blue btn_lg mt-4">
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
        loanDetails: loanDetails['ERC20'][ownProps?.loanId],
    }
}

export default connect(mapStateToProps)(ERC20LoanCanceledUnlockCollateralModal)