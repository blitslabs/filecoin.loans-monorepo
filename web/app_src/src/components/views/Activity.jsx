import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// Components
import DashboardTemplate from '../general/DashboardTemplate'

// Libraries
import BigNumber from 'bignumber.js'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

// API
import { getActivityHistory } from '../../utils/api'

BigNumber.set({ EXPONENTIAL_AT: 25 })


class Activity extends Component {

    state = {
        events: ''
    }

    componentDidMount() {
        const { shared } = this.props

        getActivityHistory({ page: 1 })
            .then(data => data.json())
            .then((res) => {
                console.log(res)
                if (res?.status === 'OK') {
                    this.setState({ events: res?.payload })
                }
            })
    }

    render() {
        const { shared, loanAssets } = this.props
        const { events } = this.state


        return (
            <DashboardTemplate>
                <div>
                    <div className="loan_details_head_title">
                        Protocol Activity
                    </div>

                    <div className="post__item mt-4">
                        <div className="post_body" style={{ padding: '24px 50px' }}>
                            {/* <h5 className="">Activity</h5> */}

                            <div className="table-responsive mt-4">
                                <table className="table table-striped mt-2">
                                    <thead>
                                        <tr>
                                            <th>TxHash</th>
                                            <th>Event</th>
                                            <th>Blockchain</th>
                                            <th>Network</th>
                                            <th>Contract</th>
                                            <th>Loan ID</th>
                                            <th>Loan Type</th>
                                            <th>Date</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            events?.length > 0
                                                ?
                                                events.map((e, i) => {

                                                    return (<tr>
                                                        <td>
                                                            {e?.txHash?.substring(0, 4)}...{e?.txHash?.substring(e?.txHash?.length - 4, e?.txHash?.length)}
                                                        </td>
                                                        <td>
                                                            <div className="statistics__status statistics__status_completed">
                                                                {e?.event}
                                                            </div>
                                                        </td>
                                                        <td>{e?.blockchain}</td>
                                                        <td>{e?.networkId}</td>
                                                        <td>{e?.contractAddress?.substring(0, 4)}...{e?.contractAddress?.substring(e?.contractAddress?.length - 4, e?.contractAddress?.length)}</td>
                                                        <td>{e?.loanId}</td>
                                                        <td>{e?.loanType}</td>
                                                        <td>{e?.createdAt}</td>
                                                        <td>
                                                           {
                                                               e?.loanType === 'FILERC20'
                                                               ?  <Link to={'/loan/FIL/' + e?.id} className="btn btn_blue">View Details</Link>
                                                               :  <Link to={'/loan/ERC20/' + e?.id} className="btn btn_blue">View Details</Link>
                                                           }
                                                        </td>
                                                    </tr>)
                                                })
                                                :
                                                <tr>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                    <th>-</th>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>


                </div >
            </DashboardTemplate >
        )
    }
}

function mapStateToProps({ shared, loanAssets }) {
    return {
        shared,
        loanAssets
    }
}

export default connect(mapStateToProps)(Activity)