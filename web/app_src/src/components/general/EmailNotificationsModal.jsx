import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import { toast } from 'react-toastify'

// Actions
import { saveNotificationEmail } from '../../actions/shared'

// API
import { saveEmailNotification } from '../../utils/api'

Modal.setAppElement('#root')

class EmailNotificationModal extends Component {

    state = {
        email: '',
        emailErrorMsg: '',
        emailIsInvalid: false,
        emailSaved: false
    }

    componentDidMount() {

    }

    handleEmailChange = (e) => {
        const email = e.target.value

        this.setState({
            email,
            emailIsInvalid: false
        })
    }

    handleSaveBtn = (e) => {
        e.preventDefault()
        const { email } = this.state
        const { shared, dispatch } = this.props

        if (!this.validateEmail(email)) {
            this.setState({ emailIsInvalid: true, emailErrorMsg: 'Invalid email address' })
            return
        }

        const params = {
            email,
            account: shared?.account
        }

        saveEmailNotification(params)
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res?.status === 'OK') {
                    this.setState({ email: '', emailSaved: true })
                    dispatch(saveNotificationEmail(params))
                    toast.success('Email Saved', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
                }
            })
            .catch((e) => {
                console.log(e)
                toast.error('Error saving email', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
            })
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    render() {
        const { email, emailIsInvalid, emailErrorMsg, emailSaved } = this.state
        const { isOpen, toggleModal, filecoin_wallet, shared } = this.props

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >


                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 36px', height: '100%' }}>
                    <div className="modal-title mt-4 text-center">RECEIVE EMAIL NOTIFICATIONS</div>

                    {
                        !emailSaved
                            ?
                            <Fragment>
                                <div className="mt-4"  >
                                    <div style={{ fontWeight: 500, fontSize: 16 }}>Enter your email address to receive notifications when the status of your loans change</div>
                                    <label className="form-label mt-4">Enter your email address:</label>
                                    <div className="input-group">
                                        <input value={email} onChange={this.handleEmailChange} placeholder="Email" className={emailIsInvalid ? "form-control is-invalid" : "form-control"} type="email" />
                                        <div className="invalid-feedback">
                                            {emailErrorMsg}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 mb-2">

                                    <button onClick={this.handleSaveBtn} disabled={!email} className="btn btn_blue btn_lg" style={{ width: '100%', }}>Save</button>

                                </div>
                            </Fragment>
                            :
                            <div className="col-12 text-center">
                                <div className="mt-4" style={{ fontWeight: 500, fontSize: 16 }}>Email Saved! You'll receive notifications when the status of any of your loans is updated</div>

                                <div style={{ margin: '40px 0px' }}>
                                    <i style={{ color: '#0062FF', fontSize: '70px' }} className="fa fa-check"></i>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-12 text-center">
                                        <button style={{ width: '100%' }} className="btn btn_white btn_lg" onClick={() => toggleModal(false)}>Close</button>
                                    </div>
                                </div>
                            </div>
                    }


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
        width: '485px',
        // height: '650px',
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

export default connect(mapStateToProps)(EmailNotificationModal)