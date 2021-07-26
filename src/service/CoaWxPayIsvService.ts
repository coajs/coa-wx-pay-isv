import { CoaError } from 'coa-error'
import { _ } from 'coa-helper'
import { secure } from 'coa-secure'
import { xml } from 'coa-xml'
import { CoaWxPayIsvBin } from '../lib/CoaWxPayIsvBin'

export class CoaWxPayIsvService {
  private readonly bin: CoaWxPayIsvBin

  constructor(bin: CoaWxPayIsvBin) {
    this.bin = bin
  }

  // 解码微信返回的信息
  async decodeInfo(encodeString: string) {
    const keyDecode = secure.md5(this.bin.config.key)
    const xmlData = secure.aes_decode(encodeString, keyDecode)
    return (await xml.decode(xmlData)) || {}
  }

  // 获取支付参数
  getPaymentParams(data: { appWxaId: string; prepayId: string }) {
    const prepayId = data.prepayId || CoaError.message('CoaWxPayIsv.MissingField', '缺少prepayId')
    const param: any = {
      appId: data.appWxaId || CoaError.message('CoaWxPayIsv.MissingField', '缺少appWxaId'),
      timeStamp: _.toString(_.toInteger(_.now() / 1000)),
      nonceStr: this.bin.generateNonceString(),
      signType: 'MD5',
      package: 'prepay_id=' + prepayId,
    }
    param.paySign = this.bin.generateSignature(param)
    delete param.appId
    param.prepayId = prepayId
    return param
  }

  // 微信支付统一下单
  async unifiedOrder(data: { orderId: string; price: number; appWxaId: string; subMchId: string; openId: string; body: string }) {
    const param = {
      appid: this.bin.config.appId,
      mch_id: this.bin.config.mchId,
      nonce_str: this.bin.generateNonceString(),
      sub_appid: data.appWxaId || CoaError.message('CoaWxPayIsv.MissingField', '缺少appWxaId'),
      sub_mch_id: data.subMchId || CoaError.message('CoaWxPayIsv.MissingField', '缺少subMchId'),
      sub_openid: data.openId || CoaError.message('CoaWxPayIsv.MissingField', '缺少openId'),
      body: data.body || '订单' + data.orderId,
      out_trade_no: data.orderId || CoaError.message('CoaWxPayIsv.MissingField', '缺少orderId'),
      total_fee: data.price || CoaError.message('CoaWxPayIsv.MissingField', '缺少order price'),
      spbill_create_ip: '1.1.1.1',
      notify_url: `${this.bin.config.notifyPay}.${data.orderId}`,
      trade_type: 'JSAPI',
    }
    const body = await this.bin.toSignedXmlParams(param)
    return await this.bin.post('/pay/unifiedorder', body)
  }

  // 退款
  async payRefund(data: { refundId: string; orderId: string; totalPrice: number; refundPrice: number; rawData: any }) {
    const rawData = data.rawData || CoaError.message('CoaWxPayIsv.MissingField', '数据不存在')
    const refundId = data.refundId || CoaError.message('CoaWxPayIsv.MissingField', '缺少退款ID')
    const orderId = data.orderId || CoaError.message('CoaWxPayIsv.MissingField', '缺少订单ID')
    const totalPrice = data.totalPrice || CoaError.message('CoaWxPayIsv.MissingField', '缺少总价格')
    const refundPrice = data.refundPrice || CoaError.message('CoaWxPayIsv.MissingField', '缺少退款价格')
    const param = {
      appid: this.bin.config.appId,
      mch_id: this.bin.config.mchId,
      nonce_str: this.bin.generateNonceString(),
      sub_appid: rawData.subAppid || rawData.sub_appid || CoaError.message('CoaWxPayIsv.MissingField', '缺少rawData.subAppid，暂时无法退款'),
      sub_mch_id: rawData.subMchId || rawData.sub_mch_id || CoaError.message('CoaWxPayIsv.MissingField', '缺少rawData.subMchId，暂时无法退款'),
      out_trade_no: rawData.outTradeNo || rawData.out_trade_no || CoaError.message('CoaWxPayIsv.MissingField', '缺少rawData.outTradeNo，暂时无法退款'),
      out_refund_no: refundId,
      total_fee: totalPrice,
      refund_fee: refundPrice,
      notify_url: `${this.bin.config.notifyRefund}.${orderId}`,
    }
    const body = await this.bin.toSignedXmlParams(param)
    return await this.bin.post('/secapi/pay/refund', body, { httpsAgent: this.bin.httpsAgent })
  }

  // 查询订单状态
  async queryOrder(data: { orderId: string; appWxaId: string; subMchId: string }) {
    const param = {
      appid: this.bin.config.appId,
      mch_id: this.bin.config.mchId,
      nonce_str: this.bin.generateNonceString(),
      sub_appid: data.appWxaId || CoaError.message('CoaWxPayIsv.MissingField', '缺少appWxaId'),
      sub_mch_id: data.subMchId || CoaError.message('CoaWxPayIsv.MissingField', '缺少subMchId'),
      out_trade_no: data.orderId || CoaError.message('CoaWxPayIsv.MissingField', '缺少orderId'),
    }
    const body = await this.bin.toSignedXmlParams(param)
    return await this.bin.post('/pay/orderquery', body)
  }

  // 查询订单退款状态
  async queryRefund(data: { orderId: string; refundId: string; appWxaId: string; subMchId: string }) {
    const param = {
      appid: this.bin.config.appId,
      mch_id: this.bin.config.mchId,
      nonce_str: this.bin.generateNonceString(),
      sub_appid: data.appWxaId || CoaError.message('CoaWxPayIsv.MissingField', '缺少appWxaId'),
      sub_mch_id: data.subMchId || CoaError.message('CoaWxPayIsv.MissingField', '缺少subMchId'),
      out_trade_no: data.orderId || CoaError.message('CoaWxPayIsv.MissingField', '缺少orderId'),
      out_refund_no: data.refundId || CoaError.message('CoaWxPayIsv.MissingField', '缺少refundId'),
    }
    const body = await this.bin.toSignedXmlParams(param)
    return await this.bin.post('/pay/refundquery', body)
  }

  // 下载账单
  async downloadBill(data: { date: string }) {
    const param = {
      appid: this.bin.config.appId,
      mch_id: this.bin.config.mchId,
      nonce_str: this.bin.generateNonceString(),
      bill_date: data.date || CoaError.message('CoaWxPayIsv.MissingField', '缺少date'),
      bill_type: 'ALL',
    }
    const body = await this.bin.toSignedXmlParams(param)
    return await this.bin.post('/pay/downloadbill', body, { maxBodyLength: 1024 * 1024 * 1024, maxRedirects: 1024 * 1024 * 1024 })
  }
}
