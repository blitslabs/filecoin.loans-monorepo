import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'

class ConfirmBorrowFIL extends Component {

    state = {
        interestRate: 10,
        collateralizationRatio: 150
    }

    render() {

        const { interestRate, collateralizationRatio } = this.state

        return (
            <DashboardTemplate>

                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: 'auto', justifyContent: 'center' }}>


                    <div className="row mt-4 mb-4">
                        <div className="col-sm-12">
                            <div className="post__item">
                                <div className="post__body" style={{ padding: 40 }}>
                                    <h1 className="sorting1__title title mb-4">Create New FIL Borrow Request</h1>
                                    <Stepper
                                        activeStep={2}
                                        steps={[
                                            { title: 'Set Terms' },
                                            { title: 'Lock Collateral' },
                                            { title: 'Waiting For Lender' },
                                            { title: 'Withdraw Principal' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="post__item">
                        <div className="post__body">
                            
                            <div className="loan_details_container mt-5" style={{display:'flex',flexDirection:'column', justifyContent:'center', alignItems:'center'}} >

                                <div style={{fontSize:22, fontWeight: 600}}>Loan Request Created!</div>
                                <div className="mt-4" style={{fontSize: 18, fontWeight: 400, textAlign:'center'}}>You have created a FIL loan request. We’ll notify you when a Lender funds your request. Once it is funded you’ll be able to withdraw the loan’s principal.</div>
                                <img className="mt-5" src={`${process.env.REACT_APP_SERVER_HOST}/images/success.svg`}/>
                                <div className="mt-5">
                                    <button onClick={() => this.props.history.push('/borrow/FIL')} className="btn btn_blue btn_lg">Go to My Loans</button>
                                    <button onClick={() => this.props.history.push('/borrow/requests/FIL')} className="btn btn_white btn_lg mt-2">View All Loan Requests</button>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared }) {
    return {
        shared
    }
}

export default connect(mapStateToProps)(ConfirmBorrowFIL)