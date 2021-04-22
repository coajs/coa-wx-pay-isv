// @ts-nocheck
import { CoaWxPayIsvBin, CoaWxPayIsvService } from '..'

// 微信支付配置
const config = {
  appId: 'wx00000000001',
  mchId: '1550000001',
  key: '1125XXXXXXXXXXXXXXXXXXX6E20DE9',
  pfx: Buffer.from('XXXXXXX'),
  notifyPay: 'https://example.com/api/notify/pay',
  notifyRefund: 'https://example.com/api/notify/refund'
}

// 创建BIN实例
const bin = new CoaWxPayIsvBin(config)

// 创建服务
const service = new CoaWxPayIsvService(bin)

// 统一下单
await service.unifiedOrder({ orderId: 'order000001', appWxaId: 'wx000000002', subMchId: '1660000001', openId: 'openIdxxxxxxx', price: 100 })

// 根据预支付单号，获得支付参数
await service.getPaymentParams({ appWxaId: 'wx000000002', prepayId: 'prepay00001' })

// 查询订单
await service.queryOrder({ orderId: 'order000001', appWxaId: 'wx000000002', subMchId: '1660000001' })

// 退款
await service.payRefund({ refundId: 'refund000001', orderId: 'order000001', price: 100, rawData: {} })

// 查询退款订单
await service.queryRefund({ refundId: 'refund000001', orderId: 'order000001', appWxaId: 'wx000000002', subMchId: '1660000001' })

// 下载日对账单
await service.downloadBill({ date: '20210331' })
