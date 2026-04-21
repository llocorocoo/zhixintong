import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react-taro'

const PRIVACY_POLICY = `一、信息收集范围

我们将在您生成职业信用报告过程中收集以下个人信息：

1. 身份信息：姓名、身份证号码，用于核实您的真实身份。
2. 学历信息：毕业院校、所学专业、学历层次、证书编号，用于学历核查。
3. 职业资格信息：职业资格证书名称、编号、发证日期，用于资质核查。
4. 上传材料：您主动上传的证书照片等文件材料。

二、信息使用目的

我们收集上述信息的目的为：

1. 生成您的职业信用报告，核查各项信息的真实性与准确性。
2. 在您授权的范围内，通过合法渠道向第三方（如学信网、行业协会）进行信息核实。
3. 改善我们的服务质量与用户体验。

我们承诺：未经您的明确同意，不会将您的个人信息用于上述目的以外的任何商业用途。

三、信息存储与保护

1. 您的个人信息将存储在安全的服务器中，并采用加密措施进行保护。
2. 我们限制内部员工访问您个人信息的权限，仅限于完成工作必要的人员方可访问。
3. 如发生数据安全事件，我们将按照法律规定及时通知您。

四、信息共享

在以下情形下，我们可能与第三方共享您的信息：

1. 征得您的明确同意后。
2. 为完成信息核查，与学信网、公安系统、行业协会等机构共享必要信息。
3. 遵守法律法规、司法程序或政府主管部门的要求。

除上述情形外，我们不会向任何第三方出售或转让您的个人信息。

五、您的权利

您对自己的个人信息享有以下权利：

1. 查阅权：您可随时查阅我们持有的您的个人信息。
2. 更正权：如您发现信息有误，可申请更正。
3. 删除权：在法律允许的范围内，您可申请删除您的个人信息。
4. 撤回授权：您可随时撤回对信息使用的授权，但这可能影响相关服务的提供。

六、隐私政策更新

我们可能会适时更新本隐私政策。更新后，我们将通过应用内通知的方式告知您，请您定期查看。继续使用我们的服务，即视为您接受更新后的隐私政策。

如您对本隐私政策有任何疑问，请通过应用内的客服渠道联系我们。`

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
                <Text style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>《职业信用报告隐私政策》</Text>
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
              我已阅读并知晓上述《职业信用报告隐私政策》的全部内容，同意平台依据上述政策收集和使用我的个人信息。
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
