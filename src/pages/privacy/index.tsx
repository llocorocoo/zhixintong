import { View, Text, Switch } from '@tarojs/components'
import { FC, useState } from 'react'
import { Shield, Database, Eye, Share2, FileText } from 'lucide-react-taro'

interface AuthItem {
  id: string; icon: any; title: string; desc: string; enabled: boolean; required?: boolean
}

const PrivacyPage: FC = () => {
  const [items, setItems] = useState<AuthItem[]>([
    { id: 'identity',  icon: Shield,  title: '身份信息核查授权', desc: '授权平台通过公安接口核验您的身份信息',          enabled: true,  required: true },
    { id: 'education', icon: FileText, title: '学历信息核查授权', desc: '授权平台通过学信网核验学历学位信息',              enabled: true  },
    { id: 'credit',    icon: Database, title: '征信查询授权',    desc: '授权平台查询个人征信报告（用于可靠性评分）',       enabled: false },
    { id: 'judicial',  icon: Eye,      title: '司法数据查询授权', desc: '授权平台查询诉讼记录、失信名单等司法数据',         enabled: true  },
    { id: 'share',     icon: Share2,   title: '报告共享授权',    desc: '允许通过链接将您的信用报告分享给第三方查看',       enabled: false },
  ])

  const toggle = (id: string) =>
    setItems(prev => prev.map(item => item.id === id && !item.required ? { ...item, enabled: !item.enabled } : item))

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>隐私设置</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>管理您的数据授权与隐私选项</Text>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '32px' }}>

        {/* 说明提示 */}
        <View style={{ background: '#eff6ff', borderRadius: '14px', padding: '12px 14px', borderLeft: '3px solid #2563eb' }}>
          <Text style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.7' }}>
            以下授权仅用于生成您的职业信用报告，平台不会将您的数据用于其他商业目的。您可随时撤销非必要授权。
          </Text>
        </View>

        {/* 授权列表 */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f8fafc' }}>
            <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.5' }}>数据授权管理</Text>
          </View>
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <View key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <View style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', flexShrink: 0 }}>
                  <Icon size={18} color="#2563eb" />
                </View>
                <View style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <Text style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', lineHeight: '1.4' }}>{item.title}</Text>
                    {item.required && (
                      <View style={{ background: '#f1f5f9', borderRadius: '4px', padding: '1px 6px' }}>
                        <Text style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.5' }}>必要</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>{item.desc}</Text>
                </View>
                <Switch checked={item.enabled} color="#2563eb" disabled={item.required} onChange={() => toggle(item.id)} />
              </View>
            )
          })}
        </View>

        {/* 数据删除 */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px', lineHeight: '1.5' }}>删除我的数据</Text>
          <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '14px', lineHeight: '1.6' }}>
            申请删除后，平台将在15个工作日内清除您的全部个人数据，该操作不可逆。
          </Text>
          <View style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
            <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444', lineHeight: '1.5' }}>申请删除所有数据</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PrivacyPage
