import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'

// Modals
import FILLoanLendModal from './modals/FILLoanLendModal'
import FILLoanAcceptOfferModal from './modals/FILLoanAcceptOfferModal'

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
    '0': 'Collateral Locked',
    '0.5': 'Approve Offer (Borrower)',
    '1': 'Sign Voucher (Lender)'
}
const STEPS = {
    '0': '2',
    '0.5': '3',
    '1': '4',
    '3': '5'
}

class FILLoanDetails extends Component {

    state = {
        interestRate: 10,
        collateralizationRatio: 150
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

                    // this.setState({
                    //     loanId,
                    //     loading: false
                    // })

                    // this.checkLoanStatus(loanId)
                }
            })
    }

    toggleModal = (modalName) => {
        const { dispatch } = this.props
        dispatch(saveCurrentModal(modalName))
    }

    render() {

        const { shared, loanDetails, loanId } = this.props

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
        const secretA1 = loanDetails?.collateralLock?.secretA1 && loanDetails?.collateralLock?.secretA1 != '0x' ? loanDetails?.collateralLock?.secretA1 : '-'
        const secretHashB1 = loanDetails?.collateralLock?.secretHashB1 && loanDetails?.collateralLock?.secretHashB1 != emptyHash ? loanDetails?.collateralLock?.secretHashB1 : '-'
        const secretB1 = loanDetails?.collateralLock?.secretB1 && loanDetails?.collateralLock?.secretB1 != '0x' ? loanDetails?.collateralLock?.secretB1 : '-'

        const status = STATUS[loanDetails?.collateralLock?.state]
        const activeStep = STEPS[loanDetails?.collateralLock?.state]
        
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

                {
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

export default connect(mapStateToProps)(FILLoanDetails)