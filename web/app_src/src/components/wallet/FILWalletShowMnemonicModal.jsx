import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import FIL from '../../crypto/FIL'

// Actions
import { saveTempMnemonic } from '../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletShowMnemonicModal extends Component {

    state = {
        mnemonic: [],
        password: ''
    }

    async componentDidMount() {

    }

    handlePasswordChange = (e) => this.setState({ password: e.target.value })

    handleConfirmBtn = (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet } = this.props
        const { password } = this.state

        // Decrypt private key and mnemonic with password
        const response = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (response?.status != 'OK') {
            return
        }
        // console.log(response)

        this.setState({ mnemonic: [...response?.payload?.mnemonic?.split(' ')] })

    }


    render() {
        const { isOpen, toggleModal } = this.props
        const { mnemonic, password } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_SETTINGS')}
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

                <div style={{ padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title mt-4 text-center">SEED WORDS</div>
                    <div className="mt-4" style={{ margin: '0px 0px' }}>
                        {
                            mnemonic?.length == 0 &&
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
                                <label className="form-label">Enter your password to reveal your mnemonic:</label>
                                <input value={password} onChange={this.handlePasswordChange} className="form-control" type="password" placeholder="Password" />
                                <button onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg mt-4">Confirm</button>
                            </div>
                        }
                        <div style={{ visibility: mnemonic.length == 0 ? 'hidden' : 'visible' }} className="mnemonic_container">
                            {
                                mnemonic.map((w, i) => (
                                    <div key={i} className="mnemonic_word">{w}</div>

                                ))
                            }
                        </div>
                        {
                            mnemonic?.length > 0 &&
                            <div style={{ textAlign: 'justify' }} className="sm_text mt-4 ">
                                Please copy and keep it in a safe place. Seed words or private keys are the only way to restore your wallet. Once lost, it cannoy be retrieved. Do not use screenshots to save it.
                            </div>
                        }


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

export default connect(mapStateToProps)(FILWalletShowMnemonicModal)