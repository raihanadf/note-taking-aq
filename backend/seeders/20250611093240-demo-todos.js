'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('todos', [
      {
        title: 'Learn Vue.js',
        description: 'Complete the Vue.js tutorial and build a sample project',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Set up Express API',
        description: 'Create a RESTful API with Express and PostgreSQL',
        completed: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Write unit tests',
        description: 'Add comprehensive test coverage for the API endpoints',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline and deploy the application',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Buy groceries',
        description: 'Milk, bread, eggs, and vegetables for the week',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('todos', null, {});
  }
};
