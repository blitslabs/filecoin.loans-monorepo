import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// Components
class Sidebar extends Component {
    render() {
        return (
            <Fragment>
                <div className="sidebar7 js-sidebar7">
                    <div className="sidebar7__top"><button className="sidebar7__close js-sidebar7-close"><svg className="icon icon-close">
                        <use xlinkHref="assets/img/sprite.svg#icon-close" />
                    </svg></button><a className="sidebar7__logo" href="#"><img className="sidebar7__pic sidebar7__pic_black" src="assets/img/logo.svg" /><img className="sidebar7__pic sidebar7__pic_white" src="assets/img/logo-white.svg" /></a></div>
                    <div className="sidebar7__wrapper">
                        <div className="sidebar7__box">
                            <div className="sidebar7__category">Main</div>
                            <div className="sidebar7__menu">
                                <Link className={window.location.pathname === '/dashboard' ? "sidebar7__item active" : "sidebar7__item"} to={`/dashboard`}>
                                    <svg className="icon icon-dashboard">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-dashboard`} />
                                    </svg>
                                    Dashboard
                                </Link>

                                <a className="sidebar7__item " href="circle-overview.html">
                                    <svg className="icon icon-dashboard">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-salary`} />
                                    </svg>
                                FIL Wallet
                                </a>
                            </div>
                        </div>
                        <div className="sidebar7__box">
                            <div className="sidebar7__category">FIL/ERC20 Market </div>
                            <div className="sidebar7__menu">
                                <Link className={window.location?.pathname === '/borrow/FIL' ? "sidebar7__item active" : "sidebar7__item"} to={'/borrow/FIL'}>
                                    <svg className="icon icon-leaderboard">
                                        <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-file`} />
                                    </svg>
                                    Borrow FIL
                                </Link>
                                <Link className={window.location?.pathname === '/borrow/requests/FIL' ? "sidebar7__item active" : "sidebar7__item"}to={'/borrow/requests/FIL'}>
                                    <svg className="icon icon-table">
                                    <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-table`} />
                                </svg>
                                Lend FIL
                                </Link>
                            </div>
                        </div>

                        <div className="sidebar7__box">
                            <div className="sidebar7__category">ERC20/FIL Market </div>
                            <div className="sidebar7__menu"><a className="sidebar7__item" href="#">
                                <svg className="icon icon-table">
                                    <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-table`} />
                                </svg
                                >Borrow ERC20</a>
                                <a className="sidebar7__item" href="#"><svg className="icon icon-file">
                                    <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-file`} />
                                </svg>
                                    Create ERC20 Loan
                                </a>
                            </div>
                        </div>
                    </div><label className="switch switch_theme"><input className="switch__input js-switch-theme" type="checkbox" /><span className="switch__in"><span className="switch__box" /><span className="switch__icon"><svg className="icon icon-moon">
                        <use xlinkHref="assets/img/sprite.svg#icon-moon" />
                    </svg><svg className="icon icon-sun">
                            <use xlinkHref="assets/img/sprite.svg#icon-sun" />
                        </svg></span></span></label>
                </div>
            </Fragment>
        )
    }
}

function mapStateToProps({ }) {
    return {}
}

export default connect(mapStateToProps)(Sidebar)