import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

// Components
import DashboardTemplate from '../general/DashboardTemplate'



class Dashboard extends Component {

    state = {
        showWalletModal: true
    }

    toggleWalletModal = (value) => this.setState({ showWalletModal: value })

    render() {

        const { showWalletModal } = this.state

        return (
            <DashboardTemplate>
                <div>Hello World</div>
                
            </DashboardTemplate>
        )
    }
}

function mapStateToProps({ shared }) {
    return {}
}

export default connect(mapStateToProps)(Dashboard)