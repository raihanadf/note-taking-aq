module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define('Todo', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'todos',
    timestamps: true,
    underscored: true
  });

  // Instance methods
  Todo.prototype.toggle = function () {
    this.completed = !this.completed;
    return this.save();
  };

  // Static methods
  Todo.findCompleted = function () {
    return this.findAll({
      where: { completed: true },
      order: [['updated_at', 'DESC']]
    });
  };

  Todo.findPending = function () {
    return this.findAll({
      where: { completed: false },
      order: [['created_at', 'DESC']]
    });
  };

  return Todo;
};
