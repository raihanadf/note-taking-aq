const { Todo } = require('../models');
const { validationResult } = require('express-validator');

class TodoController {
  // Get all todos
  async getAllTodos(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = {};
      if (status === 'completed') {
        whereClause.completed = true;
      } else if (status === 'pending') {
        whereClause.completed = false;
      }

      const { count, rows: todos } = await Todo.findAndCountAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        todos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get single todo
  async getTodoById(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findByPk(id);
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new todo
  async createTodo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description } = req.body;
      const todo = await Todo.create({ title, description });
      
      res.status(201).json(todo);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Update todo
  async updateTodo(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, description, completed } = req.body;
      
      const todo = await Todo.findByPk(id);
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await todo.update({
        title: title !== undefined ? title : todo.title,
        description: description !== undefined ? description : todo.description,
        completed: completed !== undefined ? completed : todo.completed
      });

      res.json(todo);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Toggle todo completion
  async toggleTodo(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findByPk(id);
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await todo.toggle();
      res.json(todo);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete todo
  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const todo = await Todo.findByPk(id);
      
      if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      await todo.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get statistics
  async getStats(req, res) {
    try {
      const total = await Todo.count();
      const completed = await Todo.count({ where: { completed: true } });
      const pending = total - completed;

      res.json({
        total,
        completed,
        pending,
        completionRate: total > 0 ? (completed / total * 100).toFixed(2) : 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TodoController();
