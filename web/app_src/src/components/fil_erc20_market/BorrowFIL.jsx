import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'
import SelectAssetModal from '../general/SelectAssetModal'

// Actions
import { savePrepareTx } from '../../actions/prepareTx'

// Libraries
import BigNumber from 'bignumber.js'
BigNumber.set({ EXPONENTIAL_AT: 25 })



class BorrowFIL extends Component {

    state = {
        // Principal
        principal: '',
        principalErrorMsg: '',
        principalIsInvalid: false,

        // Collateral Asset
        collateralAsset: '',
        collateralAssetAddress: '',

        // Collateral Amount
        collateralAmount: '',
        collateralAmountErrorMsg: '',
        collateralAmountIsInvalid: false,

        // Loan Duration
        loanDuration: 30,


        interestRate: 10,
        collateralizationRatio: 150,

        showSelectAssetModal: false
    }

    componentDidMount() {

    }

    handlePrincipalChange = (e) => {
        const { prices } = this.props
        const { collateralizationRatio } = this.state
        const principal = e.target.value
        if (!(principal === '' || (/^\d*\.?\d*$/).test(principal))) return

        if (!principal || principal === '.') {
            this.setState({ principal, collateralAmount: '' })
            return
        }

        const filValue = BigNumber(prices?.FIL?.usd).multipliedBy(principal)
        const collateralRequired = filValue.multipliedBy(collateralizationRatio).dividedBy(100)

        this.setState({ principal, collateralAmount: parseFloat(collateralRequired).toFixed(4), principalIsInvalid: false })
    }

    handleCollateralAmountChange = (e) => {
        const { prices } = this.props
        const collateralAmount = e.target.value
        if (!(collateralAmount === '' || (/^\d*\.?\d*$/).test(collateralAmount))) return

        if (!collateralAmount || collateralAmount == '.') {
            this.setState({ principal: '', collateralAmount })
            return
        }

        const principal = BigNumber(collateralAmount).dividedBy(prices?.FIL?.usd).multipliedBy(100).dividedBy(150)

        this.setState({ collateralAmount, principal: parseFloat(principal).toFixed(4), collateralAmountIsInvalid: false })
    }

    onAssetSelect = async (symbol, contractAddress) => {
        this.setState({
            collateralAsset: symbol,
            collateralAssetAddress: contractAddress,
            showSelectAssetModal: false
        })
    }

    handleLoanDurationClick = (loanDuration) => {
        this.setState({ loanDuration })
    }

    handleNextBtn = (e) => {
        e.preventDefault()
        const {
            principal, collateralAmount, collateralAsset, collateralAssetAddress,
            loanDuration, interestRate, collateralizationRatio
        } = this.state
        const { history, dispatch, balances, prices } = this.props

        if (!principal || principal <= 0 || isNaN(principal)) {
            this.setState({ principalIsInvalid: true, principalErrorMsg: 'Enter a valid amount' })
            return
        }

        if (!collateralAmount || collateralAmount <= 0 || isNaN(collateralAmount)) {
            this.setState({ collateralAmountIsInvalid: true, collateralAmountErrorMsg: 'Enter a valid amount' })
            return
        }

        const collateralBalance = BigNumber(balances?.[collateralAssetAddress])
        
        if (collateralBalance.lt(collateralAmount)) {
            this.setState({ collateralAmountIsInvalid: true, collateralAmountErrorMsg: 'Insufficient balance' })
            return
        }

        let interestOwedAnnual = BigNumber(principal).multipliedBy(interestRate).dividedBy(100)       
        let interestOwedPeriod = interestOwedAnnual.dividedBy(365).multipliedBy(loanDuration)
        const repaymentAmount = interestOwedPeriod.plus(principal).toString()
        let liquidationPrice = BigNumber(prices?.FIL?.usd).multipliedBy(1.5).toString()
        const interestAmount = BigNumber(repaymentAmount).minus(principal).toString()

        const tx = {
            principalAmount: principal,
            collateralAmount,
            collateralAsset,
            collateralAssetAddress,
            loanDuration,
            interestRate,
            collateralizationRatio,
            repaymentAmount,
            interestAmount,
            liquidationPrice
        }

        dispatch(savePrepareTx(tx))
        history.push('/borrow/FIL/confirm')
    }

    toggleModal = (value) => this.setState({ showSelectAssetModal: value })

    render() {

        const {
            principal, principalErrorMsg, principalIsInvalid,
            collateralAmount, collateralAmountErrorMsg, collateralAmountIsInvalid,
            collateralAsset,
            loanDuration, loanDurationErrorMsg, loanDurationIsInvalid,
            interestRate, collateralizationRatio,
            showSelectAssetModal,
        } = this.state

        const { prices } = this.props

        let interestOwedAnnual = BigNumber(principal).multipliedBy(interestRate).dividedBy(100)
        interestOwedAnnual = !isNaN(interestOwedAnnual) ? interestOwedAnnual : BigNumber('0')

        let interestOwedPeriod = interestOwedAnnual.dividedBy(365).multipliedBy(loanDuration).toString()
        interestOwedPeriod = !isNaN(interestOwedPeriod) ? interestOwedPeriod : '0'

        let liquidationPrice = BigNumber(prices?.FIL?.usd).multipliedBy(1.5).toString()
        liquidationPrice = !isNaN(liquidationPrice) ? parseFloat(liquidationPrice).toFixed(2) : '0.00'

        const nextIsDisabled = !principal || !collateralAmount || !collateralAsset ? true : false

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <h1 className="sorting1__title title mb-4">Create New FIL Borrow Request</h1>
                                    <Stepper
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
                    <div className="row">
                        <div className="col-sm-12 col-md-8 ">
                            <div className="post__item">
                                <div className="post__body">
                                    <div style={{ padding: '40px' }}>

                                        <div className="form_group" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                <div className="circle">1</div>
                                            </div>
                                            <div style={{ marginLeft: 15, flex: 1 }}>
                                                <div className="form_label_title">How much FIL would you like to borrow?</div>
                                                <div className="form_label_subtitle mt-1">The amount borrowed is also referred to as the Loan Principal</div>
                                                <div className="form_desc_container mt-3">
                                                    <div className="form_inpunt_desc_container" style={{ display: 'flex', flexDirection: 'row' }}>
                                                        <div className="input-group">
                                                            <input placeholder="FIL Amount" onChange={this.handlePrincipalChange} value={principal} className={principalIsInvalid ? "form-control input_1 is-invalid" : "form-control input_1"} type="text" />
                                                            <div className="invalid-feedback">
                                                                {principalErrorMsg}
                                                            </div>
                                                        </div>
                                                        <div className="select_asset_btn" style={{ display: 'flex' }}>
                                                            <img style={{}} className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} />
                                                            <div style={{ flex: 1, marginLeft: 5, fontWeight: 500 }}>FIL</div>
                                                        </div>
                                                    </div>
                                                    <div className="form_desc_details_container">
                                                        <div>Min: 0.5 FIL</div>
                                                        <div>Max: 10 FIL</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form_group mt-5" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                <div className="circle">2</div>
                                            </div>
                                            <div style={{ marginLeft: 15, flex: 1 }}>
                                                <div className="form_label_title">Select the collateral asset and enter the amount</div>
                                                <div className="form_label_subtitle mt-1">The amount borrowed is also referred to as the Loan Principal</div>
                                                <div className="form_desc_container mt-3">
                                                    <div className="form_inpunt_desc_container" style={{ display: 'flex', flexDirection: 'row' }}>
                                                        <div className="input-group">
                                                            <input placeholder="Collateral Amount" onChange={this.handleCollateralAmountChange} value={collateralAmount} className={collateralAmountIsInvalid ? "form-control input_1 is-invalid" : "form-control input_1"} type="text" />
                                                            <div className="invalid-feedback">
                                                                {collateralAmountErrorMsg}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => this.toggleModal(true)} className="select_asset_btn" style={{ display: 'flex' }}>
                                                            {
                                                                collateralAsset
                                                                    ?
                                                                    <Fragment>
                                                                        <img style={{}} className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/logos/${collateralAsset}.png`} />
                                                                        <div style={{ flex: 1, marginLeft: 5, fontWeight: 500 }}>{collateralAsset}</div>
                                                                    </Fragment>
                                                                    :
                                                                    <Fragment>
                                                                        <div style={{ flex: 1, marginLeft: 5, fontWeight: 500 }}>Select</div>
                                                                    </Fragment>
                                                            }
                                                            <i style={{ marginLeft: 3, marginTop: 0, fontSize: 14 }} className="fa fa-chevron-down"></i>
                                                        </button>
                                                    </div>
                                                    <div className="form_desc_details_container">
                                                        {/* <div>Min: 0.5 FIL</div>
                                                        <div>Max: 10 FIL</div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form_group mt-5" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                <div className="circle">3</div>
                                            </div>
                                            <div style={{ marginLeft: 15, flex: 1 }}>
                                                <div className="form_label_title">Select loan length</div>
                                                <div className="form_label_subtitle mt-1">This will be a <b>fixed term</b> loan</div>
                                                <div className="form_desc_container mt-3">
                                                    <div className="form_inpunt_desc_container">
                                                        <button onClick={() => this.handleLoanDurationClick(30)} className={loanDuration == 30 ? "btn btn_blue" : "btn btn_white"}>30 Days</button>
                                                        <button onClick={() => this.handleLoanDurationClick(60)} style={{ marginLeft: 10 }} className={loanDuration == 60 ? "btn btn_blue" : "btn btn_white"}>60 Days</button>
                                                        <button onClick={() => this.handleLoanDurationClick(90)} style={{ marginLeft: 10 }} className={loanDuration == 90 ? "btn btn_blue" : "btn btn_white"}>90 Days</button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>


                                        <div className="form_group mt-5" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                <div className="circle">4</div>
                                            </div>
                                            <div style={{ marginLeft: 15, flex: 1 }}>
                                                <div className="form_label_title">Select the interest rate</div>
                                                <div className="form_label_subtitle mt-1">This is the interest rate you'll pay for the loan</div>
                                                <div className="form_desc_container mt-3">
                                                    <div className="form_inpunt_desc_container">
                                                        <Slider className="slider_asc" min={5} max={25} step={0.5} value={parseFloat(interestRate)} onChange={value => { this.setState({ interestRate: value }) }} />
                                                        <div className="mt-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                            <div>5% Few Lenders</div>
                                                            <div>25% More Lenders</div>
                                                        </div>
                                                        <div className="mt-4">
                                                            Even though you can select the interest rate, lenders still have to fund your request. Lower interest rates, might take longer times to find a lender.
                                                        </div>
                                                    </div>
                                                    <div className="form_desc_details_container">

                                                    </div>
                                                </div>


                                            </div>
                                        </div>

                                        <div className="form_group mt-4" style={{ display: 'flex', flexDirection: 'row' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                                                <div style={{ visibility: 'hidden' }} className="circle"></div>
                                            </div>
                                            <div style={{ marginLeft: 15, flex: 1 }}>

                                                <div className="form_desc_container mt-3">
                                                    <div className="form_inpunt_desc_container">
                                                        <button disabled={nextIsDisabled} onClick={this.handleNextBtn} className="btn btn_blue btn_lg" style={{ width: '100%' }}>Next</button>
                                                    </div>
                                                    <div className="form_desc_details_container">

                                                    </div>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-4 ">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: '50px 40px' }}>

                                    <div className="loan_details_title">You are requesting a loan of</div>
                                    <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div className="loan_details_value">{principal && !isNaN(principal) ? parseFloat(principal).toFixed(2) : 0} FIL</div>
                                        <div style={{ marginLeft: 10 }}>
                                            <img className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} />
                                        </div>
                                    </div>

                                    <div className="loan_details_title mt-4">By collateralizintg</div>
                                    <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div className="loan_details_value">{collateralAmount && !isNaN(collateralAmount) ? parseFloat(collateralAmount).toFixed(2) : 0} {collateralAsset}</div>
                                        <div style={{ marginLeft: 10 }}>
                                            {
                                                collateralAsset &&
                                                <img className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/logos/${collateralAsset}.png`} />
                                            }
                                        </div>
                                    </div>

                                    <div className="loan_details_title mt-4">Collateralization Ratio</div>
                                    <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div className="loan_details_value">150%</div>
                                    </div>

                                    <div className="loan_details_title mt-4">Liquidation Price</div>
                                    <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div className="loan_details_value">${liquidationPrice} <span style={{ fontWeight: 400, fontSize: 14 }}>Current: ${prices?.FIL?.usd}</span></div>
                                    </div>

                                    <div style={{ border: '1px solid #e5e5e5', height: 1 }} className="mt-4 mb-4"></div>

                                    <div className="loan_details_title mt-4">Duration</div>
                                    <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div className="loan_details_value">{loanDuration} days</div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ flex: 1 }}>
                                            <div className="loan_details_title mt-4">Interest rate</div>
                                            <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                                <div className="loan_details_value">{parseFloat(interestRate)}% APR</div>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="loan_details_title mt-4">Interest owed</div>
                                            <div className="mt-2" style={{ display: 'flex', flexDirection: 'row' }}>
                                                <div className="loan_details_value">{parseFloat(interestOwedPeriod).toFixed(4)} FIL</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {
                    showSelectAssetModal &&
                    <SelectAssetModal
                        isOpen={showSelectAssetModal}
                        toggleModal={this.toggleModal}
                        onAssetSelect={this.onAssetSelect}
                    />
                }
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared, prices, balances }) {
    return {
        shared,
        prices,
        balances
    }
}

export default connect(mapStateToProps)(BorrowFIL)