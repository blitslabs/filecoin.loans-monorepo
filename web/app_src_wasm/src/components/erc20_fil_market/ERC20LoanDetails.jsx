import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'

// Modals
// import FILLoanLendModal from './modals/FILLoanLendModal'
// import FILLoanAcceptOfferModal from './modals/FILLoanAcceptOfferModal'
// import FILLoanSignWithdrawVoucherModal from './modals/FILLoanSignWithdrawVoucherModal'
// import FILLoanWithdrawPrincipalModal from './modals/FILLoanWithdrawPrincipalModal'
// import FILLoanRepayModal from './modals/FILLoanRepayModal'
// import FILLoanAcceptPaybackModal from './modals/FILLoanAcceptPaybackModal'
// import FILLoanUnlockCollateralModal from './modals/FILLoanUnlockCollateralModal'

// Libraries
import Web3 from 'web3'
import BigNumber from 'bignumber.js'

// Actions
import { saveCurrentModal } from '../../actions/shared'
import { saveLoanDetails } from '../../actions/loanDetails'

// API
import { getLoanDetails } from '../../utils/api'

const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })
const STATUS = {
    '0': {
        '0': { '0': 'Collateral Locked' }
    },
    '0.5': {
        '0': { '0': 'Approve Offer (Borrower)' }
    },
    '1': {
        '0': { '0': 'Sign Voucher (Lender)' },
        '1': { '0': 'Withdraw Principal (Borrower)' },
        '2': { '0': 'Withdraw Principal (Borrower)' },
        '3': { '0': 'Withdraw Principal (Borrower)' },
        '4': {
            '0': 'Repay Loan (Borrower)',
            '1': 'Accept Payback (Lender)',
            '2': 'Accept Payback (Lender)',
            '3': 'Accept Payback (Lender)',
        }
    },
    '3': {
        '4': {
            '2': 'Accept Payback (Lender)',
            '3': 'Accept Payback (Lender)'
        }
    }
}
const STEPS = {
    '0': {
        '0': { '0': '2' }
    },
    '0.5': {
        '0': { '0': '3' }
    },
    '1': {
        '0': { '0': '4' },
        '1': { '0': '5' },
        '2': { '0': '5' },
        '3': { '0': '5' },
        '4': { '0': '6' },
        '4': { '1': '7' },
        '4': { '2': '7' },
        '4': { '3': '7' }
    },
    '3': {
        '4': { '2': '7' },
        '4': { '3': '7' }
    }
}

class ERC20LoanDetails extends Component {

    state = {
        interestRate: 10,
        collateralizationRatio: 150,
        loading: true
    }

    componentDidMount() {
        const { history, match, dispatch } = this.props
        const { loanId } = match.params
        document.title = `Loan Details #${loanId} | Filecoin Loans`

        if (!loanId) history.push('/borrow/requests/FIL')

        getLoanDetails({ loanType: 'FIL', loanId })
            .then(data => data.json())
            .then((res) => {
                console.log(res)

                if (res.status === 'OK') {
                    dispatch(saveLoanDetails({ type: 'FIL', loanDetails: res.payload }))

                    this.setState({
                        loading: false
                    })

                    // this.checkLoanStatus(loanId)
                }
            })
    }

    toggleModal = (modalName) => {
        const { dispatch } = this.props
        dispatch(saveCurrentModal(modalName))
    }

    render() {
        const { loading } = this.state
        const { shared, loanDetails, loanId } = this.props

        if (loading) {
            return <div>Loading...</div>
        }

        const principalAmount = BigNumber(loanDetails?.collateralLock?.principalAmount).toString()
        const collateralAmount = BigNumber(loanDetails?.collateralLock?.collateralAmount).toString()
        const interestRate = BigNumber(loanDetails?.collateralLock?.interestRate).multipliedBy(100).toString()
        const loanDuration = parseInt(BigNumber(loanDetails?.collateralLock?.loanExpirationPeriod).dividedBy(86400).minus(3))

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : '-'
        const filLender = loanDetails?.collateralLock?.filLender && loanDetails?.collateralLock?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filLender) : '-'
        const lender = loanDetails?.collateralLock?.lender && loanDetails?.collateralLock?.lender != emptyAddress ? loanDetails?.collateralLock?.lender : '-'
        const borrower = loanDetails?.collateralLock?.borrower && loanDetails?.collateralLock?.borrower != emptyAddress ? loanDetails?.collateralLock.borrower : '-'
        const secretHashA1 = loanDetails?.collateralLock?.secretHashA1 && loanDetails?.collateralLock?.secretHashA1 != emptyHash ? loanDetails?.collateralLock?.secretHashA1 : '-'
        const secretA1 = loanDetails?.filLoan?.secretA1 && loanDetails?.filLoan?.secretA1 != '0x' ? loanDetails?.filLoan?.secretA1 : '-'
        const secretHashB1 = loanDetails?.collateralLock?.secretHashB1 && loanDetails?.collateralLock?.secretHashB1 != emptyHash ? loanDetails?.collateralLock?.secretHashB1 : '-'
        const secretB1 = loanDetails?.filPayback?.secretB1 && loanDetails?.filPayback?.secretB1 != '0x' ? loanDetails?.filPayback?.secretB1 : '-'

        const status = STATUS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0'][loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0'][loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']
        const activeStep = STEPS?.[loanDetails?.collateralLock?.state ? loanDetails?.collateralLock?.state : '0'][loanDetails?.filLoan?.state ? loanDetails?.filLoan?.state : '0'][loanDetails?.filPayback?.state ? loanDetails?.filPayback?.state : '0']

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>
                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <div className="mb-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div className="loan_details_head_title">Loan Request #1</div>
                                        <div>
                                            <div style={{ fontWeight: 400 }} className="loan_details_head_title"><b>Status:</b> {status}</div>
                                            {/* <div style={{ fontSize: 22, fontWeight: 400 }} className="loan_details_head_title"><b>Next:</b> Fund Loan</div> */}
                                        </div>
                                    </div>

                                    <Stepper
                                        activeStep={activeStep}
                                        steps={[
                                            { title: 'Lock Collateral (Borrower)' },
                                            { title: 'Fund Loan (Lender)' },
                                            { title: 'Accept Offer (Borrower)' },
                                            { title: 'Sign Voucher (Lender)' },
                                            { title: 'Withdraw Principal (Borrower)' },
                                            { title: 'Repay Loan (Borrower)' },
                                            { title: 'Accept Payback (Lender)' },
                                            { title: 'Unlock Collateral (Borrower)' }
                                        ]}

                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="post__item">
                        <div className="post__body">

                            <div style={{ padding: '50px 50px 50px 50px' }}>

                                <div className="loan_details_head_title">
                                    Request Details
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">FIL REQUESTED</div>
                                        <div className="">{principalAmount} fil</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">COLLATERAL LOCKED</div>
                                        <div className="">{collateralAmount} DAI</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">INTEREST RATE</div>
                                        <div className="">{interestRate}%</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">LOAN DURATION</div>
                                        <div className="">{loanDuration} Days</div>
                                    </div>
                                </div>

                                <div className="mt-5 mb-4" style={{ borderTop: '1px solid #e5e5e5' }}></div>

                                <div className="loan_details_head_title mt-4">
                                    Actors
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">BORROWER (FIL)</div>
                                        <div className="loan_details_hash_value">{filBorrower}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">BORROWER (ETH)</div>
                                        <div className="loan_details_hash_value">{borrower}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">SECRET HASH A1</div>
                                        <div className="loan_details_hash_value">{secretHashA1}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">SECRET A1</div>
                                        <div className="loan_details_hash_value">{secretA1}</div>
                                    </div>
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">LENDER (FIL)</div>
                                        <div className="loan_details_hash_value">{filLender}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">LENDER (ETH)</div>
                                        <div className="loan_details_hash_value">{lender}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">SECRET HASH B1</div>
                                        <div className="loan_details_hash_value">{secretHashB1}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="">SECRET B1</div>
                                        <div className="loan_details_hash_value">{secretB1}</div>
                                    </div>
                                </div>

                                <div className="mt-5 mb-4" style={{ borderTop: '1px solid #e5e5e5' }}></div>

                                <div className="loan_details_head_title mt-4">
                                    Actions
                                </div>

                                <div className="row">
                                    <div className="col-sm-12 col-md-6">
                                        <div>Borrower</div>
                                        <div>Required Action: Waiting For Lender</div>
                                        <div></div>
                                        {/* <button disabled={true} className="btn btn_blue btn_lg">Accept Offer</button> */}
                                    </div>
                                    <div className="col-sm-12 col-md-6">
                                        <div>Lender</div>
                                        <div>Required Action: Fund Loan</div>
                                    </div>
                                </div>

                                <div className="row mt-5">
                                    <div className="col-sm-12 col-md-6 offset-md-3">
                                        {
                                            loanDetails?.collateralLock?.state == 0 && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_LEND')) }} className="btn btn_blue btn_lg">LEND</button>
                                            )
                                        }

                                        {
                                            loanDetails?.collateralLock?.state == 0.5 && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_ACCEPT_OFFER')) }} className="btn btn_blue btn_lg">APPROVE OFFER</button>
                                            )
                                        }

                                        {
                                            status == 'Sign Voucher (Lender)' && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_SIGN_WITHDRAW_VOUCHER')) }} className="btn btn_blue btn_lg">SIGN VOUCHER</button>
                                            )
                                        }

                                        {
                                            status == 'Withdraw Principal (Borrower)' && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_WITHDRAW_PRINCIPAL')) }} className="btn btn_blue btn_lg">WITHDRAW PRINCIPAL</button>
                                            )
                                        }

                                        {
                                            status == 'Repay Loan (Borrower)' && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_REPAY')) }} className="btn btn_blue btn_lg">REPAY LOAN</button>
                                            )
                                        }

                                        {
                                            status == 'Accept Payback (Lender)' && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_ACCEPT_PAYBACK')) }} className="btn btn_blue btn_lg">ACCEPT PAYBACK</button>
                                            )
                                        }

                                        {
                                            loanDetails?.filPayback?.secretB1 && loanDetails?.filLoan?.state == 1 && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_LOAN_UNLOCK_COLLATERAL')) }} className="btn btn_blue btn_lg mt-2">UNLOCK COLLATERAL</button>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="post__item mt-4">
                        <div className="post_body" style={{ padding: 50 }}>
                            <div className="loan_details_head_title">
                                Transaction History
                            </div>
                            <div className="settings__table mt-4">
                                <div className="settings__row settings__row_head">
                                    <div className="settings__cell">ID</div>
                                    <div className="settings__cell">FIL REQUESTED</div>
                                    <div className="settings__cell">INTEREST</div>
                                    <div className="settings__cell">APR</div>
                                    <div className="settings__cell">TERM</div>
                                    <div className="settings__cell">COLLATERAL</div>
                                    <div className="settings__cell">COLL. NETWORK</div>
                                    <div className="settings__cell">COLL. RATIO</div>
                                    <div className="settings__cell">BORROWER</div>
                                    <div className="settings__cell">STATUS</div>
                                    <div className="settings__cell">ACTION</div>
                                </div>
                                <div className="settings__row">
                                    <div className="settings__cell">#1</div>
                                    <div className="settings__cell">2.1 FIL</div>
                                    <div className="settings__cell">0.05 FIL</div>
                                    <div className="settings__cell">12.34%</div>
                                    <div className="settings__cell">30 Days</div>
                                    <div className="settings__cell">300 DAI</div>
                                    <div className="settings__cell">Ethereum</div>
                                    <div className="settings__cell">150%</div>
                                    <div className="settings__cell">0x24...34f3Q</div>
                                    <div className="settings__cell"><div className="statistics__status statistics__status_completed">Collateral Locked</div></div>
                                    <div><button onClick={() => this.props.history.push('/loan/FIL/1')} className="btn btn_blue">LEND</button></div>
                                </div>
                                <div className="settings__row">
                                    <div className="settings__cell">#2</div>
                                    <div className="settings__cell">2.1 FIL</div>
                                    <div className="settings__cell">0.05 FIL</div>
                                    <div className="settings__cell">12.34%</div>
                                    <div className="settings__cell">30 Days</div>
                                    <div className="settings__cell">300 DAI</div>
                                    <div className="settings__cell">Ethereum</div>
                                    <div className="settings__cell">150%</div>
                                    <div className="settings__cell">0x24...34f3Q</div>
                                    <div className="settings__cell"><div className="statistics__status statistics__status_completed">Collateral Locked</div></div>

                                    <div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* {
                    shared?.currentModal === 'FIL_LOAN_LEND' &&
                    <FILLoanLendModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_LEND'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_ACCEPT_OFFER' &&
                    <FILLoanAcceptOfferModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_ACCEPT_OFFER'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_SIGN_WITHDRAW_VOUCHER' &&
                    <FILLoanSignWithdrawVoucherModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_SIGN_WITHDRAW_VOUCHER'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_WITHDRAW_PRINCIPAL' &&
                    <FILLoanWithdrawPrincipalModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_WITHDRAW_PRINCIPAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_REPAY' &&
                    <FILLoanRepayModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_REPAY'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_ACCEPT_PAYBACK' &&
                    <FILLoanAcceptPaybackModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_ACCEPT_PAYBACK'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'FIL_LOAN_UNLOCK_COLLATERAL' &&
                    <FILLoanUnlockCollateralModal
                        isOpen={shared?.currentModal === 'FIL_LOAN_UNLOCK_COLLATERAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                } */}
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared, loanDetails }, ownProps) {

    const loanId = ownProps.match.params.loanId

    return {
        loanDetails: loanDetails['FIL'][loanId],
        shared,
        loanId
    }
}

export default connect(mapStateToProps)(ERC20LoanDetails)