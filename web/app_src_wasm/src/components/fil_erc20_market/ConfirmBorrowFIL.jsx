import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import ETH from '../../crypto/ETH'
import ERC20CollateralLock from '../../crypto/ERC20CollateralLock'
import BigNumber from 'bignumber.js'
import Stepper from 'react-stepper-horizontal'

// Actions
import { saveTx } from '../../actions/txs'

// API
import { confirmERC20CollateralLockOperation } from '../../utils/api'

BigNumber.set({ EXPONENTIAL_AT: 25 })

class ConfirmBorrowFIL extends Component {

    state = {
        secretHashA1: '',
        showAllowanceBtn: false,
        allowanceLoading: false,
        signLoading: false,
        lockCollateralLoading: false
    }

    componentDidMount() {
        this.checkAllowance()
    }

    checkAllowance = async () => {
        const { prepareTx, protocolContracts, shared } = this.props
        const { collateralAssetAddress, collateralAmount } = prepareTx
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address
        const allowanceResponse = await ETH.getAllowance(collateralLockContract, collateralAssetAddress)
        console.log('allowance:  ', allowanceResponse)

        if (allowanceResponse?.status !== 'OK') {
            this.setState({ showAllowanceBtn: true })
            return
        }

        const allowance = BigNumber(allowanceResponse?.payload)

        if (allowance.lt(collateralAmount)) {
            this.setState({ showAllowanceBtn: true })
        } else {
            this.setState({ showAllowanceBtn: false })
        }
    }

    handleApproveAllowanceBtn = async (e) => {
        e.preventDefault()
        const { prepareTx, protocolContracts, shared, dispatch } = this.props
        const { collateralAssetAddress, collateralAmount, collateralAsset } = prepareTx
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address

        this.setState({ allowanceLoading: true })

        const allowanceAmount = BigNumber(1e56)

        const response = await ETH.approveAllowance(collateralLockContract, allowanceAmount, collateralAssetAddress)
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
            summary: `Approve ${collateralAsset}`,
            networkId: shared?.networkId
        }))

        this.setState({ allowanceLoading: false })
        this.checkAllowance()
    }

    handleSignBtn = async (e) => {
        e.preventDefault()
        const { prepareTx, protocolContracts, shared, dispatch } = this.props
        const { collateralAssetAddress, collateralAmount, collateralAsset } = prepareTx
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address

        this.setState({ signLoading: true })

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(collateralLockContract)
        } catch (e) {
            console.log(e)
            return
        }

        const account = (await ETH.getAccount())?.payload
        const userLoansCount = await collateralLock.getUserLoansCount(account)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to create the request. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${collateralLockContract}`
        const secretData = await ETH.generateSecret(message)
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({ secretHashA1: secretData?.payload?.secretHash, signLoading: false })
    }

    handleLockCollateralBtn = async (e) => {
        e.preventDefault()
        const { secretHashA1 } = this.state
        const { filecoin_wallet, shared, prepareTx, protocolContracts, dispatch, history } = this.props
        const {
            collateralAmount, collateralAssetAddress, principalAmount,
            interestRate, loanDuration, collateralAsset
        } = prepareTx
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address

        this.setState({ lockCollateralLoading: true })

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(collateralLockContract)
        } catch (e) {
            console.log(e)
            return
        }

        const response = await collateralLock.createBorrowRequest(
            secretHashA1,
            filecoin_wallet?.public_key?.[shared?.filNetwork],
            collateralAmount,
            collateralAssetAddress,
            principalAmount,
            interestRate,
            loanDuration
        )
        console.log(response)

        if (response?.status !== 'OK') {
            this.setState({ lockCollateralLoading: false })
            return
        }

        dispatch(saveTx({
            receipt: response?.payload,
            txHash: response?.payload?.transactionHash,
            from: response?.payload.from,
            summary: `Lock ${collateralAmount} ${collateralAsset} as collateral`,
            networkId: shared?.networkId
        }))

        const params = {
            operation: 'CreateBorrowRequest',
            networkId: shared?.networkId,
            txHash: response?.payload?.transactionHash
        }

        this.intervalId = setInterval(async () => {
            confirmERC20CollateralLockOperation(params)
                .then(data => data.json())
                .then((res) => {
                    if (res.status === 'OK') {
                        clearInterval(this.intervalId)
                        history.push('/borrow/FIL/done')
                        return
                    }
                })
        }, 3000)
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    render() {

        const {
            secretHashA1, showAllowanceBtn,
            allowanceLoading, signLoading, lockCollateralLoading
        } = this.state
        const { prepareTx, shared, prices } = this.props

        const signBtnIsDisabled = (showAllowanceBtn || signLoading || secretHashA1) ? true : false
        const lockCollateralBtnIsDisabled = (showAllowanceBtn || !secretHashA1 || lockCollateralLoading) ? true : false

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <h1 className="sorting1__title title mb-4">Create New FIL Borrow Request</h1>
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
                                            <div className="loan_details_title">Borrow Amount / Loan Principal</div>
                                            <div className="loan_details_value">{prepareTx?.principalAmount} FIL</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Interest</div>
                                            <div className="loan_details_value">{parseFloat(prepareTx?.interestAmount).toFixed(6)} FIL <span className="loan_details_title" style={{ fontWeight: 400 }}>({prepareTx?.interestRate}% APR)</span></div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Total Repayment Amount</div>
                                            <div className="loan_details_value">{parseFloat(prepareTx?.repaymentAmount).toFixed(6)} FIL</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Duration</div>
                                            <div className="loan_details_value">{prepareTx?.loanDuration} Days</div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, borderLeft: '1px solid rgb(224 224 224)', paddingLeft: 50, }}>
                                        <div className="">
                                            <div className="loan_details_title">Collateral Amount / Network</div>
                                            <div className="loan_details_value">{prepareTx?.collateralAmount} DAI <span style={{ fontWeight: 400, fontSize: 14 }}>/ {shared?.networkId}</span></div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Collateralization Ratio</div>
                                            <div className="loan_details_value">{prepareTx?.collateralizationRatio}%</div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Liquidation Price</div>
                                            <div className="loan_details_value">${parseFloat(prepareTx?.liquidationPrice).toFixed(2)} <span className="loan_details_title" style={{ fontWeight: 400 }}>Current price: ${parseFloat(prices?.FIL?.usd).toFixed(2)}</span></div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="loan_details_title">Secret Hash</div>
                                            <div className="loan_details_value" style={{ fontSize: 14, overflowWrap: 'anywhere' }}>{secretHashA1 ? secretHashA1 : '-'}</div>
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
                                        <button disabled={lockCollateralBtnIsDisabled} onClick={this.handleLockCollateralBtn} className="btn btn_blue btn_lg" style={{ width: 300 }}>
                                            {
                                                lockCollateralLoading
                                                    ? <span>Locking Collateral {this.loadingIndicator}</span>
                                                    : 'Lock Collateral'
                                            }
                                        </button>
                                    </div>
                                </div>
                                <Stepper
                                    activeStep={showAllowanceBtn ? 0 : secretHashA1 ? 1 : 2}
                                    steps={
                                        showAllowanceBtn
                                            ?
                                            [
                                                { title: 'Approve Allowance' },
                                                { title: 'Sign Message' },
                                                { title: 'Lock Collateral' },
                                            ]
                                            :
                                            [
                                                { title: 'Sign Message' },
                                                { title: 'Lock Collateral' },
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

export default connect(mapStateToProps)(ConfirmBorrowFIL)