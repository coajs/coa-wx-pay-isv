# coa-wx-pay-isv

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/coa-wx-pay-isv.svg?style=flat-square)](https://www.npmjs.org/package/coa-wx-pay-isv)
[![npm downloads](https://img.shields.io/npm/dm/coa-wx-pay-isv.svg?style=flat-square)](http://npm-stat.com/charts.html?package=coa-wx-pay-isv)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/coajs/coa-wx-pay-isv/pulls)

轻量的微信支付 SDK 服务商版 for Node.js

## 特点

根据日常实际项目使用情况：

- 覆盖了绝大多数使用场景
- 统一了异步表现形式，全部返回 Promise
- 内置类型引用，无需额外查看文档，开箱即用，IDE 友好

## 快速开始

### 安装

```shell
yarn add coa-wx-pay-isv
```

### 直接使用

```typescript
import { CoaWxPayIsvBin, CoaWxPayIsvService } from 'coa-wx-pay-isv'

// 微信支付配置
const config = {
  appId: 'wx00000000001',
  mchId: '1550000001',
  key: '1125XXXXXXXXXXXXXXXXXXX6E20DE9',
  pfx: Buffer.from('XXXXXXX'),
  notifyPay: 'https://example.com/api/notify/pay',
  notifyRefund: 'https://example.com/api/notify/refund',
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
```

### 错误记录

可以使用自定义 Bin 的方式记录错误信息。

```typescript
import { CoaWxPayIsvBin, CoaWxPayIsvService } from 'coa-wx-pay-isv'

// 微信支付配置
const config = {
  appId: 'wx00000000001',
  mchId: '1550000001',
  key: '1125XXXXXXXXXXXXXXXXXXX6E20DE9',
  pfx: Buffer.from('XXXXXXX'),
  notifyPay: 'https://example.com/api/notify/pay',
  notifyRefund: 'https://example.com/api/notify/refund',
}

// 创建自定义Bin类
class MyCoaWxPayIsvBin extends CoaWxPayIsvBin {
  protected onRequestError(error: Error, response: Axios.AxiosResponse) {
    console.log('error:', error.toString())
    console.log('data:', response.data)
  }
}

// 自定义Bin实例
const bin = new MyCoaWxPayIsvBin(config)

// 是自定义bin创建服务
const service = new CoaWxPayIsvService(bin)

// 错误调用下载日对账单
await service.downloadBill({ date: '' }) // 此时会触发 onRequestError()
```
