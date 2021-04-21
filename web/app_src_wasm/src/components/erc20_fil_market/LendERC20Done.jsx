import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'
import Slider, { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import Stepper from 'react-stepper-horizontal'

class LendERC20Done extends Component {

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
                                    <h1 className="sorting1__title title mb-4">Create New ERC20 Loan Offer</h1>
                                    <Stepper
                                        activeStep={2}
                                        steps={[
                                            { title: 'Set Terms' },
                                            { title: 'Fund Loan' },
                                            { title: 'Waiting For Borrower' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="post__item">
                        <div className="post__body">
                            
                            <div className="loan_details_container mt-5" style={{display:'flex',flexDirection:'column', justifyContent:'center', alignItems:'center'}} >

                                <div style={{fontSize:22, fontWeight: 600}}>Loan Offer Created!</div>
                                <div className="mt-4" style={{fontSize: 18, fontWeight: 400, textAlign:'center'}}>You have created a loan offer. We’ll notify you when a Borrower lock funds to take the offer. Once a Borrower locks collateral you'll have to approve or reject the request.</div>
                                <img className="mt-5" src={`${process.env.REACT_APP_SERVER_HOST}/images/success.svg`}/>
                                <div className="mt-5">
                                    <button className="btn btn_blue btn_lg">View Loan Details</button>
                                    <button className="btn btn_white btn_lg mt-2">View All Loan Offers</button>
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

export default connect(mapStateToProps)(LendERC20Done)