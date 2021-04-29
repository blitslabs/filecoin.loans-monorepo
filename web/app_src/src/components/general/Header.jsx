import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import Gravatar from 'react-gravatar'

// Libraries
import Web3 from 'web3'

// Modals
import FILWalletIntroModal from '../wallet/FILWalletIntroModal'
import FILWalletWarningModal from '../wallet/FILWalletWarningModal'
import FILWalletNewPassModal from '../wallet/FILWalletNewPassModal'
import FILWalletNewMnemonicModal from '../wallet/FILWalletNewMnemonicModal'
import FILWalletConfirmMnemonicModal from '../wallet/FILWalletConfirmMnemonicModal'
import FILWalletDashboardModal from '../wallet/FILWalletDashboardModal'
import FILWalletSendModal from '../wallet/FILWalletSendModal'
import FILWalletReceiveModal from '../wallet/FILWalletReceiveModal'
import FILWalletConfirmTxModal from '../wallet/FILWalletConfirmTxModal'
import FILWalletSettingsModal from '../wallet/FILWalletSettingsModal'
import FILWalletShowMnemonicModal from '../wallet/FILWalletShowMnemonicModal'
import FILWalletShowPrivateKeyModal from '../wallet/FILWalletShowPrivateKeyModal'
import AccountModal from '../general/AccountModal'

// Actions
import { saveCurrentModal, saveNetwork, saveAccount } from '../../actions/shared'

class Header extends Component {

    componentDidMount() {
        // console.log('MOUNTED')
        const { dispatch } = this.props
        dispatch(saveCurrentModal(false))
    }

    toggleModal = (modalName) => {
        const { dispatch } = this.props
        dispatch(saveCurrentModal(modalName))
    }

    handleConnectFILBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_INTRO'))
    }

    handleConnectMetamaskBtn = async (e) => {
        e.preventDefault()
        const { dispatch } = this.props

        if (!window.ethereum) return

        try {
            await window.ethereum.enable()
        } catch (e) {
            console.log(e)
            return
        }

        let web3, accounts
        try {
            web3 = new Web3(window.ethereum)
            accounts = await web3.eth.getAccounts()
        } catch (e) {
            console.log(e)
            return
        }

        let networkId
        try {
            networkId = await web3.eth.net.getId()
        } catch (e) {
            console.log(e)
            return
        }

        dispatch(saveNetwork(networkId))
        dispatch(saveAccount(accounts[0]))
    }

    handleOpenFILBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_DASHBOARD'))
    }

    handleFILPendingTxsBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_DASHBOARD'))
    }

    render() {
        const { shared, filecoin_wallet, balances } = this.props
        const totalPendingTxs = Object.values(filecoin_wallet?.pending_txs[shared?.filNetwork]).length ?? 0

        return (
            <Fragment>
                <div className="header7 js-header7"><button className="header7__burger js-header7-burger"><svg className="icon icon-burger">
                    <use xlinkHref="assets/img/sprite.svg#icon-burger" />
                </svg></button>
                    <a className="header7__logo" href="#">
                        <img className="header7__pic header7__pic_black" src={`${process.env.REACT_APP_SERVER_HOST}/images/logo.svg`} />
                        <img className="header7__pic header7__pic_white" src={`${process.env.REACT_APP_SERVER_HOST}/images/logo_white.svg`} />
                    </a>
                    <div className="header7__search">
                    </div>
                    <div className="header7__control">
                        {/* <button className="header7__notifications active">
                            <svg className="icon icon-bell">
                                <use xlinkHref={`${process.env.REACT_APP_SERVER_HOST}/assets/img/sprite.svg#icon-bell`} />
                            </svg>
                        </button> */}

                        {
                            totalPendingTxs > 0 &&
                            <button onClick={this.handleFILPendingTxsBtn} className="header__btn btn btn_blue">
                                <i className="fa fa-clock" style={{ marginRight: 5, }}></i>
                                <span className="btn__text">Pending FIL Txs: 1</span>
                            </button>
                        }

                        {
                            !filecoin_wallet?.public_key[shared?.filNetwork]
                                ?
                                <button onClick={this.handleConnectFILBtn} className="header__btn btn btn_blue">
                                    <i className="fa fa-plug" style={{ marginRight: 5 }}></i>
                                    <span className="btn__text">Connect Filecoin</span>
                                </button>
                                :
                                <button onClick={this.handleOpenFILBtn} className="header7__user" href="#" style={{ marginRight: 20 }}>
                                    <div className="ava"><img className="ava__pic" src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} /></div>
                                    <div className="header7__box">
                                        <div className="header7__man" style={{ textAlign: 'left' }}>{parseFloat(filecoin_wallet?.balance[shared?.filNetwork]).toFixed(2)} FIL</div>
                                        <div className="header7__post">{filecoin_wallet?.public_key[shared?.filNetwork]?.substring(0, 6)}...{filecoin_wallet?.public_key[shared?.filNetwork]?.substring(filecoin_wallet?.public_key[shared?.filNetwork]?.length - 6, filecoin_wallet?.public_key[shared?.filNetwork]?.length)}</div>
                                    </div>
                                </button>
                        }

                        {
                            !shared?.account
                                ?
                                <button onClick={this.handleConnectMetamaskBtn} className="header__btn btn btn_blue">
                                    <i className="fa fa-plug" style={{ marginRight: 5 }}></i>
                                    <span className="btn__text">Connect Metamask</span>
                                </button>

                                :
                                <button className="header7__user" onClick={() => this.props.dispatch(saveCurrentModal('ACCOUNT_MODAL'))}>
                                    <div className="ava">
                                        {/* <img className="ava__pic" src={`${process.env.REACT_APP_SERVER_HOST}/images/filecoin-logo.svg`} /> */}
                                        <Gravatar
                                            email={"test"}
                                            size={30}
                                            rating="pg" default="retro"
                                            className="ava__pic"
                                        />
                                    </div>
                                    <div className="header7__box">
                                        <div className="header7__man" style={{ textAlign: 'left' }}>{parseFloat(balances?.[shared?.nativeToken]).toFixed(2)} {shared?.nativeToken}</div>
                                        <div className="header7__post">{shared?.account?.substring(0, 6)}...{shared?.account?.substring(shared?.account?.length - 6, shared?.account?.length)}</div>
                                    </div>
                                </button>
                        }

                    </div>
                    <div className="header7__bg js-header7-bg" />
                </div>

                {
                    shared?.currentModal === 'FIL_WALLET_INTRO' &&
                    <FILWalletIntroModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_INTRO'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_WARNING' &&
                    <FILWalletWarningModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_WARNING'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_NEW_PASSWORD' &&
                    <FILWalletNewPassModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_NEW_PASSWORD'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_NEW_MNEMONIC' &&
                    <FILWalletNewMnemonicModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_NEW_MNEMONIC'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_CONFIRM_MNEMONIC' &&
                    <FILWalletConfirmMnemonicModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_CONFIRM_MNEMONIC'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_DASHBOARD' &&
                    <FILWalletDashboardModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_DASHBOARD'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_SEND' &&
                    <FILWalletSendModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_SEND'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_RECEIVE' &&
                    <FILWalletReceiveModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_RECEIVE'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_CONFIRM_TX' &&
                    <FILWalletConfirmTxModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_CONFIRM_TX'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_SETTINGS' &&
                    <FILWalletSettingsModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_SETTINGS'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_SHOW_MNEMONIC' &&
                    <FILWalletShowMnemonicModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_SHOW_MNEMONIC'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'FIL_WALLET_SHOW_PRIVATE_KEY' &&
                    <FILWalletShowPrivateKeyModal
                        isOpen={shared?.currentModal === 'FIL_WALLET_SHOW_PRIVATE_KEY'}
                        toggleModal={this.toggleModal}
                    />
                }

                {
                    shared?.currentModal === 'ACCOUNT_MODAL' &&
                    <AccountModal
                        isOpen={shared?.currentModal === 'ACCOUNT_MODAL'}
                        toggleModal={this.toggleModal}
                    />
                }

            </Fragment>
        )
    }
}

function mapStateToProps({ shared, filecoin_wallet, balances }) {
    return {
        shared,
        filecoin_wallet,
        balances
    }
}

export default connect(mapStateToProps)(Header)