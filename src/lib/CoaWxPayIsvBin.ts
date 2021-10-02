import { CoaError } from 'coa-error'
import { $, axios, Axios, _ } from 'coa-helper'
import { secure } from 'coa-secure'
import { xml } from 'coa-xml'
import { Agent } from 'https'
import { CoaWxPayIsv } from '../typings'

const baseURL = 'https://api.mch.weixin.qq.com'

interface Dic<T = any> {
  [key: string]: T
}

export class CoaWxPayIsvBin {
  public readonly config: CoaWxPayIsv.Config
  public readonly httpsAgent: Agent

  constructor(config: CoaWxPayIsv.Config) {
    this.config = config
    this.httpsAgent = new Agent({ pfx: config.pfx, passphrase: config.mchId })
  }

  // 生成签名
  generateSignature(object: Dic) {
    const paramList: any[] = []
    _.forEach(object, (v, k) => {
      if (v) paramList.push(k + '=' + v)
    })
    paramList.sort(undefined)
    paramList.push('key=' + this.config.key)
    const paramString = paramList.join('&')
    return secure.md5(paramString).toUpperCase()
  }

  // 生成随机字符串
  generateNonceString() {
    return Math.random().toString(36).substr(2, 15)
  }

  // 转换为已经签名的XML参数
  async toSignedXmlParams(param: Dic, signName = 'sign') {
    param[signName] = this.generateSignature(param)
    return await xml.encode(param)
  }

  // 进行post请求
  async post(
    url: string,
    data: Dic | string,
    config: Axios.AxiosRequestConfig = {}
  ) {
    const res = await axios({
      url,
      data,
      baseURL,
      method: 'POST',
      ...config,
    }).catch((e) => e)
    // 处理结果
    try {
      return await this.handleResult(res)
    } catch (e) {
      this.onRequestError(e, res)
      throw e
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onRequestError(error: Error, response: Axios.AxiosResponse) {
    // handle request error
  }

  // 处理响应结果
  private async handleResult(res: Axios.AxiosResponse) {
    const text = (res.data as string) || ''
    if (!text)
      CoaError.throw('CoaWxPayIsv.ServeCallError', '微信支付服务器数据异常')
    if (!text.startsWith('<xml')) return text
    const info: any = await xml.decode(text)
    info.return_code === 'SUCCESS' ||
      CoaError.throw('CoaWxPayIsv.ServeReturnError', info.return_msg)
    info.result_code === 'SUCCESS' ||
      CoaError.throw(
        'CoaWxPayIsv.ServeResultError',
        info.err_code + ':' + info.err_code_des
      )
    return $.camelCaseKeys(info)
  }
}
