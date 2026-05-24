import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('api/orders')
@UseGuards(JwtAuthGuard) // всі ендпоінти вимагають автентифікації
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створити замовлення' })
  @ApiResponse({ status: 201, description: 'Замовлення створено' })
  create(@Body() dto: CreateOrderDto, @CurrentUser('sub') userId: number) {
    return this.ordersService.create(dto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати замовлення (свої для user, всі для admin)' })
  findAll(@Query() query: OrderQueryDto, @CurrentUser('sub') userId: number, @CurrentUser('role') role: Role) {
    return this.ordersService.findAll(query, userId, role);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримати одне замовлення (з перевіркою власника)' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('sub') userId: number, @CurrentUser('role') role: Role) {
    return this.ordersService.findOne(id, userId, role);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Змінити статус замовлення (тільки admin)' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Видалити замовлення (тільки admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}