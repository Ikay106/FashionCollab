const Joi = require('joi');

const signupSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: true } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),

  role: Joi.string()
    .valid('photographer', 'model', 'stylist', 'makeup_artist', 'hair_stylist', 'videographer', 'creative_director', 'brand_rep')
    .required()
    .messages({
      'any.only': 'Invalid role. Choose from: photographer, model, stylist, makeup_artist, hair_stylist, videographer, creative_director, brand_rep',
      'any.required': 'Role is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  validateSignup(req, res, next) {
    const { error } = signupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  },

  validateLogin(req, res, next) {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }
    next();
  }
};