class ApiError extends Error {
    constructor(message, statusCode="Some error occurred", errors=[],stack="") {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.stack = stack;
    }
}

export default ApiError;
export { ApiError };