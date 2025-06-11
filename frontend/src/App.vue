<script>
export default {
  name: 'App',
  data() {
    return {
      todos: [],
      newTask: '',
      loading: false,
      error: null,
      apiUrl: 'http://localhost:3000/api/todos'
    }
  },

  async mounted() {
    await this.fetchTodos()
  },

  methods: {
    async fetchTodos() {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(this.apiUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        this.todos = Array.isArray(data) ? data : data.todos || []
      } catch (err) {
        this.error = err.message
        console.error('Error fetching todos:', err)
      } finally {
        this.loading = false
      }
    },

    async addTask() {
      if (!this.newTask.trim()) return

      this.loading = true
      this.error = null
      try {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: this.newTask.trim(),
            description: ''
          })
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const newTodo = await response.json()
        this.todos.unshift(newTodo)
        this.newTask = ''
      } catch (err) {
        this.error = err.message
        console.error('Error adding task:', err)
      } finally {
        this.loading = false
      }
    },

    async toggleTask(todo) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${this.apiUrl}/${todo.id}/toggle`, {
          method: 'PATCH'
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const updatedTodo = await response.json()
        const index = this.todos.findIndex(t => t.id === todo.id)
        if (index !== -1) {
          this.todos[index] = updatedTodo
        }
      } catch (err) {
        this.error = err.message
        console.error('Error toggling task:', err)
        todo.completed = !todo.completed
      } finally {
        this.loading = false
      }
    },

    startEdit(todo) {
      todo.editing = true
      todo.editTitle = todo.title
      this.$nextTick(() => {
        const inputs = this.$refs.editInput
        if (inputs) {
          const input = Array.isArray(inputs) ? inputs.find(inp => inp) : inputs
          if (input) input.focus()
        }
      })
    },

    async saveEdit(todo) {
      if (!todo.editTitle.trim()) {
        this.cancelEdit(todo)
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${this.apiUrl}/${todo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: todo.editTitle.trim(),
            description: todo.description,
            completed: todo.completed
          })
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const updatedTodo = await response.json()
        const index = this.todos.findIndex(t => t.id === todo.id)
        if (index !== -1) {
          this.todos[index] = updatedTodo
        }
        todo.editing = false
      } catch (err) {
        this.error = err.message
        console.error('Error updating task:', err)
      } finally {
        this.loading = false
      }
    },

    cancelEdit(todo) {
      todo.editing = false
      todo.editTitle = todo.title
    },

    async deleteTask(id) {
      if (!confirm('Are you sure you want to delete this task?')) return

      this.loading = true
      this.error = null
      try {
        const response = await fetch(`${this.apiUrl}/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        this.todos = this.todos.filter(todo => todo.id !== id)
      } catch (err) {
        this.error = err.message
        console.error('Error deleting task:', err)
      } finally {
        this.loading = false
      }
    },

    moveTask(index, direction) {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= this.todos.length) return

      const todos = [...this.todos]
      const [movedTodo] = todos.splice(index, 1)
      todos.splice(newIndex, 0, movedTodo)
      this.todos = todos
    },

    sortTodos(field) {
      this.todos.sort((a, b) => {
        if (field === 'completed') {
          return a.completed - b.completed
        } else if (field === 'created_at') {
          return new Date(b.created_at) - new Date(a.created_at)
        } else if (field === 'title') {
          return a.title.localeCompare(b.title)
        }
        return 0
      })
    }
  }
}
</script>

<template>
  <div id="app">
    <h1>Todo App</h1>

    <div>
      <input v-model="newTask" @keyup.enter="addTask" placeholder="Enter task description">
      <button @click="addTask">Add</button>
    </div>

    <div v-if="todos.length > 0">
      <h2>Tasks ({{ todos.length }})</h2>

      <div>
        Sort by:
        <button @click="sortTodos('created_at')">Date Added</button>
        <button @click="sortTodos('title')">Title</button>
        <button @click="sortTodos('completed')">Status</button>
      </div>

      <ul>
        <li v-for="(todo, index) in todos" :key="todo.id" :style="{
          textDecoration: todo.completed ? 'line-through' : 'none',
          backgroundColor: todo.completed ? '#f0f0f0' : 'white',
          opacity: todo.completed ? 0.7 : 1
        }">
          <button @click="moveTask(index, -1)" :disabled="index === 0">↑</button>
          <button @click="moveTask(index, 1)" :disabled="index === todos.length - 1">↓</button>

          <input type="checkbox" v-model="todo.completed" @change="toggleTask(todo)">

          <span v-if="!todo.editing" @click="startEdit(todo)" style="cursor: pointer; margin: 0 10px;">
            {{ todo.title }}
          </span>

          <input v-else v-model="todo.editTitle" @keyup.enter="saveEdit(todo)" @keyup.esc="cancelEdit(todo)"
            @blur="saveEdit(todo)" style="margin: 0 10px;" ref="editInput">

          <small v-if="todo.description" style="color: gray;">
            ({{ todo.description }})
          </small>

          <button @click="deleteTask(todo.id)" style="margin-left: 10px;">Delete</button>
        </li>
      </ul>
    </div>

    <div v-else>
      <p>No tasks yet. Add one above!</p>
    </div>

    <div v-if="loading">Loading...</div>

    <div v-if="error" style="color: red;">
      Error: {{ error }}
    </div>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

input[type="text"],
input[type="checkbox"] {
  margin: 5px;
}

button {
  margin: 2px;
  padding: 5px 10px;
  cursor: pointer;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
}

li span {
  flex: 1;
}
</style>
