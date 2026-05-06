
### Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Практичне заняття №5 — Автентифікація та авторизація (JWT + Guards + RBAC)

### Структура репозиторію

├── src/
│ ├── auth/
│ │ ├── dto/
│ │ │ ├── login.dto.ts
│ │ │ └── register.dto.ts
│ │ ├── auth.controller.ts
│ │ ├── auth.module.ts
│ │ └── auth.service.ts
│ ├── categories/
│ │ ├── dto/
│ │ │ ├── create-category.dto.ts
│ │ │ └── update-category.dto.ts
│ │ ├── categories.controller.ts
│ │ ├── categories.module.ts
│ │ ├── categories.service.ts
│ │ └── category.entity.ts
│ ├── products/
│ │ ├── dto/
│ │ │ ├── create-product.dto.ts
│ │ │ └── update-product.dto.ts
│ │ ├── products.controller.ts
│ │ ├── products.module.ts
│ │ ├── products.service.ts
│ │ └── product.entity.ts
│ ├── users/
│ │ ├── user.entity.ts
│ │ ├── users.module.ts
│ │ └── users.service.ts
│ ├── common/
│ │ ├── enums/
│ │ │ └── role.enum.ts
│ │ ├── guards/
│ │ │ ├── jwt-auth.guard.ts
│ │ │ └── roles.guard.ts
│ │ ├── decorators/
│ │ │ ├── current-user.decorator.ts
│ │ │ └── roles.decorator.ts
│ │ └── pipes/
│ │ └── trim.pipe.ts
│ ├── migrations/
│ │ ├── 1700000001000-CreateTables.ts
│ │ ├── 1775678202884-AddIsActiveToProducts.ts
│ │ └── 1778091093828-CreateUsers.ts 
│ ├── data-source.ts
│ ├── app.module.ts
│ └── main.ts
├── .env
├── .env.example
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
└── README.md

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build


### API Endpoints 
| Method | URL | Auth | Role |
|--------|-----|------|------|
| POST | /auth/register | - | - |
| POST | /auth/login | - | - |
| GET | /api/categories | - | - |
| POST | /api/categories | JWT | admin |
| GET | /api/products | - | - |
| POST | /api/products | JWT | admin |
| PATCH | /api/products/:id | JWT | admin |
| DELETE | /api/products/:id | JWT | admin |

### Тест реєстрації
```text
> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/register" -ContentType "application/json" -Body '{"email":"admin@test.com","password":"password123","name":"Admin"}'
id: 1, email: admin@test.com, role: user

Тест логіну

> $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/login" -ContentType "application/json" -Body '{"email":"admin@test.com","password":"password123"}'
> $token = $response.accessToken
> Write-Host $token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Тест 401 – запит без токена

> try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/products" -ContentType "application/json" -Body '{"name":"Test","price":10}' } catch { $_.Exception.Response.StatusCode.value__ }
401

Тест 403 – запит з роллю user

> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/products" -Headers @{Authorization = "Bearer $userToken"} -ContentType "application/json" -Body '{"name":"MacBook","price":2499.99}'
403 Forbidden (Insufficient permissions)

Тест успішного створення від admin

> # Оновлення ролі в БД
> docker compose exec postgres psql -U nestuser -d nestdb -c "UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';"
> # Новий логін
> $response = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/auth/login" -ContentType "application/json" -Body '{"email":"admin@test.com","password":"password123"}'
> $adminToken = $response.accessToken
> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/products" -Headers @{Authorization = "Bearer $adminToken"} -ContentType "application/json" -Body '{"name":"MacBook","price":2499.99}'
id: 4, name: MacBook, price: 2499.99