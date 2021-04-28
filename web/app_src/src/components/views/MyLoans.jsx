import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import BigNumber from 'bignumber.js'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

// API
import { getAccountLoans } from '../../utils/api'

BigNumber.set({ EXPONENTIAL_AT: 25 })

const FIL_LOAN_STATUS = {
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
            '4': 'Unlock Collateral (Borrower)'
        }
    },
    '2': {
        '3': {
            '0': 'Loan Closed'
        }
    },
    '3': {
        '4': {
            '2': 'Accept Payback (Lender)',
            '3': 'Accept Payback (Lender)',
            '4': 'Loan Closed'
        }
    },
    '4': {
        '0': {
            '0': 'Loan Canceled'
        }
    }
}

const ERC20_LOAN_STATUS = {
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

class MyLoans extends Component {

    state = {
        accountLoans: ''
    }

    componentDidMount() {
        const { shared } = this.props

        getAccountLoans({ account: shared?.account })
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res?.status === 'OK') {
                    this.setState({ accountLoans: res?.payload })
                }
            })
    }

    render() {
        const { shared } = this.props
        const { accountLoans } = this.state

        const filBorrowed = accountLoans?.filLoans?.filter((l, i) => l?.ethBorrower?.toUpperCase() == shared?.account?.toUpperCase())
        const filLent = accountLoans?.filLoans?.filter((l, i) => l?.ethLender?.toUpperCase() == shared?.account?.toUpperCase())
        const erc20Borrowed = accountLoans?.erc20Loans?.filter((l) => l?.lender?.toUpperCase() == shared?.account?.toUpperCase())
        const erc20Lent = accountLoans?.erc20Loans?.filter((l) => l?.borrower?.toUpperCase() == shared?.account?.toUpperCase())

        return (
            <DashboardTemplate>
                <div>
                    <div className="loan_details_head_title">
                        My Loans
                    </div>

                    <div className="post__item mt-4">
                        <div className="post_body" style={{ padding: '35px 50px' }}>
                            <h5 className="">FIL Loans</h5>
                            <Tabs className="mt-4">
                                <TabList>
                                    <Tab>Borrowed</Tab>
                                    <Tab>Lent</Tab>
                                </TabList>
                                <TabPanel>
                                    <div className="table-responsive">
                                        <table className="table table-striped mt-2">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Amount</th>
                                                    <th>Blockchain</th>
                                                    <th>Network</th>
                                                    <th>Repayment</th>
                                                    <th>Interest</th>
                                                    <th>APR</th>
                                                    <th>Duration</th>
                                                    <th>Lender</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    filBorrowed?.length > 0
                                                        ?
                                                        filBorrowed.map((l, i) => {
                                                            const loanDuration = parseInt((BigNumber(l?.collateralLock?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                                            const interestAmount = parseFloat(BigNumber(l?.principalAmount).multipliedBy(l?.collateralLock?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)
                                                            const repaymentAmount = parseFloat(BigNumber(l?.principalAmount).plus(interestAmount)).toFixed(5)
                                                            const interestRate = parseFloat(l?.collateralLock?.interestRate) * 100
                                                            const lender = `${l?.ethLender?.substring(0, 4)}...${l?.ethLender?.substring(l?.ethLender?.length - 4, l?.ethLender?.length)}`
                                                            const status = FIL_LOAN_STATUS?.[l?.collateralLock?.state ? l?.collateralLock?.state : '0'][l?.state ? l?.state : '0'][l?.filPayback?.state ? l?.filPayback?.state : '0']

                                                            return (<tr>
                                                                <td>#{l?.id}</td>
                                                                <td>{l?.principalAmount} FIL</td>
                                                                <td>Filecoin</td>
                                                                <td>{l?.network}</td>
                                                                <td>{repaymentAmount} FIL</td>
                                                                <td>{interestAmount} FIL</td>
                                                                <td>{interestRate}%</td>
                                                                <td>{loanDuration}d</td>
                                                                <td>{lender}</td>
                                                                <td>
                                                                    <div className="statistics__status statistics__status_completed">
                                                                        {status}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Link to={'/loan/FIL' + l?.id} className="btn btn_blue">View Details</Link>
                                                                </td>
                                                            </tr>)
                                                        })
                                                        :
                                                        <tr>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                        </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="table-responsive">
                                        <table className="table table-striped mt-2">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Amount</th>
                                                    <th>Blockchain</th>
                                                    <th>Network</th>
                                                    <th>Repayment</th>
                                                    <th>Interest</th>
                                                    <th>APR</th>
                                                    <th>Duration</th>
                                                    <th>Borrower</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    filLent?.length > 0
                                                        ?
                                                        filLent.map((l, i) => {
                                                            const loanDuration = parseInt((BigNumber(l?.collateralLock?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                                            const interestAmount = parseFloat(BigNumber(l?.principalAmount).multipliedBy(l?.collateralLock?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)
                                                            const repaymentAmount = parseFloat(BigNumber(l?.principalAmount).plus(interestAmount)).toFixed(5)
                                                            const interestRate = parseFloat(l?.collateralLock?.interestRate) * 100
                                                            const borrower = `${l?.ethBorrower?.substring(0, 4)}...${l?.ethBorrower?.substring(l?.ethBorrower?.length - 4, l?.ethBorrower?.length)}`
                                                            const status = FIL_LOAN_STATUS?.[l?.collateralLock?.state ? l?.collateralLock?.state : '0'][l?.state ? l?.state : '0'][l?.filPayback?.state ? l?.filPayback?.state : '0']

                                                            return (<tr>
                                                                <td>#{l?.id}</td>
                                                                <td>{l?.principalAmount} FIL</td>
                                                                <td>Filecoin</td>
                                                                <td>{l?.network}</td>
                                                                <td>{repaymentAmount} FIL</td>
                                                                <td>{interestAmount} FIL</td>
                                                                <td>{interestRate}%</td>
                                                                <td>{loanDuration}d</td>
                                                                <td>{borrower}</td>
                                                                <td>
                                                                    <div className="statistics__status statistics__status_completed">
                                                                        {status}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Link to={'/loan/FIL' + l?.id} className="btn btn_blue">View Details</Link>
                                                                </td>
                                                            </tr>)
                                                        })
                                                        :
                                                        <tr>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                        </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </TabPanel>
                            </Tabs>
                        </div>
                    </div>

                    <div className="post__item mt-4">
                        <div className="post_body" style={{ padding: '35px 50px' }}>


                            <h5 className="">ERC20 Loans</h5>
                            <Tabs className="mt-4">
                                <TabList>
                                    <Tab>Borrowed</Tab>
                                    <Tab>Lent</Tab>
                                </TabList>
                                <TabPanel>
                                    <div className="table-responsive">
                                        <table className="table table-striped mt-2">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Amount</th>
                                                    <th>Blockchain</th>
                                                    <th>Network</th>
                                                    <th>Repayment</th>
                                                    <th>Interest</th>
                                                    <th>APR</th>
                                                    <th>Duration</th>
                                                    <th>Lender</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    erc20Lent?.length > 0
                                                        ?
                                                        erc20Lent.map((l, i) => {
                                                            const loanDuration = parseInt((BigNumber(l?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                                            const interestRate = parseFloat(BigNumber(l?.interestAmount).dividedBy(l?.principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100)).toFixed(2)
                                                            const repaymentAmount = parseFloat(BigNumber(l?.principalAmount).plus(l?.interestAmount)).toFixed(5)
                                                            const lender = `${l?.lender?.substring(0, 4)}...${l?.lender?.substring(l?.lender?.length - 4, l?.lender?.length)}`
                                                            const status = ERC20_LOAN_STATUS?.[l?.state ? l?.state : '0'][l?.collateralLock?.state ? l?.collateralLock?.state : '0']

                                                            return (<tr>
                                                                <td>#{l?.id}</td>
                                                                <td>{l?.principalAmount} FIL</td>
                                                                <td>Filecoin</td>
                                                                <td>{l?.networkId}</td>
                                                                <td>{repaymentAmount} FIL</td>
                                                                <td>{parseFloat(l?.interestAmount).toFixed(5)} FIL</td>
                                                                <td>{interestRate}%</td>
                                                                <td>{loanDuration}d</td>
                                                                <td>{lender}</td>
                                                                <td>
                                                                    <div className="statistics__status statistics__status_completed">
                                                                        {status}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Link to={'/loan/ERC20' + l?.id} className="btn btn_blue">View Details</Link>
                                                                </td>
                                                            </tr>)
                                                        })
                                                        :
                                                        <tr>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                        </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="table-responsive">
                                        <table className="table table-striped mt-2">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Amount</th>
                                                    <th>Blockchain</th>
                                                    <th>Network</th>
                                                    <th>Repayment</th>
                                                    <th>Interest</th>
                                                    <th>APR</th>
                                                    <th>Duration</th>
                                                    <th>Borrower</th>
                                                    <th>Status</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    erc20Lent?.length > 0
                                                        ?
                                                        erc20Lent.map((l, i) => {
                                                            const loanDuration = parseInt((BigNumber(l?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                                            const interestRate = parseFloat(BigNumber(l?.interestAmount).dividedBy(l?.principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).multipliedBy(100)).toFixed(2)
                                                            const repaymentAmount = parseFloat(BigNumber(l?.principalAmount).plus(l?.interestAmount)).toFixed(5)
                                                            const borrower = `${l?.borrower?.substring(0, 4)}...${l?.borrower?.substring(l?.borrower?.length - 4, l?.borrower?.length)}`
                                                            const status = ERC20_LOAN_STATUS?.[l?.state ? l?.state : '0'][l?.collateralLock?.state ? l?.collateralLock?.state : '0']

                                                            return (<tr>
                                                                <td>#{l?.id}</td>
                                                                <td>{l?.principalAmount} FIL</td>
                                                                <td>Filecoin</td>
                                                                <td>{l?.networkId}</td>
                                                                <td>{repaymentAmount} FIL</td>
                                                                <td>{parseFloat(l?.interestAmount).toFixed(5)} FIL</td>
                                                                <td>{interestRate}%</td>
                                                                <td>{loanDuration}d</td>
                                                                <td>{borrower}</td>
                                                                <td>
                                                                    <div className="statistics__status statistics__status_completed">
                                                                        {status}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Link to={'/loan/ERC20' + l?.id} className="btn btn_blue">View Details</Link>
                                                                </td>
                                                            </tr>)
                                                        })
                                                        :
                                                        <tr>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                            <th>-</th>
                                                        </tr>
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </TabPanel>
                            </Tabs>

                        </div>
                    </div>
                </div>
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared }) {
    return {
        shared
    }
}

export default connect(mapStateToProps)(MyLoans)