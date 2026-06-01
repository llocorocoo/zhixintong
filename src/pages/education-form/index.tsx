import { View, Text, Picker, Input } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { GraduationCap, Hash, ChevronRight } from 'lucide-react-taro'

const EDU_OPTIONS = ['高中', '大专', '本科', '硕士', '博士']

const Field: FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <View style={{ marginBottom: '20px' }}>
    <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
      {required && <Text style={{ fontSize: '13px', color: '#ef4444', lineHeight: '1.5' }}>*</Text>}
      <Text style={{ fontSize: '13px', fontWeight: '600', color: '#374151', lineHeight: '1.5' }}>{label}</Text>
    </View>
    {children}
  </View>
)

const EducationFormPage: FC = () => {
  const { userInfo } = useUserStore()
  const [eduIndex, setEduIndex] = useState(2) // 默认本科
  const [diplomaCertNo, setDiplomaCertNo] = useState('')
  const [degreeCertNo, setDegreeCertNo] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!diplomaCertNo.trim() && !degreeCertNo.trim()) {
      Taro.showToast({ title: '请至少填写一项编号', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await Network.request({
        url: '/api/enhancement/educations/add',
        method: 'POST',
        data: {
          userId: userInfo?.id,
          degree: EDU_OPTIONS[eduIndex],
          diplomaCertNo: diplomaCertNo.trim(),
          degreeCertNo: degreeCertNo.trim(),
        }
      })
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputBox = (focused: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    background: focused ? '#eff6ff' : '#f8fafc',
    borderRadius: '12px', padding: '12px 14px',
    border: `1.5px solid ${focused ? '#3b82f6' : 'transparent'}`,
    boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
    transition: 'all 0.25s ease',
  })

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 说明区 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px' }}>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: '1.7' }}>
          填写学信网上的学历及学位证书编号，系统将自动核验并提升您的真实性评分。
        </Text>
      </View>

      {/* 表单 */}
      <View style={{ flex: 1, padding: '20px 16px 32px' }}>
        <View style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>

          {/* 学历层次 */}
          <Field label="学历层次" required>
            <Picker
              mode="selector"
              range={EDU_OPTIONS}
              value={eduIndex}
              onChange={e => setEduIndex(Number(e.detail.value))}
            >
              <View style={inputBox(false)}>
                <GraduationCap size={18} color="#6b7280" />
                <Text style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5' }}>
                  {EDU_OPTIONS[eduIndex]}
                </Text>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            </Picker>
          </Field>

          {/* 学历编号 */}
          <Field label="学历证书编号">
            <View style={inputBox(focusedField === 'diploma')}>
              <Hash size={18} color="#6b7280" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5', background: 'transparent' }}
                placeholder="请输入学历证书编号"
                placeholderStyle="color: #9ca3af"
                value={diplomaCertNo}
                onInput={e => setDiplomaCertNo(e.detail.value)}
                onFocus={() => setFocusedField('diploma')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </Field>

          {/* 学位编号 */}
          <Field label="学位证书编号">
            <View style={inputBox(focusedField === 'degree')}>
              <Hash size={18} color="#6b7280" />
              <Input
                style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5', background: 'transparent' }}
                placeholder="请输入学位证书编号"
                placeholderStyle="color: #9ca3af"
                value={degreeCertNo}
                onInput={e => setDegreeCertNo(e.detail.value)}
                onFocus={() => setFocusedField('degree')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </Field>

        </View>

        {/* 提示 */}
        <View style={{ marginTop: '12px', padding: '12px 14px', background: '#fffbeb', borderRadius: '12px', display: 'flex', gap: '8px' }}>
          <Text style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.7' }}>
            学历编号和学位编号可在学信网（chsi.com.cn）查询，填写后系统将自动核验。
          </Text>
        </View>
      </View>

      {/* 底部按钮 */}
      <View style={{ padding: '0 16px 32px', flexShrink: 0 }}>
        <View
          style={{
            borderRadius: '14px', padding: '14px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #1e40af, #2563eb)',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          }}
          onClick={submitting ? undefined : handleSubmit}
        >
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>
            {submitting ? '提交中…' : '提交认证'}
          </Text>
        </View>
      </View>

    </View>
  )
}

export default EducationFormPage
