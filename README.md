## Student
- Name: Федоренко Олександр Романович
- Group: 232/1

# MiniShop API – фінальний проєкт

REST API для навчального інтернет-магазину, реалізований на **NestJS** з використанням **PostgreSQL**, **Redis**, **JWT**, **RBAC**, **Swagger**, **пагінації**, **фільтрації**, **кешування** та **транзакцій**.

## Технології

- NestJS + TypeScript
- PostgreSQL + TypeORM (міграції, QueryBuilder)
- Redis (кешування з інвалідацією)
- JWT автентифікація + RBAC авторизація
- class-validator + class-transformer
- Swagger / OpenAPI
- Docker + Docker Compose

## Запуск проєкту

```bash
cp .env.example .env
docker compose up --build
docker compose run --rm app npm run seed   # наповнити БД тестовими даними (30 продуктів)


Структура репозиторію

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
│   ├── orders/
│   │   ├── dto/
│   │   │   ├── create-order-item.dto.ts
│   │   │   ├── create-order.dto.ts
│   │   │   ├── update-order-status.dto.ts
│   │   │   └── order-query.dto.ts
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   │   └── order-item.entity.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.module.ts
│   │   └── orders.service.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── enums/
│   │   │   ├── role.enum.ts
│   │   │   └── order-status.enum.ts
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
│   │   └── 1779645998949-CreateOrders.ts
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

API Endpoints
Auth
Method	URL	Опис
POST	/auth/register	Реєстрація користувача
POST	/auth/login	Логін → отримання JWT

Categories
Method	URL	Auth	Опис
GET	/api/categories	-	Список категорій
GET	/api/categories/:id	-	Одна категорія
POST	/api/categories	admin	Створити категорію
PATCH	/api/categories/:id	admin	Оновити категорію
DELETE	/api/categories/:id	admin	Видалити категорію

Products
Method	URL	Auth	Опис
GET	/api/products	-	Список продуктів + пагінація + фільтри + пошук
GET	/api/products/:id	-	Один продукт
POST	/api/products	admin	Створити продукт
PATCH	/api/products/:id	admin	Оновити продукт
DELETE	/api/products/:id	admin	Видалити продукт

Query параметри для GET /api/products:
Параметр	Тип	Default	Опис
page	number	1	Номер сторінки
pageSize	number	10	Елементів на сторінку (max 100)
sort	string	createdAt	Поле сортування (name, price, stock, createdAt)
order	asc/desc	desc	Напрямок
categoryId	number	-	Фільтр за категорією
minPrice	number	-	Мінімальна ціна
maxPrice	number	-	Максимальна ціна
search	string	-	Пошук за назвою (ILIKE)

Orders
Method	URL	Auth	Role	Опис
POST	/api/orders	JWT	user/admin	Створити замовлення (транзакція, перевірка stock)
GET	/api/orders	JWT	user/admin	Мої замовлення (user) / Всі (admin)
GET	/api/orders/:id	JWT	user/admin	Одне замовлення з перевіркою власника
PATCH	/api/orders/:id/status	JWT	admin	Змінити статус (з валідацією переходів)
DELETE	/api/orders/:id	JWT	admin	Видалити замовлення

Формати відповідей

Успішна відповідь (TransformInterceptor):

json
{
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2026-05-24T18:47:18.576Z"
}

Помилка (HttpExceptionFilter):

json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": ["name must be longer..."],
    "traceId": "1ee3a58e-8ead-4fb1-86ef-3312e3111768"
  },
  "timestamp": "..."
}

Тестування модуля замовлень (результати)

Створення замовлення (Аліса)

> $order = Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/orders" -Headers @{Authorization = "Bearer $aliceToken"} -Body '{"items":[{"productId":65,"quantity":2},{"productId":61,"quantity":1}]}'
> $order.data.id
1

Перевірка ownership (Боб намагається переглянути замовлення Аліси) → 403

> try { Invoke-RestMethod -Uri "http://localhost:3000/api/orders/1" -Headers @{Authorization = "Bearer $bobToken"} } catch { $_.Exception.Response.StatusCode.value__ }
403

Зміна статусу (адмін) → confirmed

> Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/api/orders/1/status" -Headers @{Authorization = "Bearer $adminToken"} -Body '{"status":"confirmed"}'
status: confirmed

Невалідний перехід статусу (confirmed → pending) → 400

> try { Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/api/orders/1/status" -Headers @{Authorization = "Bearer $adminToken"} -Body '{"status":"pending"}' } catch { $_.Exception.Response.StatusCode.value__ }
400

Недостатній залишок → 400

> try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/orders" -Headers @{Authorization = "Bearer $bobToken"} -Body '{"items":[{"productId":65,"quantity":99999}]}' } catch { $_.Exception.Response.StatusCode.value__ }
400

Видалення замовлення (адмін)

> Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/api/orders/1" -Headers @{Authorization = "Bearer $adminToken"}
> # Повторний запит → 404

Кешування продуктів (Redis)
Результати GET /api/products кешуються на 60 секунд.

Ключ формується з усіх query-параметрів.

При створенні/оновленні/видаленні продукту або при створенні/скасуванні замовлення кеш інвалідується.

docker compose exec redis redis-cli KEYS "products:*"


Swagger UI
Інтерактивна документація доступна за адресою:
http://localhost:3000/api/docs