
### Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Практичне заняття №7 — Redis кешування + Query параметри + Pagination

### Структура репозиторію

hlpf-env-setup/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── users/
│   │   ├── user.entity.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   ├── categories/
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   └── update-category.dto.ts
│   │   ├── category.entity.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.module.ts
│   │   └── categories.service.ts
│   ├── products/
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-query.dto.ts         
│   │   ├── product.entity.ts
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   └── products.service.ts              
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── enums/
│   │   │   └── role.enum.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── pipes/
│   │       └── trim.pipe.ts
│   ├── migrations/
│   │   ├── 1700000001000-CreateTables.ts
│   │   ├── 1775678202884-AddIsActiveToProducts.ts
│   │   ├── 1778091093828-CreateUsers.ts
│   │   └── (можливі інші міграції)
│   ├── seeds/                                 
│   │   └── seed.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── data-source.ts
│   └── main.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── eslint.config.mjs
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
├── swagger-screenshot.png                     
├── tsconfig.build.json
└── tsconfig.json


### Запуск проекту
```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed   # наповнити БД тестовими даними

Тест пагінації

> $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products?page=2&pageSize=5"
> $response.data.meta
page pageSize total totalPages
---- -------- ----- ----------
2    5        35    7

Тест фільтрації за категорією

> $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products?categoryId=1"
> $response.data.items.Count

Тест діапазону цін

> $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products?minPrice=100&maxPrice=1000"
> $response.data.items | Select-Object -Property name, price

Тест пошуку

> $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products?search=mac"
> $response.data.items | Select-Object -Property name

Тест валідації pageSize (max 100)

> try { Invoke-RestMethod -Uri "http://localhost:3000/api/products?pageSize=999" -ErrorAction Stop } catch { $_.Exception.Response.StatusCode.value__ }
400

Кешування (Redis)

# Після першого запиту з'являються ключі
docker compose exec redis redis-cli KEYS "products:*"

Інвалідація кешу

# Після створення/оновлення/видалення продукту кеш очищається
docker compose exec redis redis-cli KEYS "products:*"  # (empty array)

Seed скрипт

docker compose run --rm app npm run seed
# Вивід: Seed complete: 3 categories, 30 products