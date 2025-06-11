# AQ Todo API

Todo Express.js dengan PostgreSQL dan Sequelize ORM + Vue.

## Endpoint API

### Todo
- `GET /api/todos` - Ambil semua todo (dengan paginasi dan filter)
- `GET /api/todos/stats` - Dapatkan statistik todo
- `GET /api/todos/:id` - Ambil satu todo
- `POST /api/todos` - Buat todo baru
- `PUT /api/todos/:id` - Update todo
- `PATCH /api/todos/:id/toggle` - Toggle status selesai todo
- `DELETE /api/todos/:id` - Hapus todo

### Parameter Query
- `status`: Filter berdasarkan status (`completed`, `pending`)
- `page`: Nomor halaman untuk paginasi (default: 1)
- `limit`: Item per halaman (default: 10, maksimal: 100)

## Run App / Development

### Menggunakan Docker
Jalankan dari root directory:
```bash
docker-compose up --build
```

### Commands DB di Docker
Setelah container berjalan, jalankan:
```bash
# migrasi
docker-compose exec api npx sequelize-cli db:migrate

# seeder (untuk contoh data)
docker-compose exec api npx sequelize-cli db:seed:all
```

## .env Variables
- `NODE_ENV` - Environment (development, test, production)
- `PORT` - Port server (default: 3000)
- `DB_HOST` - Host database
- `DB_PORT` - Port database (default: 5432)
- `DB_NAME` - Nama database
- `DB_USER` - Username database
- `DB_PASS` - Password database

## Contoh Request

### Buat todo baru
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Tugas Baru", "description": "Deskripsi tugas"}'
```

### Ambil todo dengan paginasi
```bash
curl "http://localhost:3000/api/todos?page=1&limit=5&status=pending"
```

### Toggle status selesai todo
```bash
curl -X PATCH http://localhost:3000/api/todos/1/toggle
```
