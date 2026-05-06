
### Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Практичне заняття №6 — Interceptors + Exception Filters + Swagger

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
│   │   │   └── update-product.dto.ts
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
│   │   └── 1778091093828-CreateUsers.ts
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


Swagger UI
http://localhost:3000/api/docs

https://swagger-screenshot.png

Формат успішної відповіді (TransformInterceptor)

{
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2025-01-15T10:30:00.000Z"
}

Формат помилки (HttpExceptionFilter)

{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": ["name must be longer..."],
    "traceId": "a1b2c3..."
  },
  "timestamp": "..."
}

Приклад логів (LoggingInterceptor)

[Nest] 29  - 05/06/2026, 9:21:43 PM     LOG [HTTP] POST /auth/login --- 200 --- 50ms
[Nest] 29  - 05/06/2026, 9:27:30 PM     LOG [HTTP] POST /api/products --- 201 --- 14ms
[Nest] 29  - 05/06/2026, 9:29:39 PM     LOG [HTTP] GET /api/products/1 --- 200 --- 12ms

Тест помилки з traceId


> curl http://localhost:3000/api/products/999
{"error":{"code":404,"message":"Product #999 not found","traceId":"..."}}