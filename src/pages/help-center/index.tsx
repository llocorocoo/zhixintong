import { View, Text, Textarea } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { ChevronDown, ChevronUp, ChevronRight, MessageCircle, Phone, FileText, BookOpen, Mail } from 'lucide-react-taro'

const FAQ_LIST = [
  { q: '职业信用报告是什么？有什么用？', a: '职业信用报告是记录您个人职业信用信息的权威文件，包含身份认证、学历、职业资格、安全性等6大维度数据。可用于求职背调、职业发展、信用展示等场景。' },
  { q: '生成报告需要多长时间？', a: '提交信息后，系统将在1-3个工作日内完成核查并生成报告。核查完成后会通过平台消息通知您。' },
  { q: '我的个人信息安全吗？', a: '您的数据仅用于生成职业信用报告，平台采用加密存储，不会用于其他商业目的。您可在"隐私设置"中随时管理数据授权。' },
  { q: '信用修复需要多长时间生效？', a: '向主管部门提交信用修复申请后，审核周期通常为5-15个工作日。获取《准予信用修复决定书》后，更新信用报告即可看到最新评分。' },
  { q: '报告有效期是多久？', a: '职业信用报告有效期为1年。建议每季度更新一次，以保持信息时效性。' },
  { q: '如何提升信用评分？', a: '可通过以下方式提升：补充并核实学历、职业资格等证书；完整记录工作履历；授权核查诉讼及失信记录；定期更新信用报告。详见"提升信用"功能。' },
]

const AGREEMENTS = [
  { title: '用户服务协议', desc: '账户注册与使用规则' },
  { title: '隐私政策', desc: '个人数据收集与使用说明' },
  { title: '信用报告授权协议', desc: '信息核查与报告生成授权条款' },
  { title: '免责声明', desc: '报告用途与法律效力说明' },
]

type Tab = 'faq' | 'agreements' | 'contact'

const HelpCenterPage: FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('faq')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [btnPressed, setBtnPressed] = useState(false)

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) { Taro.showToast({ title: '请输入反馈内容', icon: 'none' }); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false); setFeedback('')
    Taro.showToast({ title: '感谢您的反馈', icon: 'success' })
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'faq',        label: '常见问题', icon: FileText },
    { id: 'agreements', label: '规则与协议', icon: BookOpen },
    { id: 'contact',    label: '联系客服', icon: MessageCircle },
  ]

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 0', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px', marginBottom: '16px' }}>帮助中心</Text>

        {/* Tab 切换（嵌入头部底部） */}
        <View style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px 16px 0 0', display: 'flex' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <View
                key={tab.id}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '12px 0', borderBottom: active ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.25s ease' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} color={active ? '#fff' : 'rgba(255,255,255,0.45)'} />
                <Text style={{ fontSize: '12px', fontWeight: active ? '600' : '400', color: active ? '#fff' : 'rgba(255,255,255,0.45)', lineHeight: '1.4', transition: 'all 0.25s ease' }}>{tab.label}</Text>
              </View>
            )
          })}
        </View>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>

        {/* 常见问题 */}
        {activeTab === 'faq' && (
          <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            {FAQ_LIST.map((item, i) => (
              <View key={i} style={{ borderBottom: i < FAQ_LIST.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px' }}
                  onClick={() => setExpanded(expanded === i ? null : i)}>
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', flex: 1, paddingRight: '12px', lineHeight: '1.6' }}>{item.q}</Text>
                  {expanded === i ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </View>
                {expanded === i && (
                  <View style={{ padding: '0 18px 16px' }}>
                    <Text style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.8' }}>{item.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 规则与协议 */}
        {activeTab === 'agreements' && (
          <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
            {AGREEMENTS.map((item, i) => (
              <View key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', borderBottom: i < AGREEMENTS.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{item.title}</Text>
                  <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</Text>
                </View>
                <View style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={14} color="#94a3b8" />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 联系客服 */}
        {activeTab === 'contact' && (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <View style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: MessageCircle, label: '在线客服', sub: '工作日 9:00-18:00', color: '#2563eb', bg: '#eff6ff' },
                { icon: Phone,         label: '电话客服', sub: '400-xxx-xxxx',      color: '#059669', bg: '#f0fdf4' },
                { icon: Mail,          label: '邮件反馈', sub: 'help@example.com',  color: '#7c3aed', bg: '#f5f3ff' },
              ].map((c, i) => (
                <View key={i} style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)' }}>
                  <View style={{ width: '44px', height: '44px', borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={20} color={c.color} />
                  </View>
                  <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>{c.label}</Text>
                  <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5', textAlign: 'center' }}>{c.sub}</Text>
                </View>
              ))}
            </View>

            <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
              <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '12px', lineHeight: '1.5' }}>意见反馈</Text>
              <Textarea
                style={{ width: '100%', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', fontSize: '14px', color: '#0f172a', minHeight: '96px', lineHeight: '1.6' }}
                placeholder="请描述您遇到的问题或建议..."
                value={feedback} onInput={e => setFeedback(e.detail.value)} maxlength={300}
              />
              <View style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 2px 12px' }}>
                <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>感谢您帮助我们改进产品</Text>
                <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>{feedback.length}/300</Text>
              </View>
              <View
                style={{ borderRadius: '14px', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: submitting ? 'none' : '0 4px 14px rgba(37,99,235,0.35)', transform: btnPressed ? 'scale(0.97)' : 'scale(1)', transition: 'all 0.2s ease' }}
                onTouchStart={() => setBtnPressed(true)} onTouchEnd={() => setBtnPressed(false)} onTouchCancel={() => setBtnPressed(false)}
                onClick={submitting ? undefined : handleSubmitFeedback}
              >
                <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>{submitting ? '提交中...' : '提交反馈'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default HelpCenterPage
