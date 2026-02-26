const Joi = require('joi');

const projectBaseSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot be longer than 100 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot be longer than 1000 characters'
    }),

  location: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Location cannot be longer than 200 characters'
    }),

  shoot_date: Joi.date()
    .greater('now')
    .allow(null)
    .messages({
      'date.base': 'Shoot date must be a valid date',
      'date.greater': 'Shoot date must be in the future or null'
    }),

  status: Joi.string()
    .valid('draft', 'planned', 'in_progress', 'completed', 'cancelled')
    .default('draft')
    .messages({
      'any.only': 'Invalid status. Allowed: draft, planned, in_progress, completed, cancelled'
    })
});

// CREATE: title required, others optional
const createProjectSchema = projectBaseSchema;

// UPDATE: partial updates, at least one field required
const updateProjectSchema = Joi.object({
  title: projectBaseSchema.extract('title').optional(),
  description: projectBaseSchema.extract('description').optional(),
  location: projectBaseSchema.extract('location').optional(),
  shoot_date: projectBaseSchema.extract('shoot_date').optional(),
  status: projectBaseSchema.extract('status').optional()
}).min(1).messages({
  'object.min': 'At least one field (title, description, location, shoot_date, status) must be provided for update'
});

module.exports = {
  validateCreateProject(req, res, next) {
    const { error } = createProjectSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  },

  validateUpdateProject(req, res, next) {
    const { error } = updateProjectSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  }
};