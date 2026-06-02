import { View, Text, ScrollView, Picker, Textarea } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { useEnhancementFormStore } from '@/stores/enhancement-form'
import { ChevronRight, Plus, Trash2 } from 'lucide-react-taro'

interface WorkItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  refName: string
  refContact: string
}

const genId = () => Math.random().toString(36).substring(2, 9)
const emptyWork = (): WorkItem => ({ id: genId(), company: '', position: '', startDate: '', endDate: '', description: '', refName: '', refContact: '' })

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i))
const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const DATE_RANGE = { years: YEARS, months: MONTHS }

const Field: FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <View style={{ marginBottom: '14px' }}>
    <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '7px' }}>
      {required && <Text style={{ fontSize: '13px', color: '#ef4444', lineHeight: '1.5' }}>*</Text>}
      <Text style={{ fontSize: '13px', fontWeight: '500', color: '#374151', lineHeight: '1.5' }}>{label}</Text>
    </View>
    {children}
  </View>
)

const InputBox: FC<{ focused: boolean; children: React.ReactNode }> = ({ focused, children }) => (
  <View style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    background: focused ? '#eff6ff' : '#f8fafc',
    borderRadius: '12px', padding: '12px 14px',
    border: `1.5px solid ${focused ? '#3b82f6' : 'transparent'}`,
    boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
    transition: 'all 0.25s ease',
  }}>
    {children}
  </View>
)

// 解析 "YYYY-MM" → [yearIdx, monthIdx]
const parseDateIdx = (date: string) => {
  const [y, m] = date.split('-')
  const yi = YEARS.indexOf(y)
  const mi = MONTHS.indexOf(m)
  return [yi < 0 ? 0 : yi, mi < 0 ? 0 : mi]
}

// MultiColumnPicker 封装：年-月 两列
const DatePicker: FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => {
  const [yi, mi] = parseDateIdx(value)
  return (
    <Picker
      mode="multiSelector"
      range={[DATE_RANGE.years, DATE_RANGE.months]}
      value={[yi, mi]}
      onChange={e => {
        const [y, m] = e.detail.value as number[]
        onChange(`${YEARS[y]}-${MONTHS[m]}`)
      }}
    >
      <View style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid transparent' }}>
        <Text style={{ fontSize: '14px', color: value ? '#0f172a' : '#cbd5e1', lineHeight: '1.5' }}>
          {value || placeholder}
        </Text>
        <ChevronRight size={15} color="#94a3b8" />
      </View>
    </Picker>
  )
}

const WorkFormPage: FC = () => {
  const { saveWork } = useEnhancementFormStore()
  const [list, setList] = useState<WorkItem[]>([emptyWork()])
  const [focusField, setFocusField] = useState<string | null>(null)
  const [btnPressed, setBtnPressed] = useState(false)


  const setWork = (id: string, field: keyof WorkItem, value: string) =>
    setList(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w))

  const removeWork = (id: string) =>
    setList(prev => prev.filter(w => w.id !== id))

  const handleSubmit = () => {
    const filled = list.filter(w => w.company || w.position)
    if (filled.length === 0) {
      Taro.showToast({ title: '请至少填写一条工作信息', icon: 'none' })
      return
    }
    const invalid = filled.find(w => !w.company || !w.position)
    if (invalid) {
      Taro.showToast({ title: '请填写公司名称和职位', icon: 'none' })
      return
    }
    saveWork(filled.map(w => ({ ...w })))
    Taro.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 800)
  }

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* 蓝色渐变头部 */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 24px', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', display: 'block', lineHeight: '1.5' }}>
          带 * 为必填项，其他信息可跳过
        </Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 130px)' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <View style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', display: 'block', marginBottom: '18px' }}>工作信息</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {list.map((work, idx) => (
                <View key={work.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
                  {/* 条目头 */}
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <View style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
                      </View>
                      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>
                        工作经历 {list.length > 1 ? idx + 1 : ''}
                      </Text>
                    </View>
                    {list.length > 1 && (
                      <View onClick={() => removeWork(work.id)} style={{ padding: '4px' }}>
                        <Trash2 size={17} color="#ef4444" />
                      </View>
                    )}
                  </View>

                  {/* 公司名称 */}
                  <Field label="公司名称" required>
                    <InputBox focused={focusField === `${work.id}-company`}>
                      <Input
                        style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                        placeholder="请输入公司名称" placeholderStyle="color:#cbd5e1;"
                        value={work.company}
                        onFocus={() => setFocusField(`${work.id}-company`)} onBlur={() => setFocusField(null)}
                        onInput={e => setWork(work.id, 'company', e.detail.value)}
                      />
                    </InputBox>
                  </Field>

                  {/* 职位 */}
                  <Field label="职位" required>
                    <InputBox focused={focusField === `${work.id}-position`}>
                      <Input
                        style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                        placeholder="请输入职位名称" placeholderStyle="color:#cbd5e1;"
                        value={work.position}
                        onFocus={() => setFocusField(`${work.id}-position`)} onBlur={() => setFocusField(null)}
                        onInput={e => setWork(work.id, 'position', e.detail.value)}
                      />
                    </InputBox>
                  </Field>

                  {/* 入职时间 */}
                  <Field label="入职时间">
                    <DatePicker
                      value={work.startDate}
                      onChange={v => setWork(work.id, 'startDate', v)}
                      placeholder="请选择入职时间"
                    />
                  </Field>

                  {/* 离职时间 */}
                  <Field label="离职时间">
                    <View style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        {work.endDate === '至今' ? (
                          <View style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1.5px solid transparent' }}>
                            <Text style={{ fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}>至今</Text>
                          </View>
                        ) : (
                          <DatePicker
                            value={work.endDate}
                            onChange={v => setWork(work.id, 'endDate', v)}
                            placeholder="请选择离职时间"
                          />
                        )}
                      </View>
                      <View
                        style={{
                          padding: '8px 12px', borderRadius: '10px', flexShrink: 0,
                          background: work.endDate === '至今' ? '#2563eb' : '#f1f5f9',
                        }}
                        onClick={() => setWork(work.id, 'endDate', work.endDate === '至今' ? '' : '至今')}
                      >
                        <Text style={{ fontSize: '13px', fontWeight: '500', color: work.endDate === '至今' ? '#fff' : '#64748b', lineHeight: '1.5' }}>至今</Text>
                      </View>
                    </View>
                  </Field>

                  {/* 工作职责及内容 */}
                  <Field label="工作职责及内容">
                    <View style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: '#fff',
                      borderRadius: '12px', padding: '12px 14px',
                      border: `1.5px solid ${focusField === `${work.id}-desc` ? '#3b82f6' : 'transparent'}`,
                      boxShadow: focusField === `${work.id}-desc` ? '0 0 0 3px rgba(59,130,246,0.08)' : 'none',
                      transition: 'all 0.25s ease',
                    }}>
                      <Textarea
                        style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5', minHeight: '80px', width: '100%' }}
                        placeholder="请描述主要工作职责和工作内容"
                        placeholderStyle="color:#cbd5e1;font-size:14px;"
                        value={work.description}
                        onFocus={() => setFocusField(`${work.id}-desc`)} onBlur={() => setFocusField(null)}
                        onInput={e => setWork(work.id, 'description', e.detail.value)}
                        autoHeight
                      />
                    </View>
                  </Field>

                  {/* 证明人姓名 */}
                  <Field label="证明人姓名">
                    <InputBox focused={focusField === `${work.id}-refName`}>
                      <Input
                        style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                        placeholder="请输入证明人姓名" placeholderStyle="color:#cbd5e1;"
                        value={work.refName}
                        onFocus={() => setFocusField(`${work.id}-refName`)} onBlur={() => setFocusField(null)}
                        onInput={e => setWork(work.id, 'refName', e.detail.value)}
                      />
                    </InputBox>
                  </Field>

                  {/* 证明人联系方式 */}
                  <Field label="证明人联系方式">
                    <InputBox focused={focusField === `${work.id}-refContact`}>
                      <Input
                        style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                        placeholder="请输入证明人手机号或邮箱" placeholderStyle="color:#cbd5e1;"
                        value={work.refContact}
                        onFocus={() => setFocusField(`${work.id}-refContact`)} onBlur={() => setFocusField(null)}
                        onInput={e => setWork(work.id, 'refContact', e.detail.value)}
                      />
                    </InputBox>
                  </Field>

                </View>
              ))}

              {/* 添加按钮 */}
              <View
                style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #93c5fd', background: '#eff6ff' }}
                onClick={() => setList(prev => [...prev, emptyWork()])}
              >
                <Plus size={16} color="#2563eb" />
                <Text style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>添加工作经历</Text>
              </View>
              <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
                可添加多段工作经历，按时间倒序填写
              </Text>
            </View>
          </View>

          {/* 底部按钮 */}
          <View style={{ paddingBottom: '24px' }}>
            <View
              style={{
                borderRadius: '16px', padding: '14px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: '0 6px 20px rgba(37,99,235,0.38)',
                transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onTouchStart={() => setBtnPressed(true)} onTouchEnd={() => setBtnPressed(false)} onTouchCancel={() => setBtnPressed(false)}
              onClick={handleSubmit}
            >
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>保存</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

export default WorkFormPage
