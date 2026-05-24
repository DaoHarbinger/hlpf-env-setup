import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // ========== findAll з кешуванням ==========
  async findAll(query: ProductQueryDto) {
    const cacheKey = `products:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    const {
      page = 1,
      pageSize = 10,
      sort = 'createdAt',
      order = 'desc',
      categoryId,
      minPrice,
      maxPrice,
      search,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }
    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy(`product.${sort}`, order.toUpperCase() as 'ASC' | 'DESC');
    const skip = (page - 1) * pageSize;
    qb.skip(skip).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const result = {
      items,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock ?? 0,
      category: dto.categoryId ? { id: dto.categoryId } as any : undefined,
    });
    const saved = await this.productRepo.save(product);
    await this.clearProductsCache();
    return saved;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.stock !== undefined) product.stock = dto.stock;
    if (dto.categoryId !== undefined) {
      product.category = { id: dto.categoryId } as any;
    }
    const saved = await this.productRepo.save(product);
    await this.clearProductsCache();
    return saved;
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    await this.clearProductsCache();
  }

  // ========== Очищення всього кешу продуктів ==========
  private async clearProductsCache(): Promise<void> {
    try {
      let redisStore: any = (this.cacheManager as any).store;
      if (!redisStore && (this.cacheManager as any).stores) {
        redisStore = (this.cacheManager as any).stores[0];
      }
      if (redisStore && typeof redisStore.keys === 'function') {
        const keys = await redisStore.keys('products:*');
        if (keys && keys.length) {
          await Promise.all(keys.map((key) => this.cacheManager.del(key)));
        }
      } else {
        console.warn('Cannot clear products cache: store.keys not available');
      }
    } catch (error) {
      console.error('Error clearing products cache:', error);
    }
  }
}