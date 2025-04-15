export const SendResponse = (reply, status, success, message, data = null, error = null) => {
  return reply.status(status).send({
    success,
    message,
    data,
    error: error ? {
      code: error.code || status,
      message: error.message || message,
      details: error.details || null
    } : null
  });
};

// Example usage:
// Success response
// sendResponse(reply, 200, true, "Operation successful", { result: "data" });
// Error response 
// sendResponse(reply, 400, false, "Policy already exists", null, { code: "POLICY_EXISTS", message: "Policy already exists", details: "..." });
