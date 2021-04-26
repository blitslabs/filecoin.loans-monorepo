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
import { confirmERC20LoanOperation } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class ERC20LoanCancelModal extends Component {

    state = {
        modalState: 0,
        txLoading: false,
        lendLoading: false,
        secretHashB1: '',
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: '',
        signLoading: false
    }

    async componentDidMount() {
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handleSignBtn = async (e) => {
        e.preventDefault()
        const { protocolContracts, loanDetails, shared } = this.props
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

        const accountLoans = await erc20Loans.getAccountLoans(shared?.account)
        console.log(accountLoans)
        if (accountLoans?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        let userLoansCount = 0
        for (let l of accountLoans?.payload) {
            userLoansCount++
            if (l == loanDetails?.erc20Loan?.contractLoanId) break;
        }
        console.log(userLoansCount)

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${userLoansCount}. Contract: ${erc20LoansContract}`
        const secretData = await ETH.generateSecret(message)
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            secretB1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })
    }

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { loanDetails, loanId, shared, protocolContracts, loanAssets, dispatch } = this.props
        const { secretB1 } = this.state
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ modalState: 2 })

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(erc20LoansContract)
        } catch (e) {
            console.log(e)
            this.setState({ modalState: 1 })
            return
        }

        const response = await erc20Loans.cancelLoan(
            loanDetails?.erc20Loan?.contractLoanId,
            web3.utils.toHex(secretB1)
        )

        console.log(response)

        if (response?.status !== 'OK') {
            toast.error(response?.message, { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            this.setState({ modalState: 1 })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload?.from,
            summary: `Cancel ${loanDetails?.erc20Loan?.principalAmount} ${loanAssets[loanDetails?.erc20Loan?.token]?.symbol} Loan `,
            networkId: shared?.networkId
        }))

        const params = {
            operation: 'CancelLoan',
            networkId: shared?.networkId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        toast.success('Loan Offer Canceled', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
                        this.setState({ modalState: 3 })
                        return
                    }
                })
        }, 3000)
    }

    render() {
        const {
            txLoading, modalState,
            explorer, signLoading,
            secretB1
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, prices, loanAssets } = this.props

        const asset = loanAssets[loanDetails?.erc20Loan?.token]

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
                    <div className="modal-title mt-2 text-center">CANCEL LOAN OFFER</div>
                    {
                        modalState != 2 && modalState != 3 &&
                        <Stepper
                            activeStep={modalState}
                            steps={[
                                { title: 'Generate Secret' },
                                { title: 'Cancel Loan' },
                            ]}
                        />
                    }

                    {
                        modalState == 0 &&
                        <Fragment>

                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                You are canceling a loan offer:
                            </div>

                            <div className="mt-4">
                                <div>Loan ID (Contract)</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.erc20Loan?.contractLoanId}</div>
                            </div>

                            <div className="mt-4">
                                <div>Principal</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.erc20Loan?.principalAmount} {asset?.symbol}</div>
                            </div>

                            <div className="mt-4">
                                <div>Token Address</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.erc20Loan?.token}</div>
                            </div>

                            <div className="mt-4">
                                <div>Secret Hash B1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.erc20Loan?.secretHashB1}</div>
                            </div>

                            <div className="mt-4" style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                To continue click `Sign` to generate the secret required to withdraw the loan's principal.
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

                            <div className="mt-4">
                                The Lender has approved your borrow request and you are now able to withdraw the principal.
                            </div>

                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                You are withdrawing the loan's principal:
                            </div>

                            <div className="mt-4">
                                <div>Principal</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.erc20Loan?.principalAmount} {asset?.symbol}</div>
                            </div>

                            <div className="mt-4">
                                <div>Token Address</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14 }}>{loanDetails?.erc20Loan?.token}</div>
                            </div>

                            <div className="mt-4">
                                <div>Secret Hash B1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{loanDetails?.erc20Loan?.secretHashB1}</div>
                            </div>

                            <div className="mt-4">
                                <div>Secret B1</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 14, overflowWrap: 'break-word' }}>{secretB1}</div>
                            </div>

                            <div className="mt-4" style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>
                                To continue click `Cancel Loan Offer` and then `Confirm` on the Metamask popup.
                            </div>

                            <div className="mt-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <div style={{ flex: 1 }}>
                                    <button disabled={signLoading} onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg">
                                        Cancel Loan Offer
                                    </button>
                                </div>
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
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5 }}>Canceling Loan Offer</div>
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
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have canceled the loan offer and your funds have been refunded.</div>
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

export default connect(mapStateToProps)(ERC20LoanCancelModal)