import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import Checkbox from 'rc-checkbox'
import 'rc-checkbox/assets/index.css'
import blake2b from 'blake2b'
import FIL from '../../crypto/FIL'
import CryptoJS from 'crypto-js'

// Actions
import {
    saveEncryptedWallet, savePublicKey,
    removeTempPassword, removeTempMnemonic
} from '../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../actions/shared'

Modal.setAppElement('#root')

class FILWalletConfirmMnemonicModal extends Component {

    state = {
        words: [],
        shuffledWords: [],
        mnemonic: [],
        isMnemonicOrderValid: false
    }

    componentDidMount() {
        const { filecoin_wallet } = this.props
        console.log(filecoin_wallet?.temp_mnemonic)
        this.prepareData(filecoin_wallet?.temp_mnemonic)
    }

    prepareData = (data) => {
        let words = data.trim().split(' ')
        this.setState({
            shuffledWords: this.shuffle(words)
            // words: words, isMnemonicOrderValid: true
        })
    }

    shuffle = (array) => {
        let i = array.length - 1
        for (; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
        return array
    }

    handleAddWordBtn = (word) => {
        let { words, shuffledWords, isMnemonicOrderValid } = this.state
        let { filecoin_wallet, dispatch } = this.props
        let mnemonic = filecoin_wallet?.temp_mnemonic

        if (isMnemonicOrderValid) return

        // Remove from shuffled words
        shuffledWords = shuffledWords.filter(w => w !== word)
        this.setState({ shuffledWords })

        // Add to words
        words = [...words, word]
        this.setState({ words })

        // Check if mnemonic order is correct
        if (shuffledWords.length === 0) {
            let i = 0
            let isMnemonicOrderValid = true
            mnemonic = mnemonic.trim().split(' ')

            for (let w of words) {
                if (w != mnemonic[i]) {
                    isMnemonicOrderValid = false
                    break
                }
                i++
            }

            if (isMnemonicOrderValid) {
                this.setState({ isMnemonicOrderValid })
            }
        }
    }

    handleRemoveWordBtn = (word) => {
        const { words, shuffledWords, isMnemonicOrderValid } = this.state

        if (isMnemonicOrderValid) return

        // Remove from words
        this.setState({
            words: words.filter(w => w !== word)
        })

        // Add to shuffled words
        this.setState({
            shuffledWords: [...shuffledWords, word]
        })
    }


    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { dispatch, filecoin_wallet } = this.props

        const filecoin_signer = await FIL.signer()

        // BIP44 Derivation path
        const path = "m/44'/461'/0'/0/1"

        // Generate public & private key from mnemonic
        const keypair = filecoin_signer.keyDerive(filecoin_wallet?.temp_mnemonic, path, "")

        // TODO: change this   
        const address = {
            mainnet: keypair?.address,
            testnet: 't' + keypair?.address.substring(1, keypair?.address?.length)
        }

        const wallet_data = {
            address,
            private_base64: keypair?.private_base64,
            private_hexstring: keypair?.private_hexstring,
            mnemonic: filecoin_wallet?.temp_mnemonic
        }

        // Encrypt private key and mnemonic with password
        const encryptedWallet = CryptoJS.AES.encrypt(JSON.stringify(wallet_data), filecoin_wallet?.temp_password).toString()

        // Save public key and encrypted data
        dispatch(saveEncryptedWallet(encryptedWallet))
        dispatch(savePublicKey(address))

        // Remove temp mnemonic and temp password
        dispatch(removeTempPassword())
        dispatch(removeTempMnemonic())
        
        // Go to main wallet screen        
        dispatch(saveCurrentModal('FIL_WALLET_DASHBOARD'))
    }


    render() {
        const { isOpen, toggleModal, filecoin_wallet } = this.props
        const { words, shuffledWords, isMnemonicOrderValid } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_NEW_MNEMONIC')}
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
                    <div className="modal-title">SEED WORDS VERIFICATION</div>
                    <div style={{ margin: '0px 0px' }}>
                        <div className="mnemonic_container">
                            {
                                words.map((w, i) => (
                                    <button onClick={(e) => { e.preventDefault(); this.handleRemoveWordBtn(w); }} key={i} className="mnemonic_word">{w}</button>
                                ))
                            }

                        </div>
                        <div style={{ border: 'none' }} className="mnemonic_container">
                            {
                                shuffledWords.map((w, i) => (
                                    <button onClick={(e) => { e.preventDefault(); this.handleAddWordBtn(w); }} key={i} className="mnemonic_word">{w}</button>
                                ))
                            }
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
                        <button disabled={!isMnemonicOrderValid} onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg mt-2">Confirm</button>
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

export default connect(mapStateToProps)(FILWalletConfirmMnemonicModal)