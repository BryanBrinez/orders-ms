import { IsUUID, IsInt, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string; // ID del producto existente en la BD

  @IsInt()
  @Min(1)
  quantity: number; // Cantidad del producto

  @IsNumber()
  @Min(0)
  price: number; // Precio unitario en el momento del pedido
}
