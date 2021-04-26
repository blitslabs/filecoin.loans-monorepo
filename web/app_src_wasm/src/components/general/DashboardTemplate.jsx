import React, { Component } from 'react'
import { connect } from 'react-redux'

// Components
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

class DashboardTemplate extends Component {
    render() {
        return (
            <div className="page7 js-page7">
                <Header />
                <ToastContainer />
                <div className="page7__wrapper">
                    <Sidebar />
                    <div className="page7__container">
                        {this.props.children}
                    </div>
                </div>
            </div>
        )
    }
}


function mapStateToProps({ }) {
    return {}
}

export default connect(mapStateToProps)(DashboardTemplate)