export namespace CoaWxPayIsv {
  export interface Config {
    appId: string,
    mchId: string,
    key: string,
    pfx: Buffer,
    notifyPay: string,
    notifyRefund: string,
  }
}