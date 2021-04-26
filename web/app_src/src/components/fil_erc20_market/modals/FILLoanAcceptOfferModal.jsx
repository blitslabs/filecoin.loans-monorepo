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
import { confirmERC20CollateralLockOperation, confirmLendOperation } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class FILLoanAcceptOfferModal extends Component {

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
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handleAcceptBtn = async (e) => {
        e.preventDefault()
        const { loanDetails, loanId, shared, protocolContracts, dispatch } = this.props
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address

        this.setState({ modalState: 1 })

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(collateralLockContract)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 0 })
            return
        }
        
        const response = await collateralLock.acceptOffer(
            loanDetails?.filLoan?.collateralLockContractId,
            loanDetails?.filLoan?.ethLender,
            loanDetails?.filLoan?.filLender,
            loanDetails?.filLoan?.secretHashB1,
            loanDetails?.filLoan?.paymentChannelId,
            loanDetails?.filLoan?.principalAmount
        )

        console.log(response)

        if (response?.status !== 'OK') {
            toast.error(response?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ modalState: 0 })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Accept ${loanDetails?.filLoan?.principalAmount} FIL Loan Offer`,
            networkId: shared?.networkId
        }))

        const params = {
            operation: 'AcceptOffer',
            networkId: shared?.networkId,
            txHash: response?.payload?.transactionHash
        }


        this.intervalId = setInterval(async () => {
            confirmERC20CollateralLockOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        toast.success('Loan Offer Approved', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
                        this.setState({ modalState: 2 })
                        return
                    }
                })
        }, 3000)
    }

    render() {
        const {
            txLoading, modalState,
            explorer
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
                    <div className="modal-title mt-2 text-center">ACCEPT OFFER</div>




                    {
                        modalState == 0 &&
                        <Fragment>

                            <div className="mt-4">
                                To withdraw the Loan's Principal you'll need a Voucher signed by the Lender.
                            </div>
                            <div className="mt-2">
                                To obtain this Voucher, you first need to accept the Lender's offer and link his secret hashes to your request.
                            </div>
                            <div className="mt-2">
                                Click "Accept Offer" and then "Confirm" on the Metamask-popup to complete this action.
                            </div>

                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                You are accepting an offer:
                            </div>

                            <div className="mt-4">
                                <div>Lender's FIL Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filLoan?.filLender}</div>
                            </div>

                            <div className="mt-4">
                                <div>Lender's ETH Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filLoan?.ethLender}</div>
                            </div>

                            <div className="mt-4">
                                <div>Secret Hash B1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.filLoan?.secretHashB1}</div>
                            </div>

                            <div className="mt-4">
                                <div>Principal Offered</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filLoan?.principalAmount} FIL</div>
                            </div>

                            <div className="mt-4">
                                <div>Payment Channel Address</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.filLoan?.paymentChannelAddress}</div>
                            </div>

                            <div className="mt-5" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <div style={{ flex: 1 }}>
                                    <button disabled={txLoading} onClick={this.handleAcceptBtn} className="btn btn_blue btn_lg">
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
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5 }}>Accepting Offer </div>

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
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have accepted the Lender's offer. Please wait for the Lender to sign a Voucher so you can redeem the loan's principal.</div>
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

export default connect(mapStateToProps)(FILLoanAcceptOfferModal)