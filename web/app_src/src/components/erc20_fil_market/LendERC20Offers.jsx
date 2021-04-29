import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import BigNumber from 'bignumber.js'

// API
import { getLoanOffers } from '../../utils/api'

// Actions
import { saveOpenLoanOffers } from '../../actions/loanbook'

BigNumber.set({ EXPONENTIAL_AT: 25 })

class LendERC20Offers extends Component {

    state = {
        interestRate: 10,
        collateralizationRatio: 150
    }

    componentDidMount() {
        const { dispatch } = this.props

        getLoanOffers()
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res.status === 'OK') {
                    dispatch(saveOpenLoanOffers(res.payload))

                    let activeOffers = res.payload.length
                    let amountOffered = BigNumber(0)
                    let averageInterestRateSum = BigNumber(0)
                    let averagePrincipalSum = BigNumber(0)

                    for (let r of res?.payload) {
                        amountOffered = amountOffered.plus(r?.principalAmount)
                        const loanExpirationPeriod = (BigNumber(r?.loanExpirationPeriod).minus(259200)).dividedBy(86400)
                        const interestRatePeriod = BigNumber(r?.interestAmount).dividedBy(r?.principalAmount)
                        const interestRateYear = interestRatePeriod.multipliedBy(BigNumber(365).dividedBy(loanExpirationPeriod))
                        averageInterestRateSum = averageInterestRateSum.plus(interestRateYear)
                        averagePrincipalSum = averagePrincipalSum.plus(r?.principalAmount)
                    }

                    let averageInterestRate = averageInterestRateSum.dividedBy(activeOffers).multipliedBy(100)
                    let averagePrincipal = averagePrincipalSum.dividedBy(activeOffers)

                    this.setState({
                        amountOffered: amountOffered.toString(),
                        averageInterestRate: averageInterestRate.toString(),
                        averagePrincipal: averagePrincipal.toString()
                    })
                }
            })
    }

    render() {

        let { amountOffered, averageInterestRate, averagePrincipal } = this.state
        const { loanbook, loanAssets, prices } = this.props

        averageInterestRate = !isNaN(averageInterestRate) ? averageInterestRate : '0'
        averagePrincipal = !isNaN(averagePrincipal) ? averagePrincipal : '0'

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="sorting1">
                        <div className="sorting1__row">
                            <h1 className="sorting1__title title">ERC20 Loan Book</h1>
                            {/* <div className="sorting1__variants">
                                <div className="sorting1__text">Show:</div><select className="sorting1__select">
                                    <option selected>Active Loan Offers</option>
                                    <option>All Offers</option>
                                </select>
                            </div> */}
                            <div className="sorting1__options">
                                {/* <div className="dropdown js-dropdown">
                                    <a className="dropdown__head js-dropdown-head" href="#">
                                        <div className="dropdown__text">Sort by:</div>
                                        <div className="dropdown__category">Interest Rate</div>
                                    </a>
                                </div> */}
                                {/* <a className="sorting1__filters" href="#">
                                    <svg className="icon icon-filters">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-filters`} />
                                    </svg>
                                </a> */}
                                <button onClick={() => this.props.history.push('/lend/ERC20')} className="sorting1__btn btn btn_blue">
                                    <svg className="icon icon-plus">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-plus`} />
                                    </svg>
                                    <span className="btn__text">Create New Offer</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="settings__list">
                        <div className="settings__card">
                            <div className="settings__counter">{loanbook?.borrowRequests.length}</div>
                            <div className="settings__text">Active Offers</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">${parseFloat(amountOffered).toFixed(2)}</div>
                            <div className="settings__text">Offered</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">{parseFloat(averageInterestRate).toFixed(2)}%</div>
                            <div className="settings__text">Average Interest Rate</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">{parseFloat(averagePrincipal).toFixed(2)} FIL</div>
                            <div className="settings__text">Average Principal</div>

                        </div>
                    </div>


                    <div className="settings__card settings__card_table">
                        <div className="settings__head">
                            <div className="settings__title">Loan Offers</div>
                            <div className="options2 js-options"><button className="options2__btn js-options-btn"><svg className="icon icon-dots">
                                <use xlinkHref="img/sprite.svg#icon-dots" />
                            </svg></button>
                                <div className="options2__dropdown js-options-dropdown"><a className="options2__link" href="#">Remove Notifications</a><a className="options2__link" href="#">Turn Off Notifications from Janeta</a></div>
                            </div>
                        </div>
                        <div className="settings__body">
                            <div className="settings__table">
                                <div className="settings__row settings__row_head">
                                    <div className="settings__cell">ID</div>
                                    <div className="settings__cell">PRINCIPAL</div>
                                    <div className="settings__cell">INTEREST</div>
                                    <div className="settings__cell">APR</div>
                                    <div className="settings__cell">TERM</div>
                                    <div className="settings__cell">REQ. COLLATERAL</div>
                                    <div className="settings__cell">COLL. NETWORK</div>
                                    <div className="settings__cell">COLL. RATIO</div>
                                    <div className="settings__cell">LENDER</div>
                                    <div className="settings__cell">STATUS</div>
                                    <div className="settings__cell">ACTION</div>
                                </div>
                                {
                                    loanbook?.loanOffers.length > 0
                                        ?
                                        loanbook?.loanOffers.map((o, i) => {
                                            const loanDuration = parseInt((BigNumber(o?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                            const interestRate = BigNumber(o?.interestAmount).dividedBy(o?.principalAmount).multipliedBy(BigNumber(365).dividedBy(loanDuration)).toString()
                                            const asset = loanAssets[o?.token]
                                            const requiredCollateral = BigNumber(o?.principalAmount).dividedBy(prices?.FIL?.usd).multipliedBy(1.5).toString()

                                            return (
                                                <div key={i} className="settings__row">
                                                    <div className="settings__cell">#{o.id}</div>
                                                    <div className="settings__cell">{o.principalAmount} {asset?.symbol}</div>
                                                    <div className="settings__cell">{parseFloat(o?.interestAmount).toFixed(4)} {asset?.symbol}</div>
                                                    <div className="settings__cell">{parseFloat(BigNumber(interestRate).multipliedBy(100)).toFixed(2)}%</div>
                                                    <div className="settings__cell">{loanDuration}d</div>
                                                    <div className="settings__cell">{parseFloat(requiredCollateral).toFixed(6)} FIL</div>
                                                    <div className="settings__cell">FIL</div>
                                                    <div className="settings__cell">150%</div>
                                                    <div className="settings__cell">{o?.lender.substring(0, 4)}...{o?.lender.substring(o?.lender.length - 4, o?.lender.length)}</div>
                                                    <div className="settings__cell"><div className="statistics__status statistics__status_completed">Funded</div></div>
                                                    <div><button onClick={() => this.props.history.push('/loan/ERC20/' + o?.id)} className="btn btn_blue">BORROW</button></div>
                                                </div>
                                            )
                                        })
                                        :
                                        <div className="settings__row">
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                            <div className="settings__cell">-</div>
                                        </div>
                                }


                            </div>
                        </div>
                    </div>


                </div>
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared, loanbook, loanAssets, prices }) {
    return {
        shared,
        loanbook,
        loanAssets,
        prices
    }
}

export default connect(mapStateToProps)(LendERC20Offers)