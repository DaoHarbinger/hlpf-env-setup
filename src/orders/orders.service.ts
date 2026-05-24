import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Role } from '../common/enums/role.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ==================== Вправа 4: Транзакційне створення ====================
  async create(dto: CreateOrderDto, userId: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product #${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          );
        }
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const orderItem = queryRunner.manager.create(OrderItem, {
          product,
          quantity: item.quantity,
          price: product.price,
        });
        orderItems.push(orderItem);
        totalPrice += Number(product.price) * item.quantity;
      }

      const order = queryRunner.manager.create(Order, {
        user: { id: userId },
        items: orderItems,
        totalPrice,
        status: OrderStatus.PENDING,
      });
      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      await this.clearProductsCache();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== Вправа 5: Пагінація + Ownership ====================
  async findAll(query: OrderQueryDto, userId: number, userRole: Role) {
    const { page = 1, pageSize = 10, status } = query;
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (userRole !== Role.ADMIN) {
      qb.andWhere('order.user.id = :userId', { userId });
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    qb.orderBy('order.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number, userId: number, userRole: Role) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    if (userRole !== Role.ADMIN && order.user.id !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  // ==================== Вправа 6: Зміна статусу + валідація ====================
  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id, 0, Role.ADMIN);
    const current = order.status;
    const newStatus = dto.status;

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[current].includes(newStatus)) {
      throw new BadRequestException(`Invalid status transition from ${current} to ${newStatus}`);
    }

    if (newStatus === OrderStatus.CANCELLED && current !== OrderStatus.CANCELLED) {
      await this.restoreStock(order);
    }

    order.status = newStatus;
    await this.orderRepo.save(order);
    return order;
  }

  async remove(id: number) {
    const order = await this.findOne(id, 0, Role.ADMIN);
    await this.orderRepo.remove(order);
  }

  // ==================== Допоміжні методи ====================
  private async restoreStock(order: Order) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const item of order.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product.id },
        });
        if (product) {
          product.stock += item.quantity;
          await queryRunner.manager.save(product);
        }
      }
      await queryRunner.commitTransaction();
      await this.clearProductsCache();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async clearProductsCache() {
    try {
      let store = (this.cacheManager as any).store;
      if (!store && (this.cacheManager as any).stores) {
        store = (this.cacheManager as any).stores[0];
      }
      if (store && typeof store.keys === 'function') {
        const keys = await store.keys('products:*');
        if (keys.length) {
          await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        }
      }
    } catch (error) {
      console.error('Error clearing products cache:', error);
    }
  }
}