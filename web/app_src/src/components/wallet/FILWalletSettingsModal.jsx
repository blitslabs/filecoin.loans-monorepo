import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import Switch from "react-switch"

// Actions
import { saveCurrentModal, saveFilNetwork } from '../../actions/shared'
import { removeFilWallet } from '../../actions/filecoin_wallet'

Modal.setAppElement('#root')

class FILWalletSettingsModal extends Component {

    state = {

    }

    componentDidMount() {

    }

    handleToggleNetworkBtn = () => {
        const { shared, dispatch } = this.props
        const filNetwork = shared?.filNetwork === 'mainnet' ? 'testnet' : 'mainnet'
        dispatch(saveFilNetwork(filNetwork))
    }

    handleResetWalletBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        // Reset Wallet
        if (!window.confirm('Are you sure you want to erase this wallet and all of its related data? You won\'t be able to recover it if you didn\'t backup your private key or seed words.')) return
        if (!window.confirm('Please confirm again.')) return
        dispatch(removeFilWallet())
        dispatch(saveCurrentModal(false))
        return
    }

    render() {
        const { isOpen, toggleModal, shared } = this.props
        const { mnemonic } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_DASHBOARD')}
                    style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px', fontWeight: 500 }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`} />
                </button>

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title mt-4 text-center">SETTINGS</div>

                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} className="mt-5">
                        <div>
                            Filecoin Network: <span style={{ fontWeight: 500 }}>{shared?.filNetwork}</span>
                        </div>
                        <Switch
                            onChange={this.handleToggleNetworkBtn}
                            checked={shared?.filNetwork === 'mainnet'}
                            onColor="#0062FF"
                        // uncheckedIcon={<i style={{}} className="fa fa-lock-open"/>}
                        />
                    </div>
                    <div className="mt-4">
                        <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_WALLET_SHOW_MNEMONIC')); }} className="btn btn_white btn_lg wallet_btn">
                            <i style={{ color: '#0062FF', marginRight: 5 }} className="fa fa-seedling" />
                            SEED WORDS
                        </button>
                        <button onClick={(e) => { e.preventDefault(); this.props.dispatch(saveCurrentModal('FIL_WALLET_SHOW_PRIVATE_KEY')); }} className="btn btn_white btn_lg wallet_btn mt-3">
                            <i style={{ color: '#0062FF', marginRight: 5 }} className="fa fa-key" />
                            PRIVATE KEY
                        </button>
                        <button onClick={this.handleResetWalletBtn} className="btn btn_white btn_lg wallet_btn mt-3">
                            <i style={{ color: '#0062FF', marginRight: 5 }} className="fa fa-sign-out-alt" />
                            RESET WALLET
                        </button>
                    </div>



                </div>
            </Modal >
        )
    }
}

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '15px',
        maxHeight: '95vh',
        minWidth: '418px',
        width: '485px',
        height: '650px',
        maxWidth: '100%',
        padding: '0px'
    },
    overlay: {
        backgroundColor: 'rgb(0 0 0 / 60%)'
    },
    parent: {
        overflow: 'hidden',
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
}

function mapStateToProps({ shared, filecoin_wallet, }) {
    return {
        shared,
        filecoin_wallet,

    }
}

export default connect(mapStateToProps)(FILWalletSettingsModal)