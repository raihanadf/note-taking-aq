const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const todoValidation = require('../middleware/validation');

// GET /api/todos
router.get('/', 
  todoValidation.query,
  todoController.getAllTodos
);

// GET /api/todos/stats
router.get('/stats', todoController.getStats);

// GET /api/todos/:id
router.get('/:id', 
  todoValidation.id,
  todoController.getTodoById
);

// POST /api/todos
router.post('/', 
  todoValidation.create,
  todoController.createTodo
);

// PUT /api/todos/:id
router.put('/:id', 
  todoValidation.id,
  todoValidation.update,
  todoController.updateTodo
);

// PATCH /api/todos/:id/toggle
router.patch('/:id/toggle', 
  todoValidation.id,
  todoController.toggleTodo
);

// DELETE /api/todos/:id
router.delete('/:id', 
  todoValidation.id,
  todoController.deleteTodo
);

module.exports = router;
