import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
Modal.setAppElement('#root')


// Components
import CreateWalleIntro from './CreateWalletIntro'

class FILWalletModal extends Component {
    render() {
        const { isOpen, toggleModal, } = this.props

        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '20px', top: '20px', position: 'absolute', padding: '5px' }}
                >
                    <i style={{ color: 'rgb(31, 199, 212)', fontSize: 18 }} className="fa fa-times"></i>
                </button>

                <CreateWalleIntro/>
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
        borderRadius: '24px',
        maxHeight: '100vh',
        minWidth: '418px',
        width: '418px',
        // height: '590px',
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

function mapStateToProps({ shared, settings,  }) {
    return {
        shared,
        settings,
        
    }
}

export default connect(mapStateToProps)(FILWalletModal)