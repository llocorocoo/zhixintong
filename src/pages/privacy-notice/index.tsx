import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react-taro'

const PRIVACY_POLICY = `版本：1.0　　生效日期：2025年1月1日　　适用范围：本次信用报告查询服务

第一条　总则

本声明依据《中华人民共和国个人信息保护法》《征信业管理条例》及相关法律法规制定。在您使用本平台的"个人职业信用报告查询"服务前，请仔细阅读本声明的全部内容。

您勾选同意即表示您已充分理解并接受本声明的各项条款，并授权我司按本声明所述方式收集、核验及使用您的相关信息，用于本次职业信用报告查询服务。若您不同意，请勿继续操作。

第二条　信息收集范围

为完成职业信用报告核查，我司将收集以下必要信息：姓名、身份证号码、手机号码、现任职单位名称、职务/岗位、从业年限、学历及毕业院校、职业资质证书编号（如有）。

以上信息均为服务所必需，我司不会收集与本次查询目的无关的个人信息。您可拒绝提供非必要字段，但可能影响报告的完整性。

第三条　信息使用目的

您提供的个人信息仅用于以下目的，未经您的再次明确授权，不得用于其他用途：核验您的身份真实性，防止信息误用或冒用；查询并比对职业信用报告中的相应核查项目；生成供您本人查阅的个人职业信用报告；依法配合监管机构的数据合规审查。

第四条　信息存储与保护

您的个人信息存储于境内符合国家安全等级保护标准（不低于三级）的服务器中，传输全程采用 TLS 加密，数据库采用脱敏存储。

本次查询所收集的信息将在查询服务完成后保留不超过 3 年，届满后予以删除或匿名化处理，除法律法规另有规定外。

第五条　信息共享与第三方披露

我司不会向任何第三方出售您的个人信息。仅在以下情形下可能进行必要的信息共享：经您明确授权，向您指定的机构（如用人单位、金融机构）提供报告核验结果；与合作的职业信用数据库服务商进行核验比对（受同等保密义务约束）；依据法律法规要求或司法机关、监管机构的合法指令。

第六条　您的权利

依据个人信息保护相关法律，您享有以下权利，可随时通过本平台或客服渠道行使：

查阅权——查看我司持有的您的个人信息；更正权——要求更正不准确或不完整的信息；删除权——在法定情形下要求删除您的个人信息；撤回同意权——撤回本授权，但不影响撤回前已完成的处理活动的合法性；投诉权——向相关监管机构投诉或举报。

第七条　未成年人保护

本服务仅面向具有完全民事行为能力的成年用户（年满18周岁）。若您为未成年人，请勿使用本服务。如发现未成年人提交信息，我司将立即停止处理并删除相关数据。

第八条　声明的更新

我司可能因业务调整或法规变化而更新本声明。重大变更将通过平台公告或短信方式提前15日通知您，更新后的声明将于公告之日起生效。继续使用本服务即视为您接受更新后的条款。

第九条　联系我们

如您对本声明有任何疑问，或需行使上述权利，请通过以下方式联系我司个人信息保护专员：

电子邮件：privacy@yourcompany.com
客服热线：400-XXX-XXXX
工作时间：周一至周五 09:00–18:00（法定节假日除外）`

const highlights = [
  { icon: Lock,       color: '#2563eb', bg: '#eff6ff', text: '信息加密存储，全程安全保护' },
  { icon: Eye,        color: '#059669', bg: '#f0fdf4', text: '仅用于生成报告，不作商业用途' },
  { icon: Database,   color: '#7c3aed', bg: '#f5f3ff', text: '您可随时申请查阅或删除数据' },
]

const PrivacyNoticePage: FC = () => {
  const [agreed, setAgreed] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)

  const handleNext = () => {
    if (!agreed) return
    Taro.navigateTo({ url: '/pages/report-form/index' })
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 头部 */}
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '20px 20px 28px', position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={24} color="#fff" />
          </View>
          <View>
            <Text style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>隐私声明</Text>
            <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '3px', lineHeight: '1.5' }}>请仔细阅读以下隐私政策内容</Text>
          </View>
        </View>
      </View>

      {/* 主内容 */}
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ScrollView scrollY style={{ flex: 1 }}>
          <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '8px' }}>

            {/* 亮点摘要 */}
            <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {highlights.map((h, i) => {
                const Icon = h.icon
                return (
                  <View key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: h.bg, borderRadius: '12px', padding: '10px 14px' }}>
                    <View style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} color={h.color} />
                    </View>
                    <Text style={{ fontSize: '13px', color: '#0f172a', lineHeight: '1.5', fontWeight: '500' }}>{h.text}</Text>
                  </View>
                )
              })}
            </View>

            {/* 隐私政策正文 */}
            <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
              <View style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f1f5f9' }}>
                <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>《个人职业信用报告查询服务隐私声明》</Text>
              </View>
              <View style={{ padding: '14px 18px 18px' }}>
                <Text style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.9' }}>
                  {PRIVACY_POLICY}
                </Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* 底部固定区域 */}
        <View style={{ flexShrink: 0, padding: '12px 16px 24px', background: '#f6f8fc', borderTop: '1px solid #e2e8f0' }}>
          {/* 勾选同意 */}
          <View
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px', padding: '12px 14px', background: '#fff', borderRadius: '14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            onClick={() => setAgreed(!agreed)}
          >
            <View style={{
              width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '1px',
              background: agreed ? '#2563eb' : '#fff',
              border: `2px solid ${agreed ? '#2563eb' : '#d1d5db'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}>
              {agreed && <Text style={{ color: '#fff', fontSize: '12px', fontWeight: '700', lineHeight: '1' }}>✓</Text>}
            </View>
            <Text style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', flex: 1 }}>
              我已阅读并知晓上述《个人职业信用报告查询服务隐私声明》的全部内容，同意平台依据本声明收集、核验及使用我的相关信息。
            </Text>
          </View>

          {/* 下一步按钮 */}
          <View
            style={{
              borderRadius: '16px', padding: '15px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: agreed
                ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)'
                : '#e2e8f0',
              boxShadow: agreed ? '0 6px 20px rgba(37,99,235,0.35)' : 'none',
              transform: btnPressed && agreed ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onTouchStart={() => setBtnPressed(true)}
            onTouchEnd={() => setBtnPressed(false)}
            onTouchCancel={() => setBtnPressed(false)}
            onClick={handleNext}
          >
            <Text style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.5', color: agreed ? '#fff' : '#94a3b8' }}>
              下一步
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PrivacyNoticePage
