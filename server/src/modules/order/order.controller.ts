import { Controller, Post, Body } from '@nestjs/common'
import { OrderService, OrderStatus } from './order.service'

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async create(@Body() body: { userId: string; orderType: string; amount: number; serviceDetails?: any }) {
    const result = await this.orderService.createOrder(body.userId, body.orderType as any, body.amount, body.serviceDetails)
    return { code: 200, message: '创建成功', data: result }
  }

  @Post('get')
  async get(@Body() body: { orderId: string }) {
    const result = await this.orderService.getOrder(body.orderId)
    return result ? { code: 200, message: '获取成功', data: result } : { code: 404, message: '订单不存在', data: null }
  }

  @Post('list')
  async list(@Body() body: { userId: string; status?: OrderStatus }) {
    const result = await this.orderService.listOrders(body.userId, body.status)
    return { code: 200, message: '获取成功', data: result }
  }

  @Post('pay')
  async pay(@Body() body: { orderId: string; paymentMethod: string }) {
    const result = await this.orderService.payOrder(body.orderId, body.paymentMethod)
    return { code: 200, message: '支付成功', data: result }
  }

  @Post('complete')
  async complete(@Body() body: { orderId: string }) {
    const result = await this.orderService.completeOrder(body.orderId)
    return { code: 200, message: '完成', data: result }
  }

  @Post('fail')
  async fail(@Body() body: { orderId: string; reason?: string }) {
    const result = await this.orderService.failOrder(body.orderId, body.reason)
    return { code: 200, message: '已标记失败', data: result }
  }

  @Post('abandon')
  async abandon(@Body() body: { orderId: string; reason?: string }) {
    const result = await this.orderService.abandonOrder(body.orderId, body.reason)
    return { code: 200, message: '已标记中断', data: result }
  }

  @Post('cancel')
  async cancel(@Body() body: { orderId: string }) {
    const result = await this.orderService.cancelOrder(body.orderId)
    return { code: 200, message: '已取消', data: result }
  }
}
