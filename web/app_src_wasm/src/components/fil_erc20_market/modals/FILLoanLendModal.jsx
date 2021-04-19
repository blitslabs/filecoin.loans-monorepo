import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import Modal from 'react-modal'
import Stepper from 'react-stepper-horizontal'

// Libraries
import FIL from '../../../crypto/FIL'
import BigNumber from 'bignumber.js'
import ETH from '../../../crypto/ETH'
import ERC20CollateralLock from '../../../crypto/ERC20CollateralLock'
import Web3 from 'web3'


// Actions
import { savePendingTx } from '../../../actions/filecoin_wallet'
import { saveCurrentModal } from '../../../actions/shared'
import { saveTx } from '../../../actions/txs'

// API
import { confirmLendOperation } from '../../../utils/api'

Modal.setAppElement('#root')
const web3 = new Web3()
BigNumber.set({ EXPONENTIAL_AT: 25 })

class FILLoanLendModal extends Component {

    state = {
        modalState: 0,
        signLoading: false,
        lendLoading: false,
        secretHashB1: '',
        password: '',
        passwordIsInvalid: false,
        passwordErrorMsg: ''
    }

    async componentDidMount() {
    }

    loadingIndicator = <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white" className="loading-img-sm"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>

    handleSignBtn = async (e) => {
        e.preventDefault()
        const { prepareTx, protocolContracts, shared, dispatch } = this.props
        const collateralLockContract = protocolContracts?.[shared?.networkId]?.ERC20CollateralLock?.address
        this.setState({ signLoading: true })

        let collateralLock
        try {
            collateralLock = new ERC20CollateralLock(collateralLockContract)
        } catch (e) {
            console.log(e)
            return
        }

        const account = (await ETH.getAccount())?.payload
        const userLoansCount = await collateralLock.getUserLoansCount(account)
        console.log(userLoansCount)

        if (userLoansCount?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        const message = `You are signing this message to generate the secrets for the Hash Time Locked Contracts required to lend. Nonce: ${parseInt(userLoansCount?.payload) + 1}. Contract: ${collateralLockContract}`
        const secretData = await ETH.generateSecret(message)
        console.log(secretData)

        if (secretData?.status !== 'OK') {
            this.setState({ signLoading: false })
            return
        }

        this.setState({
            ethLender: account,
            secretHashB1: secretData?.payload?.secretHash,
            secretB1: secretData?.payload?.secret,
            modalState: 1,
            signLoading: false
        })
        console.log(secretData)
    }

    handlePasswordChange = (e) => this.setState({ password: e.target.value, passwordIsInvalid: false })

    handleConfirmBtn = async (e) => {
        e.preventDefault()
        const { shared, filecoin_wallet, loanDetails, dispatch, loanId } = this.props
        const { password, ethLender, secretHashB1 } = this.state

        // Decrypt wallet
        const wallet = FIL.decryptWallet(filecoin_wallet?.encrypted_wallet, password)

        if (wallet?.status !== 'OK') {
            this.setState({ passwordIsInvalid: true, passwordErrorMsg: 'Invalid password' })
            return
        }

        this.setState({ modalState: 2 })

        // Prepare Payment Channel Data
        const filBorrower = loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : ''


        const filecoin = new FIL(shared?.filEndpoint, shared?.filToken)
        const tx = await filecoin.createPaymentChannel(
            filBorrower, // to
            loanDetails?.collateralLock?.principalAmount, // amount
            wallet?.payload?.private_base64, // privateKey
            shared?.filNetwork // filecoin network
        )
        console.log(tx)

        if (tx?.status !== 'OK') {
            this.setState({ modalState: 4 })
            return
        }

        // IDAddress t011700
        // RobustAddress t2wpvxgv7m4po3zfuduu6bttk52hb2bk3yvx5ub7y

        const paymentChannelId = tx?.payload?.data?.ReturnDec?.IDAddress
        const paymentChannelAddress = tx?.payload?.data?.ReturnDec?.RobustAddress

        const message = {
            loanId: loanId,
            contractLoanId: loanDetails?.collateralLock?.contractLoanId,
            erc20CollateralLock: loanDetails?.collateralLock?.collateralLockContractAddress,
            CID: tx?.payload?.CID,
            paymentChannelId,
            paymentChannelAddress,
            ethLender,
            filLender: filecoin_wallet?.public_key?.[shared?.filNetwork],
            ethBorrower: loanDetails?.collateralLock?.borrower,
            filBorrower,
            secretHashB1,
            principalAmount: loanDetails?.collateralLock?.principalAmount,
            network: shared?.filNetwork,
            collateralNetwork: loanDetails?.collateralLock?.networkId
        }

        const signature = FIL.signMessage(JSON.stringify(message), wallet?.payload?.private_base64)

        console.log('message: ', message)
        console.log('signature: ', signature)

        this.confirmOpInterval = setInterval(async () => {
            confirmLendOperation({ assetType: 'FIL', message, signature })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res)
                    
                    if (res.status === 'OK') {
                        clearInterval(this.confirmOpInterval)
                        // Save Tx
                        dispatch(saveTx({
                            receipt: tx?.payload,
                            txHash: tx?.payload?.CID['/'],
                            from: filecoin_wallet?.public_key?.[shared?.filNetwork],
                            summary: `Create a Payment Channel with ${filBorrower} and lock ${loanDetails?.collateralLock?.principalAmount} FIL`
                        }))

                        // Send Message & signature to API
                        this.setState({ modalState: 3, txHash: tx?.payload.CID['/'] })
                    }
                })
        }, 3000)
    }

    render() {
        const {
            signLoading, lendLoading, modalState,
            password, passwordIsInvalid, passwordErrorMsg,
            explorer
        } = this.state
        const { isOpen, toggleModal, shared, filecoin_wallet, loanId, loanDetails, prices } = this.props
        const emptyAddress = '0x0000000000000000000000000000000000000000'
        const filBorrower = loanDetails?.collateralLock?.filBorrower && loanDetails?.collateralLock?.filBorrower != '0x' ? web3.utils.toUtf8(loanDetails?.collateralLock?.filBorrower) : '-'
        const borrower = loanDetails?.collateralLock?.borrower && loanDetails?.collateralLock?.borrower != emptyAddress ? loanDetails?.collateralLock.borrower : '-'

        let collateralizationRatio = parseFloat(BigNumber(loanDetails?.collateralLock?.collateralAmount).dividedBy(BigNumber(loanDetails?.collateralLock?.principalAmount).multipliedBy(prices?.FIL?.usd)).multipliedBy(100)).toFixed(2)
        collateralizationRatio = !isNaN(collateralizationRatio) ? collateralizationRatio : '-'


        return (
            <Modal
                isOpen={isOpen}
                style={customStyles}
                onRequestClose={() => toggleModal(false)}
            >
                {
                    modalState == 1 &&
                    <button
                        onClick={() => this.setState({ modalState: 0 })}
                        style={{ left: '10px', top: '10px', position: 'absolute', padding: '5px', fontWeight: 500 }}
                    >
                        <img
                            src={`${process.env.REACT_APP_SERVER_HOST}/images/navigate_before_24px.png`}
                        />
                    </button>
                }

                <button
                    onClick={() => toggleModal(false)}
                    style={{ right: '10px', top: '10px', position: 'absolute', padding: '5px' }}
                >
                    <img src={`${process.env.REACT_APP_SERVER_HOST}/images/close_24px.png`} />
                </button>

                <div style={{ padding: '24px 48px', height: '100%', }}>
                    <div className="modal-title mt-2 text-center">LEND FIL</div>

                    {
                        modalState != 2 &&
                        <Stepper
                            activeStep={modalState}
                            steps={[
                                { title: 'Sign Message' },
                                { title: 'Create Payment Channel' },
                                { title: 'Wait for Borrower' },
                            ]}
                        />
                    }


                    {
                        modalState == 0 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16 }}>
                                You are lending {loanDetails?.collateralLock?.principalAmount} FIL to:
                            </div>

                            <div className="mt-4">
                                <div>Borrower's FIL Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{filBorrower}</div>
                            </div>

                            <div className="mt-4">
                                <div>Borrower's ETH Account</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{borrower}</div>
                            </div>

                            <div className="mt-4">
                                <div>Collateral</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{loanDetails?.collateralLock?.collateralAmount}</div>
                            </div>

                            <div className="mt-4">
                                <div>Collateralization Ratio</div>
                                <div className="mt-2" style={{ fontWeight: 600, fontSize: 16 }}>{collateralizationRatio}%</div>
                            </div>


                            <div className="mt-4">
                                To continue click `Sign` to generate the secret required to seize the borrower's collateral in case of default.
                            </div>

                            <div className="mt-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', }}>
                                <div style={{ flex: 1 }}>
                                    <button disabled={signLoading} onClick={this.handleSignBtn} className="btn btn_blue btn_lg">
                                        {
                                            signLoading
                                                ? <span>Signing {this.loadingIndicator}</span>
                                                : 'Sign'
                                        }
                                    </button>
                                </div>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 1 &&
                        <Fragment>
                            <div className="mt-4" style={{ fontWeight: 500, fontSize: 16, textAlign: 'justify' }}>
                                You are creating a Payment Channel with the Borrower as part of the FIL lending process.
                            </div>

                            <div className="mt-4" style={{ textAlign: 'justify' }}>
                                <div>• You are transferring and locking 2 FIl into a Payment Channel contract.</div>
                                <div className="mt-2 ">• Once created, you'll have to wait for the Borrower to accept the offer.</div>
                                <div className="mt-2">• When the offer is accepted, you'll have to create and sign a <i>Voucher</i> to allow the Borrower to withdraw the principal.</div>
                                <div className="mt-2">• If the Borrower fails to accept the offer in x days, then you'll be able to unlock your FIL.</div>
                            </div>
                            <div className="mt-4" style={{ borderTop: '1px solid #e5e5e5', paddingTop: 20 }}>

                                <label className="form-label">Enter your password to confirm:</label>
                                <div className="input-group">
                                    <input value={password} onChange={this.handlePasswordChange} placeholder="Password" className={passwordIsInvalid ? "form-control is-invalid" : "form-control"} type="password" />
                                    <div className="invalid-feedback">
                                        {passwordErrorMsg}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 mb-3">
                                <button onClick={this.handleConfirmBtn} disabled={!password} className="btn btn_blue btn_lg" style={{ width: '100%' }}>Confirm</button>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 2 &&
                        <Fragment>
                            <div style={{ padding: '60px 24px 30px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img className="loading_indicator" src={`/images/blue-loader.svg`} />
                            </div>
                            <div style={{ padding: '0px 24px 48px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 600, fontSize: 20 }}>Waiting For Confirmation</div>
                                <div style={{ fontWeight: 500, fontSize: 16, marginTop: 5 }}>Creating a Payment Channel of {loanDetails?.collateralLock?.principalAmount} FIL with</div>
                                <div style={{ fontSize: 12, marginTop: 5, color: 'rgb(86, 90, 105)' }}>{filBorrower}</div>
                            </div>
                        </Fragment>
                    }

                    {
                        modalState == 3 &&
                        <Fragment>
                            <div style={{ padding: '50px 24px 40px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16 12 12 8 8 12"></polyline><line x1="12" y1="16" x2="12" y2="8"></line></svg>
                            </div>
                            <div style={{ padding: '0px 24px 24px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                                <div className="black" style={{ fontWeight: 600, fontSize: 20 }}>Transaction Submitted</div>
                                <a target='_blank' className="mt-2" href={explorer} style={{ color: '#0062ff', fontWeight: 500, marginTop: 5 }}>View on Filecoin Explorer</a>
                                <div style={{ fontWeight: 400, fontSize: 16, marginTop: 25, marginBottom: 15, textAlign: 'center' }}>You have created a Payment Channel with the Borrower. Please wait for the Borrower to accept the offer to continue .</div>
                                <button style={{ width: '100%' }} onClick={() => toggleModal(false)} className="btn btn_blue btn_lg mt-4">
                                    Close
                                </button>
                            </div>
                        </Fragment>
                    }
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
        width: '520px',
        // height: '680px',
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

function mapStateToProps({ shared, filecoin_wallet, protocolContracts, loanDetails, prices }, ownProps) {

    return {
        prices,
        shared,
        filecoin_wallet,
        protocolContracts,
        loanDetails: loanDetails['FIL'][ownProps?.loanId],
    }
}

export default connect(mapStateToProps)(FILLoanLendModal)