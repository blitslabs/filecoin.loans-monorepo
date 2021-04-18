
module.exports.renderApp = function(req, res) {    
    res.render('app_container', {
        host: process.env.SERVER_HOST,
        react_host: process.env.REACT_HOST,
    })
}
