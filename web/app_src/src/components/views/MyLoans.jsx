import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

// API
import { getAccountLoans } from '../../utils/api'

class MyLoans extends Component {

    componentDidMount() {
        getAccountLoans()
            .then(data => data.json())
            .then((res) => {
                console.log(res)
            })
    }

    render() {
        return (
            <DashboardTemplate>
                <div>
                    <div className="post__item mt-4">
                        <div className="post_body" style={{ padding: 50 }}>
                            <div className="loan_details_head_title">
                                My Loans
                            </div>
                            <div className="table-responsive mt-4">
                                <table className="table table-striped mt-4">
                                    <thead>
                                        <th>TX HASH</th>
                                        <th>EVENT</th>
                                        <th>BLOCKCHAIN</th>
                                        <th>NETWORK</th>
                                        <th>DATE</th>
                                    </thead>
                                    <tbody>
                                        
                                    </tbody>
                                </table>
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

export default connect(mapStateToProps)(MyLoans)