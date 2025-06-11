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
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl bg-gray-800 rounded-2xl border border-gray-700">
      <div class="border-b border-gray-700 p-6">
        <h1 class="text-2xl font-medium text-gray-100">Todo App</h1>
      </div>

      <div class="p-6 border-b border-gray-700">
        <div class="flex gap-3">
          <input v-model="newTask" @keyup.enter="addTask" placeholder="Enter task description"
            class="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500">
          <button @click="addTask"
            class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium rounded-xl border border-gray-600 transition-colors">
            Add
          </button>
        </div>
      </div>

      <div v-if="todos.length > 0" class="p-6 border-b border-gray-700">
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-300">Sort by:</span>
          <div class="flex gap-2">
            <button @click="sortTodos('created_at')"
              class="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-gray-200 transition-colors">
              Date Added
            </button>
            <button @click="sortTodos('title')"
              class="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-gray-200 transition-colors">
              Title
            </button>
            <button @click="sortTodos('completed')"
              class="px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 text-gray-200 transition-colors">
              Status
            </button>
          </div>
        </div>
      </div>

      <div v-if="todos.length > 0" class="p-6">
        <div class="mb-4">
          <h2 class="text-lg font-medium text-gray-100">Tasks ({{ todos.length }})</h2>
        </div>

        <div class="space-y-3">
          <div v-for="(todo, index) in todos" :key="todo.id" :class="[
            'flex items-center gap-4 p-4 border rounded-xl transition-colors',
            todo.completed
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-700 border-gray-600 hover:border-gray-500'
          ]">
            <div class="flex flex-col gap-1">
              <button @click="moveTask(index, -1)" :disabled="index === 0" :class="[
                'w-6 h-6 flex items-center justify-center text-xs border rounded-md',
                index === 0
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500'
              ]">
                ↑
              </button>
              <button @click="moveTask(index, 1)" :disabled="index === todos.length - 1" :class="[
                'w-6 h-6 flex items-center justify-center text-xs border rounded-md',
                index === todos.length - 1
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  : 'bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500'
              ]">
                ↓
              </button>
            </div>

            <div class="flex-shrink-0">
              <input type="checkbox" v-model="todo.completed" @change="toggleTask(todo)"
                class="w-5 h-5 rounded border-2 border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-1">
            </div>

            <div class="flex-1 min-w-0">
              <div v-if="!todo.editing" @click="startEdit(todo)" :class="[
                'cursor-pointer py-1',
                todo.completed ? 'line-through text-gray-400' : 'text-gray-100'
              ]">
                {{ todo.title }}
              </div>

              <input v-else v-model="todo.editTitle" @keyup.enter="saveEdit(todo)" @keyup.esc="cancelEdit(todo)"
                @blur="saveEdit(todo)"
                class="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                ref="editInput">

              <div v-if="todo.description" class="text-sm text-gray-400 mt-1">
                {{ todo.description }}
              </div>
            </div>

            <button @click="deleteTask(todo.id)"
              class="flex-shrink-0 px-3 py-2 text-sm text-red-400 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-red-300 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center">
        <div class="text-gray-500 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-200 mb-1">No tasks yet</h3>
        <p class="text-gray-400">Add your first task above to get started</p>
      </div>

      <div v-if="loading" class="p-6 text-center border-t border-gray-700">
        <div class="text-gray-300">Loading...</div>
      </div>

      <div v-if="error" class="p-6 border-t border-red-800 bg-red-900/20">
        <div class="text-red-400 text-center">
          Error: {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>
