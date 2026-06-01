import { Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'COMPLETED'
  | 'ABANDONED'
  | 'FAILED'
  | 'PAYMENT_CANCELLED'
  | 'EXPIRED'

export type OrderType = 'personal_query' | 'credit_boost'

export interface Order {
  order_id: string
  user_id: string
  order_type: OrderType
  status: OrderStatus
  amount: number
  payment_method?: string
  paid_at?: string
  service_details?: any
  completion_progress: number
  failure_reason?: string
  expires_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

@Injectable()
export class OrderService {
  private orders = new Map<string, Order>()

  private now() { return new Date().toISOString() }

  private fmt(order: Order) {
    return {
      orderId: order.order_id,
      userId: order.user_id,
      orderType: order.order_type,
      status: order.status,
      amount: order.amount,
      paymentMethod: order.payment_method,
      paidAt: order.paid_at,
      serviceDetails: order.service_details,
      completionProgress: order.completion_progress,
      failureReason: order.failure_reason,
      expiresAt: order.expires_at,
      completedAt: order.completed_at,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }
  }

  async createOrder(userId: string, orderType: OrderType, amount: number, serviceDetails?: any) {
    const now = this.now()
    const order: Order = {
      order_id: randomUUID(),
      user_id: userId,
      order_type: orderType,
      status: 'PENDING_PAYMENT',
      amount,
      service_details: serviceDetails,
      completion_progress: 0,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30min
      created_at: now,
      updated_at: now,
    }
    this.orders.set(order.order_id, order)
    return this.fmt(order)
  }

  async getOrder(orderId: string) {
    const order = this.orders.get(orderId)
    return order ? this.fmt(order) : null
  }

  async listOrders(userId: string, status?: OrderStatus) {
    const all = Array.from(this.orders.values())
      .filter(o => o.user_id === userId)
      .filter(o => !status || o.status === status)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return all.map(o => this.fmt(o))
  }

  private update(orderId: string, patch: Partial<Order>) {
    const order = this.orders.get(orderId)
    if (!order) return null
    Object.assign(order, patch, { updated_at: this.now() })
    return this.fmt(order)
  }

  async payOrder(orderId: string, paymentMethod: string) {
    return this.update(orderId, {
      status: 'PAID',
      payment_method: paymentMethod,
      paid_at: this.now(),
      completion_progress: 30,
    })
  }

  async completeOrder(orderId: string) {
    return this.update(orderId, {
      status: 'COMPLETED',
      completion_progress: 100,
      completed_at: this.now(),
    })
  }

  async failOrder(orderId: string, reason?: string) {
    return this.update(orderId, {
      status: 'FAILED',
      failure_reason: reason || '处理失败',
    })
  }

  async abandonOrder(orderId: string, reason?: string) {
    return this.update(orderId, {
      status: 'ABANDONED',
      failure_reason: reason || '处理中断',
    })
  }

  async cancelOrder(orderId: string) {
    return this.update(orderId, { status: 'PAYMENT_CANCELLED' })
  }

  clearUserData(userId: string) {
    for (const [id, order] of this.orders.entries()) {
      if (order.user_id === userId) this.orders.delete(id)
    }
  }
}
