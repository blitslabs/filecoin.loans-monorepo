import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import Checkbox from 'rc-checkbox'
import 'rc-checkbox/assets/index.css'
import blake2b from 'blake2b'
import FIL from '../../crypto/FIL'
import * as bip39 from 'bip39'
// Actions
import { saveTempMnemonic } from '../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletNewMnemonicModal extends Component {

    state = {
        mnemonic: []
    }

    async componentDidMount() {
        this.generateMnemonic()
    }

    generateMnemonic = async () => {      
        const { dispatch }  = this.props
        const mnemonic = bip39.generateMnemonic()
        this.setState({ mnemonic: mnemonic.split(' ') })
        dispatch(saveTempMnemonic(mnemonic))
    }

    handleConfirmBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        dispatch(saveCurrentModal('FIL_WALLET_CONFIRM_MNEMONIC'))
    }


    render() {
        const { isOpen, toggleModal } = this.props
        const { mnemonic } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_NEW_PASSWORD')}
                    style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img
                        src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`}
                    />
                </button>

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title">SEED WORDS</div>
                    <div style={{ margin: '0px 0px' }}>
                        <div className="mnemonic_container">
                            {
                                mnemonic.map((w, i) => (
                                    <div key={i} className="mnemonic_word">{w}</div>
                                ))
                            }

                        </div>
                        <div style={{ textAlign: 'justify' }} className="sm_text mt-4 ">
                            Please copy and keep it in a safe place. Seed words or private keys are the only way to restore your wallet. Once lost, it cannoy be retrieved. Do not use screenshots to save it.
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
                        <button onClick={(e) => { e.preventDefault(); this.generateMnemonic(); }} className="btn btn_white btn_lg">Regenerate</button>
                        <button onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg mt-2">Confirm</button>
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
        maxHeight: '95vh',
        minWidth: '418px',
        width: '425px',
        height: '550px',
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

export default connect(mapStateToProps)(FILWalletNewMnemonicModal)