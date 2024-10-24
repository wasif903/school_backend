// validator.js
import Joi from 'joi';

/**
 * Validates data based on the provided schema.
 * @param {Object} schema - Joi schema object for validation.
 * @param {Object} data - Data to be validated.
 * @returns {Object} - Returns an object containing `error` and `value`.
 */
const validateData = (schema, data) => {
    const { error, value } = schema.validate(data);
    if (error) {
        return { error: error.details[0].message };
    }
    return { value };
};

export default validateData
