import { View, Text } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { CircleCheck, ShieldCheck, ArrowRight, FileText } from 'lucide-react-taro'

const SubmitSuccessPage: FC = () => {
  const [btnPressed, setBtnPressed] = useState(false)

  const steps = [
    { num: '1', title: '提交信息', desc: '您的身份、学历、职业资格信息已提交', done: true },
    { num: '2', title: '签署授权书', desc: '授权平台查询您的相关信用信息', done: false, current: true },
    { num: '3', title: '平台核查', desc: '平台核查信息真实性（1-3个工作日）', done: false },
    { num: '4', title: '生成报告', desc: '职业信用报告生成完成', done: false },
  ]

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 头部 */}
      <View style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        padding: '20px 20px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>
          信息已提交
        </Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>
          请继续完成授权，以启动信用核查
        </Text>
      </View>

      <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* 成功状态卡片 */}
        <View style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <View style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <View style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'rgba(5,150,105,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <CircleCheck size={36} color="#059669" />
            </View>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.3', marginBottom: '8px' }}>
              信息已成功提交
            </Text>
            <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', lineHeight: '1.7' }}>
              您的身份信息已安全提交，下一步请签署信息核查授权书，平台将基于您的授权开始核查。
            </Text>
          </View>
        </View>

        {/* 流程进度 */}
        <View style={{ background: '#fff', borderRadius: '20px', padding: '20px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <Text style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '16px', lineHeight: '1.5' }}>
            报告生成流程
          </Text>
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <View key={i} style={{ display: 'flex', gap: '12px' }}>
                {/* 左侧轴 */}
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px', flexShrink: 0 }}>
                  <View style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: step.done ? '#059669' : step.current ? '#2563eb' : '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {step.done
                      ? <CircleCheck size={16} color="#fff" />
                      : <Text style={{ color: step.current ? '#fff' : '#94a3b8', fontSize: '12px', fontWeight: '700', lineHeight: '1' }}>{step.num}</Text>
                    }
                  </View>
                  {i < steps.length - 1 && (
                    <View style={{ width: '2px', flex: 1, minHeight: '16px', margin: '3px 0', background: step.done ? '#059669' : '#e2e8f0' }} />
                  )}
                </View>
                {/* 内容 */}
                <View style={{ flex: 1, paddingBottom: i < steps.length - 1 ? '14px' : '0' }}>
                  <Text style={{
                    fontSize: '14px', fontWeight: step.current ? '700' : '500',
                    color: step.done ? '#059669' : step.current ? '#0f172a' : '#94a3b8',
                    display: 'block', lineHeight: '1.4', marginBottom: '3px',
                  }}>
                    {step.title}
                    {step.current && (
                      <Text style={{ fontSize: '11px', fontWeight: '600', color: '#2563eb', marginLeft: '8px' }}>← 当前步骤</Text>
                    )}
                  </Text>
                  <Text style={{ fontSize: '12px', color: step.done ? '#6ee7b7' : step.current ? '#64748b' : '#cbd5e1', lineHeight: '1.5', display: 'block' }}>
                    {step.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 说明 */}
        <View style={{ background: '#eff6ff', borderRadius: '14px', padding: '12px 14px', borderLeft: '3px solid #2563eb' }}>
          <View style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <ShieldCheck size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '1px' }} />
            <Text style={{ fontSize: '12px', color: '#1e40af', lineHeight: '1.7' }}>
              授权书签署后，平台将通过公安接口、学信网、司法数据等权威渠道核查您的信用信息，核查结果真实可信。
            </Text>
          </View>
        </View>

        {/* 去授权 CTA */}
        <View
          style={{
            borderRadius: '16px', padding: '15px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
            boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
            transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
            transition: 'all 0.2s ease',
          }}
          onTouchStart={() => setBtnPressed(true)}
          onTouchEnd={() => setBtnPressed(false)}
          onTouchCancel={() => setBtnPressed(false)}
          onClick={() => Taro.navigateTo({ url: '/pages/authorize/index' })}
        >
          <ShieldCheck size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>
            前往签署授权书
          </Text>
          <ArrowRight size={16} color="rgba(255,255,255,0.8)" />
        </View>

        {/* 稍后处理 */}
        <View
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}
          onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
        >
          <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            稍后处理，返回首页
          </Text>
        </View>

      </View>
    </View>
  )
}

export default SubmitSuccessPage
