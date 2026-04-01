## Student
- Name: Федоренко Олександр Романович
- Group: 232/1

## Практичне заняття №2 — NestJS + PostgreSQL + Redis

## Структура репозиторію
├── src/ # NestJS source code
├── Dockerfile
├── docker-compose.yml
├── .env.example # шаблон змінних оточення
├── .dockerignore
└── README.md


## Запуск проекту
```bash
cp .env.example .env
docker compose up --build

> docker compose ps
NAME                        IMAGE                COMMAND                  SERVICE    CREATED          STATUS                    PORTS
hlpf-env-setup-app-1        hlpf-env-setup-app   "docker-entrypoint.s…"   app        21 minutes ago   Up 21 minutes             0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp
hlpf-env-setup-postgres-1   postgres:16-alpine   "docker-entrypoint.s…"   postgres   21 minutes ago   Up 21 minutes (healthy)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp
hlpf-env-setup-redis-1      redis:7-alpine       "docker-entrypoint.s…"   redis      21 minutes ago   Up 21 minutes (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp

> docker compose exec postgres psql -U nestuser -d nestdb -c '\l'
                                                      List of databases
   Name    |  Owner   | Encoding | Locale Provider |  Collate   |   Ctype    | ICU Locale | ICU Rules |   Access privileges
-----------+----------+----------+-----------------+------------+------------+------------+-----------+-----------------------
 nestdb    | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           |
 postgres  | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           |
 template0 | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/nestuser          +
           |          |          |                 |            |            |            |           | nestuser=CTc/nestuser
 template1 | nestuser | UTF8     | libc            | en_US.utf8 | en_US.utf8 |            |           | =c/nestuser          +
           |          |          |                 |            |            |            |           | nestuser=CTc/nestuser
(4 rows)

> docker compose exec redis redis-cli ping
PONG

> curl -UseBasicParsing http://localhost:3000
Hello World!

> docker compose logs app | tail -20
[Nest] 1  - 04/01/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 04/01/2026, 10:00:00 AM     LOG [InstanceLoader] ConfigModule dependencies initialized
[Nest] 1  - 04/01/2026, 10:00:00 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 1  - 04/01/2026, 10:00:00 AM     LOG [InstanceLoader] CacheModule dependencies initialized
[Nest] 1  - 04/01/2026, 10:00:00 AM     LOG [NestApplication] Nest application successfully started