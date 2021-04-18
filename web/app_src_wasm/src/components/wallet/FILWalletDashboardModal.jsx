import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import FIL from '../../crypto/FIL'
import BigNumber from 'bignumber.js'

// Actions
import { saveTempMnemonic } from '../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletDashboardModal extends Component {

    state = {
        selectedTab: 'Completed'
    }

    async componentDidMount() {

        try {
            const { shared } = this.props

            const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)

            const version = await filecoin.getLotusVersion()

            console.log('version: ', version)
        } catch (e) {
            console.log(e)
        }
    }

    handleSendBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_SEND'))
    }

    handleReceiveBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_RECEIVE'))
    }

    handleTxClick = (txId) => {
        console.log(txId)
        const { shared } = this.props
        window.open(FIL.getTxExplorerUrl(txId, shared?.filNetwork))
    }

    render() {
        const { selectedTab } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet } = this.props
        const account = filecoin_wallet?.public_key[shared?.filNetwork]
        const txs = selectedTab === 'Completed' ? Object.values(filecoin_wallet?.txs?.[shared?.filNetwork]) : Object.values(filecoin_wallet?.pending_txs?.[shared?.filNetwork])
        
        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_SETTINGS')}
                    style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px', fontWeight: 500 }}
                >
                    <i className="fa fa-cog" style={{ marginRight: 5 }}></i>
                    Settings
                </button>

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title mt-4 text-center">FILECOIN WALLET</div>
                    <div className="wallet_balance_container mt-2">
                        <div className="balance_text">{parseFloat(filecoin_wallet?.balance[shared?.filNetwork]).toFixed(2)} FIL</div>
                        <div className="balance_subtitle">Current Balance</div>
                    </div>
                    <div className="wallet_btns_container mt-2">
                        <div className="wallet_btn_container">
                            <button onClick={this.handleSendBtn} className="btn btn_white btn_lg wallet_btn"><i style={{ color: '#0062FF', marginRight: 5 }} className="fa fa-arrow-alt-circle-up" />Send</button>
                        </div>
                        <div style={{ marginLeft: 10 }} className="wallet_btn_container">
                            <button onClick={this.handleReceiveBtn} className="btn btn_white btn_lg wallet_btn"><i style={{ color: '#0062FF', marginRight: 5 }} className="fa fa-arrow-alt-circle-down" />Receive</button>
                        </div>
                    </div>
                    <div className="wallet_txs_container mt-3">
                        <div className="wallet_txs_tabs_container mt-3 mb-3">
                            <div style={{ flexDirection: 'row', display: 'flex' }} className="wallet_tabs_container">
                                <button onClick={() => this.setState({ selectedTab: 'Completed' })}>
                                    <div className={selectedTab === 'Completed' ? "tab_title tab_active" : "tab_title"} style={{ marginRight: 15 }}>Completed</div>
                                </button>
                                <button onClick={() => this.setState({ selectedTab: 'Pending' })}>
                                    <div className={selectedTab === 'Pending' ? "tab_title tab_active" : "tab_title"}>Pending</div>
                                </button>
                            </div>
                            <div className="wallet_tabs_container">
                                {/* <div className="tab_title">Refresh <i className="fa fa-sync-alt"></i></div> */}
                            </div>
                        </div>
                        <div style={{ display: 'flex', height: 320, flexDirection: 'column', overflowY: 'auto', }}>
                            {
                                txs?.length == 0
                                    ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '320px' }}>No transactions found</div>
                                    :
                                    txs?.map((tx, i) => {

                                        const direction = tx?.From?.toUpperCase() == account?.toUpperCase() ? 'Sent' : 'Received'
                                        let amount = BigNumber(tx?.Value).dividedBy(1e18).toString()
                                        amount = !isNaN(amount) ? amount : '0'

                                        return (
                                            <div onClick={(e) => this.handleTxClick(tx?.CID['/'])} key={i} className="tx_row_container" >
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '10%' }}>
                                                    <div className={direction === 'Received' ? "tx_icon_container received" : "tx_icon_container sent"}>
                                                        <i className={direction === 'Received' ? "fa fa-arrow-down" : "fa fa-arrow-up"}></i>
                                                    </div>
                                                </div>
                                                <div className="tx_details_container">
                                                    <div className="tx_direction">{direction}</div>
                                                    <div className="tx_amount">{direction == 'Received' ? '+' : '-'}{amount} FIL</div>
                                                </div>
                                                <div className="tx_row_right_container">
                                                    <i className="fa fa-chevron-right"></i>
                                                </div>
                                            </div>

                                        )
                                    })
                            }
                        </div>
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

export default connect(mapStateToProps)(FILWalletDashboardModal)