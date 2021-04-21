import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import ETH from '../../crypto/ETH'
import ERC20Loans from '../../crypto/ERC20Loans'
import BigNumber from 'bignumber.js'
import Stepper from 'react-stepper-horizontal'

// Actions
import { saveTx } from '../../actions/txs'

// API
import { confirmERC20LoanOperation } from '../../utils/api'

BigNumber.set({ EXPONENTIAL_AT: 25 })

class ConfirmLendER20 extends Component {

    state = {
        secretHashB1: '',
        showAllowanceBtn: false,
        allowanceLoading: false,
        signLoading: false,
        fundLoanLoading: false
    }

    componentDidMount() {
        this.checkAllowance()
    }

    checkAllowance = async () => {
        const { prepareTx, protocolContracts, shared } = this.props
        const { principalAssetAddress, principalAmount } = prepareTx
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address
        const allowanceResponse = await ETH.getAllowance(erc20LoansContract, principalAssetAddress)
        console.log('allowance:  ', allowanceResponse)

        if (allowanceResponse?.status !== 'OK') {
            this.setState({ showAllowanceBtn: true })
            return
        }

        const allowance = BigNumber(allowanceResponse?.payload)

        if (allowance.lt(principalAmount)) {
            this.setState({ showAllowanceBtn: true })
        } else {
            this.setState({ showAllowanceBtn: false })
        }
    }

    handleApproveAllowanceBtn = async (e) => {
        e.preventDefault()
        const { prepareTx, protocolContracts, shared, dispatch } = this.props
        const { principalAssetAddress, principalAsset } = prepareTx
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ allowanceLoading: true })

        const allowanceAmount = BigNumber(1e56)

        const response = await ETH.approveAllowance(erc20LoansContract, allowanceAmount, principalAssetAddress)
        console.log('response: ', response)

        if (response?.status !== 'OK') {
            // show error msg modal
            this.setState({ allowanceLoading: false })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload.from,
            summary: `Approve ${principalAsset}`,
            networkId: shared?.networkId
        }))

        this.setState({ allowanceLoading: false })
        this.checkAllowance()
    }

    handleSignBtn = async (e) => {
        e.preventDefault()
        const { prepareTx, protocolContracts, shared, dispatch } = this.props        
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ signLoading: true })

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(erc20LoansContract)
        } catch (e) {
            console.log(e)
            return
        }

        const account = (await ETH.getAccount())?.payload
        const userLoansCount = await erc20Loans.getUserLoansCount(account)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${erc20LoansContract}`
        const secretData = await ETH.generateSecret(message)
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({ secretHashB1: secretData?.payload?.secretHash, signLoading: false })
    }

    handleFundBtn = async (e) => {
        e.preventDefault()
        const { secretHashB1 } = this.state
        const { filecoin_wallet, shared, prepareTx, protocolContracts, dispatch, history } = this.props
        const {
            principalAmount, principalAssetAddress,
            interestRate, loanDuration, principalAsset
        } = prepareTx
        const erc20LoansContract = protocolContracts?.[shared?.networkId]?.ERC20Loans?.address

        this.setState({ fundLoanLoading: true })

        let erc20Loans
        try {
            erc20Loans = new ERC20Loans(erc20LoansContract)
        } catch (e) {
            console.log(e)
            return
        }

        const interestAmount = BigNumber(principalAmount).multipliedBy(interestRate).dividedBy(365).multipliedBy(loanDuration).toString()

        const response = await erc20Loans.createLoanOffer(
            secretHashB1, // secretHashB1
            filecoin_wallet?.public_key?.[shared?.filNetwork], // filLender
            principalAmount, // principal
            interestAmount, // interest
            principalAssetAddress, // token
            loanDuration // loanExpirationPeriod
        )
        console.log(response)

        if (response?.status !== 'OK') {
            this.setState({ fundLoanLoading: false })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload.from,
            summary: `Fund ${principalAmount} ${principalAsset} loan`,
            networkId: shared?.networkId
        }))

        const params = {
            operation: 'CreateLoanOffer',
            networkId: shared?.networkId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20LoanOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        history.push('/lend/ERC20/done')
                        return
                    }
                })
        }, 3000)
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    render() {

        const {
            secretHashB1, showAllowanceBtn,
            allowanceLoading, signLoading, fundLoanLoading
        } = this.state
        const { prepareTx, shared, prices } = this.props

        const signBtnIsDisabled = (showAllowanceBtn || signLoading || secretHashB1) ? true : false
        const fundLoanBtnIsDisabled = (showAllowanceBtn || !secretHashB1 || fundLoanLoading) ? true : false

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <h1 className="sorting1__title title mb-4">Create New ERC20 Loan Offer</h1>
                                    <Stepper
                                        activeStep={1}
                                        steps={[
                                            { title: 'Set Terms' },
                                            { title: 'Lock Collateral' },
                                            { title: 'Waiting For Lender' },
                                            { title: 'Withdraw Principal' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="post__item">
                        <div className="post__body">
                            <button
                                onClick={() => this.props.history.goBack()}
                                style={{ right: '10px', top: '10px', padding: '5px' }}
                            >
                                <img src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`} />
                            </button>
                            <div className="loan_details_container" >

                                <div style={{ fontSize: 18, fontWeight: 500 }}>
                                    Verify the details of your loan. Then click the “Confirm” button below and “Sign” on the Metamask pop-up to proceed to lock your collateral.
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row' }} className="mt-5">
                                    <div style={{ flex: 1, }}>
                                        <div className="">
                                            <div className="loan_details_title">Loan Amount / Loan Principal</div>
                                            <div className="loan_details_value">{prepareTx?.principalAmount} {prepareTx?.principalAsset}</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Interest</div>
                                            <div className="loan_details_value">{parseFloat(prepareTx?.interestAmount).toFixed(6)} {prepareTx?.principalAsset} <span className="loan_details_title" style={{ fontWeight: 400 }}>({prepareTx?.interestRate}% APR)</span></div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Total Repayment Amount</div>
                                            <div className="loan_details_value">{parseFloat(prepareTx?.repaymentAmount).toFixed(6)} {prepareTx?.principalAsset}</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Duration</div>
                                            <div className="loan_details_value">{prepareTx?.loanDuration} Days</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, borderLeft: '1px solid rgb(224 224 224)', paddingLeft: 50, }}>
                                        <div className="">
                                            <div className="loan_details_title">Collateral Asset</div>
                                            <div className="loan_details_value" style={{display:'flex', alignItems:'center'}}><img className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} /> <span style={{marginLeft: 10}}>FIL</span></div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Collateralization Ratio</div>
                                            <div className="loan_details_value">{prepareTx?.collateralizationRatio}%</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Est. Collateral Amount</div>
                                            <div className="loan_details_value">{parseFloat(BigNumber(prepareTx?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5)).toFixed(2)} FIL</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Secret Hash</div>
                                            <div className="loan_details_value" style={{ fontSize: 14, overflowWrap: 'anywhere' }}>{secretHashB1 ? secretHashB1 : '-'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-5" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', borderTop: '1px solid rgb(224 224 224)' }} >
                                    {
                                        showAllowanceBtn &&
                                        <div style={{ marginRight: 20 }}>
                                            <button disabled={
                                                allowanceLoading ? true : false
                                            }
                                                onClick={this.handleApproveAllowanceBtn}
                                                className="btn btn_blue btn_lg"
                                                style={{ width: 300 }}>
                                                {
                                                    allowanceLoading
                                                        ? <span>Approving {this.loadingIndicator}</span>
                                                        : 'Approve Allowance'
                                                }
                                            </button>
                                        </div>
                                    }
                                    <div style={{}}>
                                        <button disabled={signBtnIsDisabled} onClick={this.handleSignBtn} className="btn btn_blue btn_lg" style={{ width: 300 }}>
                                            {
                                                signLoading
                                                    ? <span>Signing {this.loadingIndicator}</span>
                                                    : 'Sign'
                                            }
                                        </button>
                                    </div>
                                    <div style={{ marginLeft: 20, }}>
                                        <button disabled={fundLoanBtnIsDisabled} onClick={this.handleFundBtn} className="btn btn_blue btn_lg" style={{ width: 300 }}>
                                            {
                                                fundLoanLoading
                                                    ? <span>Creating Loan {this.loadingIndicator}</span>
                                                    : 'Fund Loan'
                                            }
                                        </button>
                                    </div>
                                </div>
                                <Stepper
                                    activeStep={showAllowanceBtn ? 0 : secretHashB1 ? 1 : 2}
                                    steps={
                                        showAllowanceBtn
                                            ?
                                            [
                                                { title: 'Approve Allowance' },
                                                { title: 'Sign Message' },
                                                { title: 'Fund Loan' },
                                            ]
                                            :
                                            [
                                                { title: 'Sign Message' },
                                                { title: 'Fund Loan' },
                                            ]
                                    }
                                />
                            </div>
                        </div>
                    </div>


                </div>
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared, prepareTx, prices, protocolContracts, filecoin_wallet }) {
    return {
        shared,
        prepareTx,
        prices,
        protocolContracts,
        filecoin_wallet
    }
}

export default connect(mapStateToProps)(ConfirmLendER20)