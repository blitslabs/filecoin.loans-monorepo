import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import BigNumber from 'bignumber.js'

// API
import { getBorrowRequests } from '../../utils/api'

// Actions
import { saveOpenBorrowRequests } from '../../actions/loanbook'

BigNumber.set({ EXPONENTIAL_AT: 25 })

class BorrowFILRequests extends Component {

    state = {
        interestRate: 10,
        collateralizationRatio: 150
    }

    componentDidMount() {
        const { dispatch } = this.props

        getBorrowRequests()
            .then(data => data.json())
            .then((res) => {
                if (res.status === 'OK') {
                    dispatch(saveOpenBorrowRequests(res.payload))

                    let activeRequests = res.payload.length
                    let filRequested = BigNumber(0)
                    let averageInterestRateSum = BigNumber(0)
                    let averagePrincipalSum = BigNumber(0)

                    for (let r of res?.payload) {
                        filRequested = filRequested.plus(r?.principalAmount)
                        averageInterestRateSum = averageInterestRateSum.plus(r?.interestRate)
                        averagePrincipalSum = averagePrincipalSum.plus(r?.principalAmount)
                    }

                    let averageInterestRate = averageInterestRateSum.dividedBy(activeRequests).multipliedBy(100)
                    let averagePrincipal = averagePrincipalSum.dividedBy(activeRequests)

                    this.setState({
                        filRequested: filRequested.toString(),
                        averageInterestRate: averageInterestRate.toString(),
                        averagePrincipal: averagePrincipal.toString()
                    })
                }
            })
    }

    render() {

        let { filRequested, averageInterestRate, averagePrincipal } = this.state
        const { loanbook } = this.props

        averageInterestRate = !isNaN(averageInterestRate) ? averageInterestRate : '0'
        averagePrincipal = !isNaN(averagePrincipal) ? averagePrincipal : '0'

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="sorting1">
                        <div className="sorting1__row">
                            <h1 className="sorting1__title title">FIL Loan Book</h1>
                            {/* <div className="sorting1__variants">
                                <div className="sorting1__text">Show:</div><select className="sorting1__select">
                                    <option selected>Active Borrow Requests</option>
                                    <option>All Requests</option>
                                </select>
                            </div> */}
                            <div className="sorting1__options">
                                {/* <div className="dropdown js-dropdown">
                                    <a className="dropdown__head js-dropdown-head" href="#">
                                        <div className="dropdown__text">Sort by:</div>
                                        <div className="dropdown__category">Interest Rate</div>
                                    </a>
                                    <div className="dropdown__body js-dropdown-body">
                                        <label className="checkbox checkbox_sm checkbox_green"><input className="checkbox__input" type="checkbox" /><span className="checkbox__in"><span className="checkbox__tick" /><span className="checkbox__text">Project Name</span></span></label><label className="checkbox checkbox_sm checkbox_green"><input className="checkbox__input" type="checkbox" defaultChecked="checked" /><span className="checkbox__in"><span className="checkbox__tick" /><span className="checkbox__text">Newest Project</span></span></label><label className="checkbox checkbox_sm checkbox_green"><input className="checkbox__input" type="checkbox" defaultChecked="checked" /><span className="checkbox__in"><span className="checkbox__tick" /><span className="checkbox__text">Due Date</span></span></label><label className="checkbox checkbox_sm checkbox_green"><input className="checkbox__input" type="checkbox" /><span className="checkbox__in"><span className="checkbox__tick" /><span className="checkbox__text">Project Type</span></span></label>
                                    </div>
                                </div> */}
                                {/* <a className="sorting1__filters" href="#">
                                    <svg className="icon icon-filters">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-filters`} />
                                    </svg>
                                </a> */}
                                <button onClick={() => this.props.history.push('/borrow/FIL')} className="sorting1__btn btn btn_blue">
                                    <svg className="icon icon-plus">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-plus`} />
                                    </svg>
                                    <span className="btn__text">Create New Request</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="settings__list">
                        <div className="settings__card">
                            <div className="settings__counter">{loanbook?.borrowRequests.length}</div>
                            <div className="settings__text">Active Requests</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">{filRequested} FIL</div>
                            <div className="settings__text">Requested</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">{averageInterestRate}%</div>
                            <div className="settings__text">Average Interest Rate</div>

                        </div>
                        <div className="settings__card">
                            <div className="settings__counter">{averagePrincipal} FIL</div>
                            <div className="settings__text">Average Principal</div>

                        </div>
                    </div>


                    <div className="settings__card settings__card_table">
                        <div className="settings__head">
                            <div className="settings__title">Borrow Requests</div>
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
                                {
                                    loanbook?.borrowRequests.length > 0
                                        ?
                                        loanbook?.borrowRequests.map((o, i) => {
                                            const loanDuration = parseInt((BigNumber(o?.loanExpirationPeriod).dividedBy(86400)).minus(3)).toString()
                                            return (
                                                <div key={i} className="settings__row">
                                                    <div className="settings__cell">#{o.id}</div>
                                                    <div className="settings__cell">{o.principalAmount} FIL</div>
                                                    <div className="settings__cell">{parseFloat(BigNumber(o?.principalAmount).multipliedBy(o?.interestRate).dividedBy(365).multipliedBy(loanDuration)).toFixed(5)} FIL</div>
                                                    <div className="settings__cell">{parseFloat(BigNumber(o.interestRate).multipliedBy(100)).toFixed(2)}%</div>
                                                    <div className="settings__cell">{loanDuration}d</div>
                                                    <div className="settings__cell">{o.collateralAmount} DAI</div>
                                                    <div className="settings__cell">{o.networkId}</div>
                                                    <div className="settings__cell">150%</div>
                                                    <div className="settings__cell">{o?.borrower.substring(0, 4)}...{o?.borrower.substring(o?.borrower.length - 4, o?.borrower.length)}</div>
                                                    <div className="settings__cell"><div class="statistics__status statistics__status_completed">Collateral Locked</div></div>
                                                    <div><button onClick={() => this.props.history.push('/loan/FIL/' + o?.id)} className="btn btn_blue">LEND</button></div>
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

function mapStateToProps({ shared, loanbook }) {
    return {
        shared,
        loanbook
    }
}

export default connect(mapStateToProps)(BorrowFILRequests)