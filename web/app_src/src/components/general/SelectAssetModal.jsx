import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

Modal.setAppElement('#root')

class SelectAssetModal extends Component {

    state = {

    }

    componentDidMount() {

    }


    render() {
        const { isOpen, toggleModal, onAssetSelect, shared, balances, loanAssets } = this.props
        const { } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <div className="row">
                    <div className="col-sm-12">

                        <button
                            onClick={() => toggleModal(false)}
                            style={{ right: '10px', top: '15px', position: 'absolute', padding: '5px' }}
                        >
                            <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                        </button>

                        <div style={{ padding: '20px 20px 25px 20px' }}>
                            <div className="modal-title mt-4 text-center">SELECT ASSET</div>
                        </div>

                        <div className="mt-3" style={{ position: 'relative', height: '715px', width: '100%', overflow: 'auto', willChange: 'transform', direction: 'ltr' }}>

                            {
                                Object.values(loanAssets).length > 0 &&
                                Object.values(loanAssets).map((a, i) => (
                                    <button onClick={(e) => { e.preventDefault(); onAssetSelect(a?.symbol, a?.contractAddress) }} key={i} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'row', height: 56, width: '100%', padding: '4px 20px', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <div><img className="asset_logo_sm" src={`${process.env.REACT_APP_SERVER_HOST}/images/logos/${a?.symbol}.png`} /></div>
                                            <div style={{ marginLeft: '8px', fontWeight: '500', color: 'black', lineHeight: 1.5, fontSize: '16px' }}>{a?.symbol}</div>
                                        </div>
                                        <div className="text-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '500' }}>
                                            {!isNaN(balances[a?.contractAddress]) ? parseFloat(balances[a?.contractAddress]).toFixed(3) : '0'}
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </Modal>
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
        maxHeight: '100vh',
        minWidth: '358px',
        width: '418px',
        maxWidth: '100%',
        height: '400px',
        overflow: 'hidden',
        padding: '0px',
        zIndex: '2000'
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

function mapStateToProps({ shared, filecoin_wallet, balances, loanAssets }) {
    return {
        shared,
        filecoin_wallet,
        balances,
        loanAssets
    }
}

export default connect(mapStateToProps)(SelectAssetModal)