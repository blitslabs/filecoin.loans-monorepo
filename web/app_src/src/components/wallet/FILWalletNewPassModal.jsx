import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import Checkbox from 'rc-checkbox'
import 'rc-checkbox/assets/index.css'
import blake2b from 'blake2b'

// Actions
import { saveCurrentModal } from '../../actions/shared'
import { saveHashedPassword, saveTempPassword } from '../../actions/filecoin_wallet'

Modal.setAppElement('#root')

class FILWalletWarningModal extends Component {

    state = {
        btnDisabled: true
    }

    handlePasswordChange = (e) => {
        const { rpassword } = this.state
        const password = e.target.value
        this.setState({ password })
        if (password == rpassword && password.length > 8) this.setState({ btnDisabled: false })
        else this.setState({ btnDisabled: true })
    }

    hadleRPasswordChange = (e) => {
        const { password } = this.state
        const rpassword = e.target.value
        this.setState({ rpassword })
        if (password == rpassword && password.length > 8) this.setState({ btnDisabled: false })
        else this.setState({ btnDisabled: true })
    }

    handleConfirmBtn = (e) => {
        e.preventDefault()
        const { dispatch } = this.props
        const { password } = this.state
        // Hash password
        const passwordBuffer = Buffer.from(password)
        const hashedPassword = blake2b(32).update(passwordBuffer).digest('hex')
        console.log(hashedPassword)
        dispatch(saveHashedPassword(hashedPassword))
        dispatch(saveTempPassword(password))
        dispatch(saveCurrentModal('FIL_WALLET_NEW_MNEMONIC'))
    }


    render() {
        const { isOpen, toggleModal, } = this.props
        const { btnDisabled, password, rpassword } = this.state

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal('FIL_WALLET_WARNING')}
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
                    <div className="modal-title">Encryption Password</div>
                    <div style={{ margin: '12px 0px' }}>
                        <div>
                            <label className="form-label">Enter your password (At least 8 characters)</label>
                            <input onChange={this.handlePasswordChange} value={password} className="form-control" type="password" placeholder="Password" />
                        </div>
                        <div className='mt-4'>
                            <label className="form-label">Confirm your password</label>
                            <input onChange={this.hadleRPasswordChange} value={rpassword} className="form-control" type="password" placeholder="Repeat Password" />
                        </div>
                        <div className="sm_text mt-4">
                            Filecoin Loans does not store the password and cannot provide a recovery or reset function. Once the password is forgotten, you can only recover the wallet and reset the password through the backup seed words or private key.
                       </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', }}>
                        <button disabled={btnDisabled} onClick={this.handleConfirmBtn} className="btn btn_blue btn_lg">Confirm</button>
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

function mapStateToProps({ shared, settings, }) {
    return {
        shared,
        settings,

    }
}

export default connect(mapStateToProps)(FILWalletWarningModal)