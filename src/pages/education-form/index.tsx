import { View, Text, Picker, Input } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { useEnhancementFormStore } from '@/stores/enhancement-form'
import { GraduationCap, ChevronRight, Plus, Trash2 } from 'lucide-react-taro'

const EDU_OPTIONS = ['高中', '大专', '本科', '硕士', '博士']

interface EduItem {
  id: string
  degreeIndex: number
  diplomaCertNo: string
  degreeCertNo: string
}

const genId = () => Math.random().toString(36).substring(2, 9)
const emptyEdu = (): EduItem => ({ id: genId(), degreeIndex: 2, diplomaCertNo: '', degreeCertNo: '' })

const Field: FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <View style={{ marginBottom: '16px' }}>
    <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
      {required && <Text style={{ fontSize: '13px', color: '#ef4444', lineHeight: '1.5' }}>*</Text>}
      <Text style={{ fontSize: '13px', fontWeight: '600', color: '#374151', lineHeight: '1.5' }}>{label}</Text>
    </View>
    {children}
  </View>
)

const EducationFormPage: FC = () => {
  const { saveEducation } = useEnhancementFormStore()
  const [list, setList] = useState<EduItem[]>([emptyEdu()])
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const setItem = (id: string, field: keyof EduItem, value: string | number) =>
    setList(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))

  const removeItem = (id: string) =>
    setList(prev => prev.filter(e => e.id !== id))

  const inputBox = (focused: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    background: focused ? '#eff6ff' : '#f8fafc',
    borderRadius: '12px', padding: '12px 14px',
    border: `1.5px solid ${focused ? '#3b82f6' : 'transparent'}`,
    boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
    transition: 'all 0.25s ease',
  })

  const handleSubmit = () => {
    const filled = list.filter(e => e.diplomaCertNo.trim() || e.degreeCertNo.trim())
    if (filled.length === 0) {
      Taro.showToast({ title: '请至少填写一条编号信息', icon: 'none' })
      return
    }
    saveEducation(filled.map(e => ({
      id: e.id,
      degree: EDU_OPTIONS[e.degreeIndex],
      diplomaCertNo: e.diplomaCertNo.trim(),
      degreeCertNo: e.degreeCertNo.trim(),
    })))
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 说明区 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px' }}>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'block', lineHeight: '1.7' }}>
          填写学信网上的学历及学位证书编号，系统将自动核验并提升您的真实性评分。
        </Text>
      </View>

      {/* 表单列表 */}
      <View style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <View style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.07)' }}>
          <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', display: 'block', marginBottom: '18px' }}>学历信息</Text>

          <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {list.map((edu, idx) => (
              <View key={edu.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
                {/* 条目头 */}
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <View style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
                    </View>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>
                      学历 {list.length > 1 ? idx + 1 : ''}
                    </Text>
                  </View>
                  {list.length > 1 && (
                    <View onClick={() => removeItem(edu.id)} style={{ padding: '4px' }}>
                      <Trash2 size={17} color="#ef4444" />
                    </View>
                  )}
                </View>

                {/* 学历层次 */}
                <Field label="学历层次" required>
                  <Picker
                    mode="selector"
                    range={EDU_OPTIONS}
                    value={edu.degreeIndex}
                    onChange={e => setItem(edu.id, 'degreeIndex', Number(e.detail.value))}
                  >
                    <View style={inputBox(false)}>
                      <GraduationCap size={18} color="#6b7280" />
                      <Text style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5' }}>
                        {EDU_OPTIONS[edu.degreeIndex]}
                      </Text>
                      <ChevronRight size={16} color="#9ca3af" />
                    </View>
                  </Picker>
                </Field>

                {/* 学历证书编号 */}
                <Field label="学历证书编号" required>
                  <View style={inputBox(focusedField === `${edu.id}-diploma`)}>
                    <Input
                      style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5', background: 'transparent' }}
                      placeholder="请输入学历证书编号"
                      placeholderStyle="color:#cbd5e1;font-size:14px;"
                      value={edu.diplomaCertNo}
                      onInput={e => setItem(edu.id, 'diplomaCertNo', e.detail.value)}
                      onFocus={() => setFocusedField(`${edu.id}-diploma`)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </Field>

                {/* 学位证书编号 */}
                <Field label="学位证书编号" required>
                  <View style={inputBox(focusedField === `${edu.id}-degree`)}>
                    <Input
                      style={{ flex: 1, fontSize: '14px', color: '#111827', lineHeight: '1.5', background: 'transparent' }}
                      placeholder="请输入学位证书编号"
                      placeholderStyle="color:#cbd5e1;font-size:14px;"
                      value={edu.degreeCertNo}
                      onInput={e => setItem(edu.id, 'degreeCertNo', e.detail.value)}
                      onFocus={() => setFocusedField(`${edu.id}-degree`)}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </Field>
              </View>
            ))}

            {/* 添加按钮 */}
            <View
              style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #93c5fd', background: '#eff6ff' }}
              onClick={() => setList(prev => [...prev, emptyEdu()])}
            >
              <Plus size={16} color="#2563eb" />
              <Text style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>添加学历</Text>
            </View>
          </View>
        </View>

      </View>

      {/* 底部固定按钮 */}
      <View style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 32px', background: '#fff', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        <View
          style={{
            borderRadius: '14px', padding: '14px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e40af, #2563eb)',
            boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
          }}
          onClick={handleSubmit}
        >
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>保存</Text>
        </View>
      </View>

    </View>
  )
}

export default EducationFormPage
