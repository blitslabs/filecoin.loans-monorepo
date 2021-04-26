import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'

// Modals
import ERC20LoanLockCollateralModal from './modals/ERC20LoanLockCollateralModal'
import ERC20LoanApproveRequestModal from './modals/ERC20LoanApproveRequestModal'
import ERC20LoanWithdrawModal from './modals/ERC20LoanWithdrawModal'
import ERC20LoanPaybackModal from './modals/ERC20LoanPaybackModal'
import ERC20LoanAcceptPaybackModal from './modals/ERC20LoanAcceptPaybackModal'
import ERC20LoanUnlockCollateralModal from './modals/ERC20LoanUnlockCollateralModal'
import ERC20LoanCancelModal from './modals/ERC20LoanCancelModal'
import ERC20LoanCanceledUnlockCollateralModal from './modals/ERC20LoanCanceledUnlockCollateralModal'
import ERC20LoanSeizeCollateralModal from './modals/ERC20LoanSeizeCollateralModal'

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
        '0': 'Lock Collateral (Borrower)',
    },
    '0.5': {
        '1': 'Approve Request (Lender)'
    },
    '1': {
        '1': 'Approve Request (Lender)',
        '2': 'Withdraw Principal (Borrower)',
        '3': 'Withdraw Principal (Borrower)',

    },
    '2': {
        '2': 'Repay Loan (Borrower)',
        '6': 'Seize Collateral (Lender)',
        '7': 'Seize Collateral (Lender)'
    },
    '3': {
        '2': 'Accept Payback (Lender)',
    },
    '5': {
        '2': 'Unlock Collateral (Borrower)',
        '3': 'Unlock Collateral (Borrower)',
        '4': 'Unlock Collateral (Borrower)'
    },
    '6': {
        '0': 'Loan Canceled',
        '1': 'Loan Canceled',
        '4': 'Loan Canceled',
        '5': 'Loan Canceled'
    }
}
const STEPS = {
    '0': {
        '0': '2',
    },
    '0.5': {
        '1': '3'
    },
    '1': {
        '1': '3',
        '2': '4'
    },
    '2': {
        '2': '5',
        '6': '7',
        '7': '7'
    },
    '3': {
        '2': '6'
    },
    '5': {
        '2': '7',
        '3': '7',
        '4': '7'
    },
    '6': {
        '0': '7',
        '1': '7',
        '4': '7',
        '5': '7'
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

        getLoanDetails({ loanType: 'ERC20', loanId })
            .then(data => data.json())
            .then((res) => {
                console.log(res)

                if (res.status === 'OK') {
                    dispatch(saveLoanDetails({ type: 'ERC20', loanDetails: res.payload, id: loanId }))

                    this.setState({
                        loading: false,
                    })

                    this.checkLoanStatus(loanId)
                }
            })
    }

    componentWillUnmount() {
        clearInterval(this.loanDetailsInterval)
    }

    checkLoanStatus = () => {
        const { loanId, dispatch } = this.props
        this.loanDetailsInterval = setInterval(async () => {
            getLoanDetails({ loanType: 'ERC20', loanId })
                .then(data => data.json())
                .then((res) => {
                    if (res?.status === 'OK') {
                        dispatch(saveLoanDetails({ type: 'ERC20', loanDetails: res.payload, id: loanId }))
                    }
                })
        }, 5000)
    }

    toggleModal = (modalName) => {
        const { dispatch } = this.props
        dispatch(saveCurrentModal(modalName))
    }

    render() {
        const { loading } = this.state
        const { shared, loanDetails, loanId, loanAssets, prices, filecoin_wallet } = this.props

        if (loading) {
            return <div>Loading...</div>
        }

        const principalAsset = loanAssets[loanDetails?.erc20Loan?.token]
        const principalAmount = BigNumber(loanDetails?.erc20Loan?.principalAmount).toString()
        const collateralAmount = BigNumber(loanDetails?.erc20Loan?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5).toString()
        const loanDuration = parseInt(BigNumber(loanDetails?.erc20Loan?.loanExpirationPeriod).dividedBy(86400).minus(3))
        const interestRate = BigNumber(loanDetails?.erc20Loan?.interestAmount).dividedBy(principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100).toString()

        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const emptyHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.erc20Loan?.filBorrower && loanDetails?.erc20Loan?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filBorrower) : '-'
        const filLender = loanDetails?.erc20Loan?.filLender && loanDetails?.erc20Loan?.filLender != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.filLender) : '-'
        const lender = loanDetails?.erc20Loan?.lender && loanDetails?.erc20Loan?.lender != emptyAddress ? loanDetails?.erc20Loan?.lender : '-'
        const borrower = loanDetails?.erc20Loan?.borrower && loanDetails?.erc20Loan?.borrower != emptyAddress ? loanDetails?.erc20Loan.borrower : '-'
        const secretHashA1 = loanDetails?.erc20Loan?.secretHashA1 && loanDetails?.erc20Loan?.secretHashA1 != emptyHash ? loanDetails?.erc20Loan?.secretHashA1 : '-'
        const secretA1 = loanDetails?.erc20Loan?.secretA1 && loanDetails?.erc20Loan?.secretA1 != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.secretA1) : '-'
        const secretHashB1 = loanDetails?.erc20Loan?.secretHashB1 && loanDetails?.erc20Loan?.secretHashB1 != emptyHash ? loanDetails?.erc20Loan?.secretHashB1 : '-'
        const secretB1 = loanDetails?.erc20Loan?.secretB1 && loanDetails?.erc20Loan?.secretB1 != '0x' ? web3.utils.toUtf8(loanDetails?.erc20Loan?.secretB1) : '-'

        const status = STATUS?.[loanDetails?.erc20Loan?.state ? loanDetails?.erc20Loan?.state : '0'][loanDetails?.filCollateral?.state ? loanDetails?.filCollateral?.state : '0']
        const activeStep = STEPS?.[loanDetails?.erc20Loan?.state ? loanDetails?.erc20Loan?.state : '0'][loanDetails?.filCollateral?.state ? loanDetails?.filCollateral?.state : '0']
        console.log(status)
        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>
                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <div className="mb-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <div className="loan_details_head_title">Loan Offer #1</div>
                                        <div>
                                            <div style={{ fontWeight: 400 }} className="loan_details_head_title"><b>Status:</b> {status}</div>
                                            {/* <div style={{ fontSize: 22, fontWeight: 400 }} className="loan_details_head_title"><b>Next:</b> Fund Loan</div> */}
                                        </div>
                                    </div>

                                    <Stepper
                                        activeStep={activeStep}
                                        steps={[
                                            { title: 'Fund Loan (Lender)' },
                                            { title: 'Lock Collateral (Borrower)' },
                                            { title: 'Approve Request (Lender)' },
                                            { title: 'Withdraw (Borrower)' },
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
                                    Loan Details
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">PRINCIPAL</div>
                                        <div className="ld_d">{principalAmount} {principalAsset?.symbol}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">REQUIRED COLLATERAL</div>
                                        <div className="ld_d">{parseFloat(collateralAmount).toFixed(6)} FIL</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">INTEREST RATE</div>
                                        <div className="ld_d">{parseFloat(interestRate).toFixed(2)}%</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">LOAN DURATION</div>
                                        <div className="ld_d">{loanDuration} Days</div>
                                    </div>
                                </div>

                                <div className="mt-5 mb-4" style={{ borderTop: '1px solid #e5e5e5' }}></div>

                                <div className="loan_details_head_title mt-4">
                                    Actors
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">BORROWER (FIL)</div>
                                        <div className="ld_d loan_details_hash_value">{filBorrower}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">BORROWER (ETH)</div>
                                        <div className="ld_d loan_details_hash_value">{borrower}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">SECRET HASH A1</div>
                                        <div className="ld_d loan_details_hash_value">{secretHashA1}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">SECRET A1</div>
                                        <div className="ld_d loan_details_hash_value">{secretA1}</div>
                                    </div>
                                </div>

                                <div className="row mt-4" >
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">LENDER (FIL)</div>
                                        <div className="ld_d loan_details_hash_value">{filLender}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">LENDER (ETH)</div>
                                        <div className="ld_d loan_details_hash_value">{lender}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">SECRET HASH B1</div>
                                        <div className="ld_d loan_details_hash_value">{secretHashB1}</div>
                                    </div>
                                    <div className="col-sm-6 col-md-3">
                                        <div className="ld_t">SECRET B1</div>
                                        <div className="ld_d loan_details_hash_value">{secretB1}</div>
                                    </div>
                                </div>

                                <div className="mt-5 mb-4" style={{ borderTop: '1px solid #e5e5e5' }}></div>

                                <div className="loan_details_head_title mt-4">

                                </div>



                                <div className="row mt-5">
                                    <div className="col-sm-12 col-md-6 offset-md-3">
                                        {
                                            status === 'Lock Collateral (Borrower)' && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_LOCK_COLLATERAL')) }} className="btn btn_blue btn_lg"><i className="fa fa-lock" style={{ marginRight: 5 }}></i> LOCK COLLATERAL</button>
                                            )
                                        }

                                        {
                                            status === 'Approve Request (Lender)' && loanDetails?.erc20Loan?.lender === shared?.account && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_APPROVE_REQUEST')) }} className="btn btn_blue btn_lg">APPROVE REQUEST</button>
                                            )
                                        }

                                        {
                                            (status === 'Lock Collateral (Borrower)' || status === 'Approve Request (Lender)') && loanDetails?.erc20Loan?.lender === shared?.account && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_CANCEL')) }} className="btn btn_blue btn_lg mt-3"><i className="fa fa-ban" style={{ marginRight: 5 }}></i>CANCEL LOAN OFFER</button>
                                            )
                                        }

                                        {
                                            status === 'Withdraw Principal (Borrower)' && loanDetails?.erc20Loan?.borrower === shared?.account && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_WITHDRAW')) }} className="btn btn_blue btn_lg">WITHDRAW PRINCIPAL</button>
                                            )
                                        }

                                        {
                                            status === 'Repay Loan (Borrower)' && loanDetails?.erc20Loan?.borrower === shared?.account && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_PAYBACK')) }} className="btn btn_blue btn_lg">REPAY LOAN</button>
                                            )
                                        }

                                        {
                                            status === 'Accept Payback (Lender)' && loanDetails?.erc20Loan?.lender === shared?.account && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_ACCEPT_PAYBACK')) }} className="btn btn_blue btn_lg">ACCEPT PAYBACK</button>
                                            )
                                        }

                                        {
                                            (status === 'Seize Collateral (Lender)' || (status === 'Repay Loan (Borrower)' && loanDetails?.filCollateral?.filLender === filecoin_wallet?.public_key?.[shared?.filNetwork])) && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_SEIZE_COLLATERAL')) }} className="btn btn_blue btn_lg mt-2">SEIZE COLLATERAL</button>
                                            )
                                        }

                                        {
                                            status === 'Unlock Collateral (Borrower)' && loanDetails?.filCollateral?.filBorrower === filecoin_wallet?.public_key?.[shared?.filNetwork] && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_UNLOCK_COLLATERAL')) }} className="btn btn_blue btn_lg mt-2">UNLOCK COLLATERAL</button>
                                            )
                                        }

                                        {
                                            status === 'Loan Canceled' && (loanDetails?.filCollateral?.state === '1' || loanDetails?.filCollateral?.state === '4') && loanDetails?.filCollateral?.filBorrower === filecoin_wallet?.public_key?.[shared?.filNetwork] && (
                                                <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL')) }} className="btn btn_blue btn_lg mt-2">UNLOCK COLLATERAL</button>
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
                            <div className="table-responsive">
                                <table className="table table-striped mt-4">
                                    <thead>
                                        <th>TX HASH</th>
                                        <th>EVENT</th>
                                        <th>BLOCKCHAIN</th>
                                        <th>NETWORK</th>
                                        <th>DATE</th>
                                    </thead>
                                    <tbody>
                                        {
                                            loanDetails?.loanEvents?.map((e, i) => (
                                                <tr key={i}>
                                                    <td>{e?.txHash.substring(0, 4)}...{e?.txHash?.substring(e?.txHash?.length - 4, e?.txHash?.length)}</td>
                                                    <td>
                                                        <div className="statistics__status statistics__status_completed">{e?.event}</div>
                                                    </td>
                                                    <td>{e?.blockchain}</td>
                                                    <td>{e?.networkId}</td>
                                                    <td>{e?.createdAt} </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    shared?.currentModal === 'ERC20_LOAN_LOCK_COLLATERAL' &&
                    <ERC20LoanLockCollateralModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_LOCK_COLLATERAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }


                {
                    shared?.currentModal === 'ERC20_LOAN_APPROVE_REQUEST' &&
                    <ERC20LoanApproveRequestModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_APPROVE_REQUEST'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }


                {
                    shared?.currentModal === 'ERC20_LOAN_WITHDRAW' &&
                    <ERC20LoanWithdrawModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_WITHDRAW'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'ERC20_LOAN_PAYBACK' &&
                    <ERC20LoanPaybackModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_PAYBACK'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'ERC20_LOAN_ACCEPT_PAYBACK' &&
                    <ERC20LoanAcceptPaybackModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_ACCEPT_PAYBACK'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }


                {
                    shared?.currentModal === 'ERC20_LOAN_UNLOCK_COLLATERAL' &&
                    <ERC20LoanUnlockCollateralModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_UNLOCK_COLLATERAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'ERC20_LOAN_CANCEL' &&
                    <ERC20LoanCancelModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_CANCEL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL' &&
                    <ERC20LoanCanceledUnlockCollateralModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_CANCELED_UNLOCK_COLLATERAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

                {
                    shared?.currentModal === 'ERC20_LOAN_SEIZE_COLLATERAL' &&
                    <ERC20LoanSeizeCollateralModal
                        isOpen={shared?.currentModal === 'ERC20_LOAN_SEIZE_COLLATERAL'}
                        toggleModal={this.toggleModal}
                        loanId={loanId}
                    />
                }

            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared, loanDetails, loanAssets, prices, filecoin_wallet }, ownProps) {

    const loanId = ownProps.match.params.loanId

    return {
        loanDetails: loanDetails['ERC20'][loanId],
        shared,
        loanId,
        loanAssets,
        prices,
        filecoin_wallet
    }
}

export default connect(mapStateToProps)(ERC20LoanDetails)