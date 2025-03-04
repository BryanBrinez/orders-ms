import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async createOrder(createOrderDto: CreateOrderDto) {
    try {
      const { userId, items } = createOrderDto;

      // Verificar que los productos existen
      const productIds = items.map((item) => item.productId);
      const existingProducts = await this.product.findMany({
        where: { id: { in: productIds } },
      });

      if (existingProducts.length !== productIds.length) {
        throw new RpcException({
          status: 400,
          message: 'Los productos especificados no existen',
        });
      }

      // Calcular el precio total usando los precios actuales de los productos
      const totalPrice = existingProducts.reduce((sum, product) => {
        const item = items.find((i) => i.productId === product.id);
        return sum + Number(product.price) * (item?.quantity ?? 0);
      }, 0);

      // Crear la orden
      const order = await this.order.create({
        data: {
          userId,
          totalPrice,
          status: 'PENDING',
        },
      });

      // Crear los ítems del pedido
      const orderItems = await Promise.all(
        items.map((item) =>
          this.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            },
          }),
        ),
      );

      return { ...order, items: orderItems };
    } catch (error) {
      throw new RpcException({
        status: 500,
        message: error.message,
      });
    }
  }

  async createProduct(createProductDto: CreateProductDto) {
    const product = await this.product.create({
      data: createProductDto,
    });
    return product;
  }

  async getAllProducts() {
    try {
      const products = await this.product.findMany();
      return products;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async getOrdersByUser(userId: string) {
    try {
      const orders = await this.order.findMany({
        where: { userId },
        include: { items: true }, // Incluye los productos del pedido
      });
      return orders;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED',
  ) {
    try {
      const updatedOrder = await this.order.update({
        where: { id: orderId },
        data: { status },
      });
      return updatedOrder;
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
