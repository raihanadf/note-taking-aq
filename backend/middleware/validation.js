const { body, param, query } = require('express-validator');

const todoValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters')
  ],

  update: [
    body('title')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters'),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('completed')
      .optional()
      .isBoolean()
      .withMessage('Completed must be a boolean value')
  ],

  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('ID must be a positive integer')
  ],

  query: [
    query('status')
      .optional()
      .isIn(['completed', 'pending'])
      .withMessage('Status must be either "completed" or "pending"'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = todoValidation;
