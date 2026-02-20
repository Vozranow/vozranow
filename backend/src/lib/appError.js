
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    // Captures the stack trace so you know exactly which file broke
    Error.captureStackTrace(this, this.constructor); 
  }
}
