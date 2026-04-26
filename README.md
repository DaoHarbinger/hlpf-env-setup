
### Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Практичне заняття №4 — DTO + class-validator + Pipes

### Структура репозиторію

├── src/
│ ├── categories/
│ │ ├── dto/
│ │ │ ├── create-category.dto.ts
│ │ │ └── update-category.dto.ts
│ │ ├── category.entity.ts
│ │ ├── categories.module.ts
│ │ ├── categories.service.ts
│ │ └── categories.controller.ts
│ ├── products/
│ │ ├── dto/
│ │ │ ├── create-product.dto.ts
│ │ │ └── update-product.dto.ts
│ │ ├── product.entity.ts
│ │ ├── products.module.ts
│ │ ├── products.service.ts
│ │ └── products.controller.ts
│ ├── common/
│ │ └── pipes/
│ │ └── trim.pipe.ts
│ ├── migrations/
│ ├── data-source.ts
│ ├── main.ts
│ └── app.module.ts
├── Dockerfile
├── docker-compose.yml
└── README.md

### Запуск проекту
```bash
cp .env.example .env
docker compose up --build

### Результати тестування валідації та TrimPipe

```text
# Тест 1: валідне створення категорії
> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/categories" -ContentType "application/json" -Body '{"name":"Валідна","description":"Опис"}'
(успішно створено, якщо назва унікальна)

# Тест 2: порожнє ім'я категорії → 400 Bad Request
> try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/categories" -ContentType "application/json" -Body '{"name":""}' } catch { $_.Exception.Response.StatusCode.value__ }
400

# Тест 3: від'ємна ціна продукту → 400 Bad Request
> try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/products" -ContentType "application/json" -Body '{"name":"Тест","price":-5}' } catch { $_.Exception.Response.StatusCode.value__ }
400

# Тест 4: зайве поле isAdmin → 400 Bad Request (forbidNonWhitelisted)
> try { Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/categories" -ContentType "application/json" -Body '{"name":"Назва","isAdmin":true}' } catch { $_.Exception.Response.StatusCode.value__ }
400

# Тест 5: TrimPipe – обрізання пробілів
> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/categories" -ContentType "application/json" -Body '{"name":"  Trimmed  "}' | Select-Object -Property name
name
----
Trimmed

# Тест 6: валідне створення продукту (після створення категорії з id=1)
> Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/products" -ContentType "application/json" -Body '{"name":"Ноутбук","price":1500.50,"stock":10,"categoryId":1}'
(успішно створено)