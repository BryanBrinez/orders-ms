import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateProductDto } from './dto/create-product.dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('orders.create')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
  }

  @MessagePattern('create.product')
  createProduct(@Payload() createProductDto: CreateProductDto) {
    return this.ordersService.createProduct(createProductDto);
  }

  @MessagePattern('get.all.products')
  getAllProduct() {
    return this.ordersService.getAllProducts();
  }

  @MessagePattern('get.orders.by.user')
  getOrdersByUser(@Payload() userId: string) {
    return this.ordersService.getOrdersByUser(userId);
  }

  @MessagePattern('update.order.status')
  updateOrderStatus(
    @Payload()
    data: {
      orderId: string;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
    },
  ) {
    return this.ordersService.updateOrderStatus(data.orderId, data.status);
  }
}
