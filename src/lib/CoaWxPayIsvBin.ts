import { die } from 'coa-error'
import { $, axios, Axios, _ } from 'coa-helper'
import { secure } from 'coa-secure'
import { xml } from 'coa-xml'
import { Agent } from 'https'
import { CoaWxPayIsv } from '../typings'

const baseURL = 'https://api.mch.weixin.qq.com/'

interface Dic<T = any> {
  [key: string]: any
}

export class CoaWxPayIsvBin {


  public readonly config: CoaWxPayIsv.Config
  public readonly httpsAgent: Agent

  constructor (config: CoaWxPayIsv.Config) {
    this.config = config
    this.httpsAgent = new Agent({ pfx: config.pfx, passphrase: config.mchId })
  }

  generateSignature (object: Dic) {
    const paramList: any[] = []
    _.forEach(object, (v, k) => {
      if (v) paramList.push(k + '=' + v)
    })
    paramList.sort()
    paramList.push('key=' + this.config.key)
    const paramString = paramList.join('&')
    return secure.md5(paramString).toUpperCase()
  }

  createNonceStr () {
    return Math.random().toString(36).substr(2, 15)
  }

  async attachSignature (param: Dic, signName = 'sign') {
    param[signName] = this.generateSignature(param)
    return await xml.encode(param)
  }

  async post (url: string, data: Dic | string, config: Axios.AxiosRequestConfig = {}) {
    const res = await axios({ url, data, baseURL, method: 'POST', ...config })
    return await this.responseResult(res)
  }

  private async responseResult (res: Axios.AxiosResponse) {
    const text = res.data as string || ''
    if (!text) die.error('微信支付服务器数据异常')
    if (!text.startsWith('<xml')) return text
    const info: any = await xml.decode(text)
    info.return_code === 'SUCCESS' || die.error(info.return_msg)
    info.result_code === 'SUCCESS' || die.error(info.err_code + ':' + info.err_code_des)
    return $.camelCaseKeys(info)
  }
}