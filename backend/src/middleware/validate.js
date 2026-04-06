export const validate = (schema) => async (req, res, next) => {
  try {
    // Attempt to parse the incoming request body, query, and params
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // If validation passes, move to the next middleware/controller
    return next();
  } catch (error) {
    // If validation fails, extract the errors and send a 400 response
    const formattedErrors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
};
