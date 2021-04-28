import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'

// Libraries
import { EXPLORER } from '../../crypto/Networks'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import QRCode from 'qrcode.react'
import { toast } from 'react-toastify'

Modal.setAppElement('#root')

class AccountModal extends Component {

    state = {
        copied: false
    }

    handleOnCopy = () => {
        toast.success('Address copied!', { position: "top-right", autoClose: 5000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, });
    }

    render() {
        const { isOpen, toggleModal, shared } = this.props
        const { copied } = this.state

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
                    <div className="modal-title mt-4 text-center">{shared?.nativeToken} ADDRESS</div>

                    <div className="mt-5" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="box">
                            <QRCode value={shared?.account} />
                        </div>
                    </div>
                    <div style={{ fontWeight: 500 }} className="mt-5 text-center">{shared?.account}</div>
                    <div className="mt-4 mb-4">
                        <CopyToClipboard text={shared?.account} onCopy={this.handleOnCopy}>
                            <button className="btn btn_white btn_lg" style={{ width: '100%', color: '#0062FF' }}>Copy Address</button>
                        </CopyToClipboard>
                    </div>
                </div>
            </Modal>
            // <Modal
            //     isOpen={isOpen}
            //     style={customStyles}
            //     onRequestClose={() => toggleModal(false)}
            // >
            //     <div className="row">
            //         <div className="col-sm-12">

            //             <button
            //                 onClick={() => toggleModal(false)}
            //                 style={{ right: '20px', top: '20px', position: 'absolute', padding: '5px' }}
            //             >
            //                 <i style={{ color: 'rgb(31, 199, 212)', fontSize: 18 }} className="fa fa-times"></i>
            //             </button>

            //             <div style={{ borderBottom: '1px solid rgb(233, 234, 235)', paddingBottom: 25 }}>
            //                 <h5 className="black" style={{ fontWeight: 600 }}>Your wallet</h5>
            //             </div>

            //             <div className="mt-4" style={{ textAlign: 'left' }}>
            //                 <div className="black" style={{ fontWeight: 'bold', lineHeight: '1.5', fontSize: 18 }}>{shared?.account}</div>
            //             </div>

            //             <div className="row mt-2">
            //                 <div className="col-sm-4">
            //                     <a target="_blank" href={EXPLORER[shared?.networkId] + 'address/' + shared?.account} className={'btn-text'}>View on Explorer <i style={{ color: '#27c7d5', fontSize: 16, }} className="fa fa-external-link-alt"></i></a>
            //                 </div>
            //                 <div className="col-sm-8" style={{ display: 'flex', flexDirection: 'row', }}>
            //                     <CopyToClipboard text={shared?.account}
            //                         onCopy={() => this.setState({ copied: true })}>
            //                         <button className={'btn-text'}>Copy Address <i style={{ color: '#27c7d5', fontSize: 16 }} className="fa fa-external-link-alt"></i></button>
            //                     </CopyToClipboard>
            //                     {
            //                         copied &&
            //                         <div className="black" style={{ fontWeight: 'bold' }}>copied!</div>
            //                     }
            //                 </div>
            //             </div>

            //             <div className="row mt-4 mb-2">
            //                 <div className="col-sm-4 offset-sm-4 text-center">
            //                     <div className="row">
            //                         <div className="col-sm-8 offset-sm-2">
            //                             <div className="btn-outline">Logout</div>
            //                         </div>
            //                     </div>
            //                 </div>
            //             </div>

            //         </div>
            //     </div>
            // </Modal>
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

function mapStateToProps({ shared }) {
    return {
        shared,
        
    }
}

export default connect(mapStateToProps)(AccountModal)