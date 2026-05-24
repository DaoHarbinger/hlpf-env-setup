import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Category } from './categories/category.entity';
import { Product } from './products/product.entity';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CreateTables1700000001000 } from './migrations/1700000001000-CreateTables';
import { AddIsActiveToProducts1775678202884 } from './migrations/1775678202884-AddIsActiveToProducts';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { CreateUsers1778091093828 } from './migrations/1778091093828-CreateUsers'; //src/migrations/1778091093828-CreateUsers.ts
import { AuthModule } from './auth/auth.module'; 

import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CreateOrders1779645998949 } from './migrations/1779645998949-CreateOrders';
import { OrdersModule } from './orders/orders.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Category, Product, User, Order, OrderItem,],
      synchronize: false,
      migrationsRun: true,
      migrations: [CreateTables1700000001000, AddIsActiveToProducts1775678202884, CreateUsers1778091093828, CreateOrders1779645998949,],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          },
        }),
        ttl: 60 * 1000,
      }),
    }),
    CategoriesModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}