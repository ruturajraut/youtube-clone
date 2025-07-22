class ApiError extends Error {
    constructor(statusCode, message="Some error occurred", errors=[],stack="") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.errors = errors;
        this.success = false;
    }
}

export default ApiError;
export { ApiError };