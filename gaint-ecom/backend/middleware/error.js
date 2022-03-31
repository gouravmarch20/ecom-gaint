const ErrorHandler = require('../utils/errorhandler');

module.exports = (err, res, req, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || 'Internal server error';
    // Cast error : id error 
    if (err.name === 'CastError') {
        const message = `Resource not found: ${err.path}`;
        err = new ErrorHandler(message, 400)
    }
    res.status(err.statusCode).json({ success: false, error: err })
}