import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  User, GraduationCap, Award, Upload,
  ChevronRight, CircleCheck, Plus, Trash2
} from 'lucide-react-taro'

interface EducationItem {
  id: string; education: string; school: string; major: string
  degreeCertNo: string; diplomaCertNo: string; files: string[]
}
interface QualificationItem {
  id: string; qualification: string; certNumber: string; issueDate: string; files: string[]
}
interface FormData {
  realName: string; idCard: string
  educationList: EducationItem[]; qualificationList: QualificationItem[]
}

const EDU_OPTIONS = ['高中', '大专', '本科', '硕士', '博士']
const genId = () => Math.random().toString(36).substring(2, 9)
const emptyEdu = (): EducationItem => ({ id: genId(), education: '本科', school: '', major: '', degreeCertNo: '', diplomaCertNo: '', files: [] })
const emptyQual = (): QualificationItem => ({ id: genId(), qualification: '', certNumber: '', issueDate: '', files: [] })

const STEPS = [
  { title: '身份信息', icon: User,          required: true  },
  { title: '学历信息', icon: GraduationCap, required: false },
  { title: '职业资格', icon: Award,         required: false },
]

// ── 通用输入框 ──
const Field: FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <View style={{ marginBottom: '14px' }}>
    <View style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '7px' }}>
      <Text style={{ fontSize: '13px', fontWeight: '500', color: '#374151', lineHeight: '1.5' }}>{label}</Text>
      {required && <Text style={{ fontSize: '12px', color: '#ef4444', lineHeight: '1' }}>*</Text>}
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

const ReportFormPage: FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [btnPressed, setBtnPressed] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    realName: '', idCard: '',
    educationList: [emptyEdu()],
    qualificationList: [emptyQual()],
  })
  const { userInfo } = useUserStore()

  const setField = (field: keyof FormData, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const setEdu = (id: string, field: keyof EducationItem, value: string) =>
    setFormData(prev => ({ ...prev, educationList: prev.educationList.map(e => e.id === id ? { ...e, [field]: value } : e) }))

  const setQual = (id: string, field: keyof QualificationItem, value: string) =>
    setFormData(prev => ({ ...prev, qualificationList: prev.qualificationList.map(q => q.id === id ? { ...q, [field]: value } : q) }))

  const removeEdu = (id: string) => {
    if (formData.educationList.length <= 1) { Taro.showToast({ title: '至少保留一条学历信息', icon: 'none' }); return }
    setFormData(prev => ({ ...prev, educationList: prev.educationList.filter(e => e.id !== id) }))
  }
  const removeQual = (id: string) => {
    if (formData.qualificationList.length <= 1) { Taro.showToast({ title: '至少保留一条职业资格', icon: 'none' }); return }
    setFormData(prev => ({ ...prev, qualificationList: prev.qualificationList.filter(q => q.id !== id) }))
  }

  const handleUpload = async (type: 'education' | 'qualification', id: string) => {
    try {
      const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
      Taro.showLoading({ title: '上传中...' })
      const up = await Network.uploadFile({ url: '/api/upload', filePath: res.tempFilePaths[0], name: 'file' })
      const r = typeof up.data === 'string' ? JSON.parse(up.data) : up.data
      if (r.code === 200 && r.data) {
        const url = r.data.url
        if (type === 'education')
          setFormData(prev => ({ ...prev, educationList: prev.educationList.map(e => e.id === id ? { ...e, files: [...e.files, url] } : e) }))
        else
          setFormData(prev => ({ ...prev, qualificationList: prev.qualificationList.map(q => q.id === id ? { ...q, files: [...q.files, url] } : q) }))
        Taro.showToast({ title: '上传成功', icon: 'success' })
      }
    } catch { Taro.showToast({ title: '上传失败', icon: 'none' }) }
    finally { Taro.hideLoading() }
  }

  const removeFile = (type: 'education' | 'qualification', id: string, idx: number) => {
    if (type === 'education')
      setFormData(prev => ({ ...prev, educationList: prev.educationList.map(e => e.id === id ? { ...e, files: e.files.filter((_, i) => i !== idx) } : e) }))
    else
      setFormData(prev => ({ ...prev, qualificationList: prev.qualificationList.map(q => q.id === id ? { ...q, files: q.files.filter((_, i) => i !== idx) } : q) }))
  }

  const handleNext = () => {
    if (currentStep === 0 && (!formData.realName || !formData.idCard)) {
      Taro.showToast({ title: '请填写完整身份信息', icon: 'none' }); return
    }
    setCurrentStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/report/submit', method: 'POST',
        data: {
          userId: userInfo?.id, realName: formData.realName, idCard: formData.idCard,
          educationList: formData.educationList.filter(e => e.school || e.major),
          qualificationList: formData.qualificationList.filter(q => q.qualification || q.certNumber),
        }
      })
      if (res.data.code === 200) {
        Taro.showLoading({ title: '职业信用报告生成中...' })
        await new Promise(r => setTimeout(r, 3000))
        Taro.hideLoading()
        Taro.showToast({ title: '报告已生成', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/report/index' }), 1000)
      } else { Taro.showToast({ title: res.data.message || '提交失败', icon: 'none' }) }
    } catch { Taro.showToast({ title: '提交失败，请重试', icon: 'none' }) }
    finally { setLoading(false) }
  }

  // ── 身份表单 ──
  const renderIdentity = () => (
    <View>
      <Field label="真实姓名" required>
        <InputBox focused={focusField === 'name'}>
          <Input
            style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
            placeholder="请输入真实姓名" placeholderStyle="color:#cbd5e1;"
            value={formData.realName}
            onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)}
            onInput={e => setField('realName', e.detail.value)}
          />
        </InputBox>
      </Field>
      <Field label="身份证号" required>
        <InputBox focused={focusField === 'idcard'}>
          <Input
            style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
            placeholder="请输入身份证号" placeholderStyle="color:#cbd5e1;"
            maxlength={18} value={formData.idCard}
            onFocus={() => setFocusField('idcard')} onBlur={() => setFocusField(null)}
            onInput={e => setField('idCard', e.detail.value)}
          />
        </InputBox>
      </Field>
    </View>
  )

  // ── 学历表单 ──
  const renderEducation = () => (
    <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {formData.educationList.map((edu, idx) => (
        <View key={edu.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <View style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
              </View>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>学历 {formData.educationList.length > 1 ? idx + 1 : ''}</Text>
            </View>
            {formData.educationList.length > 1 && (
              <View onClick={() => removeEdu(edu.id)} style={{ padding: '4px' }}>
                <Trash2 size={17} color="#ef4444" />
              </View>
            )}
          </View>

          <Field label="学历">
            <Picker mode="selector" range={EDU_OPTIONS} value={EDU_OPTIONS.indexOf(edu.education)} onChange={e => setEdu(edu.id, 'education', EDU_OPTIONS[e.detail.value])}>
              <View style={{ background: '#fff', borderRadius: '12px', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #e2e8f0' }}>
                <Text style={{ fontSize: '14px', color: edu.education ? '#0f172a' : '#cbd5e1', lineHeight: '1.5' }}>{edu.education || '请选择学历'}</Text>
                <ChevronRight size={15} color="#94a3b8" />
              </View>
            </Picker>
          </Field>

          {[
            { label: '毕业院校', field: 'school', placeholder: '请输入毕业院校' },
            { label: '所学专业', field: 'major',  placeholder: '请输入所学专业' },
            { label: '学位证书编号', field: 'degreeCertNo', placeholder: '请输入学位证书编号' },
            { label: '毕业证书编号', field: 'diplomaCertNo', placeholder: '请输入毕业证书编号' },
          ].map(row => (
            <Field key={row.field} label={row.label}>
              <InputBox focused={focusField === `${edu.id}-${row.field}`}>
                <Input
                  style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                  placeholder={row.placeholder} placeholderStyle="color:#cbd5e1;"
                  value={(edu as any)[row.field]}
                  onFocus={() => setFocusField(`${edu.id}-${row.field}`)} onBlur={() => setFocusField(null)}
                  onInput={e => setEdu(edu.id, row.field as keyof EducationItem, e.detail.value)}
                />
              </InputBox>
            </Field>
          ))}

          <Field label="学历证书照片">
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {edu.files.map((_, fi) => (
                <View key={fi} style={{ position: 'relative', width: '64px', height: '64px' }}>
                  <View style={{ width: '64px', height: '64px', background: '#e2e8f0', borderRadius: '10px' }} />
                  <View style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeFile('education', edu.id, fi)}>
                    <Text style={{ color: '#fff', fontSize: '12px', lineHeight: '1' }}>×</Text>
                  </View>
                </View>
              ))}
              <View style={{ width: '64px', height: '64px', border: '1.5px dashed #cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleUpload('education', edu.id)}>
                <Upload size={20} color="#94a3b8" />
              </View>
            </View>
            <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', lineHeight: '1.5' }}>支持上传学历证书、学位证书照片</Text>
          </Field>
        </View>
      ))}

      <View
        style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #93c5fd', background: '#eff6ff' }}
        onClick={() => setFormData(prev => ({ ...prev, educationList: [...prev.educationList, emptyEdu()] }))}
      >
        <Plus size={16} color="#2563eb" />
        <Text style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>添加学历</Text>
      </View>
      <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>可添加多段学历信息，如本科、硕士、博士等</Text>
    </View>
  )

  // ── 职业资格表单 ──
  const renderQualification = () => (
    <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {formData.qualificationList.map((qual, idx) => (
        <View key={qual.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <View style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
              </View>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>职业资格 {formData.qualificationList.length > 1 ? idx + 1 : ''}</Text>
            </View>
            {formData.qualificationList.length > 1 && (
              <View onClick={() => removeQual(qual.id)} style={{ padding: '4px' }}>
                <Trash2 size={17} color="#ef4444" />
              </View>
            )}
          </View>

          <Field label="职业资格证书名称">
            <InputBox focused={focusField === `${qual.id}-name`}>
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入职业资格证书名称" placeholderStyle="color:#cbd5e1;"
                value={qual.qualification}
                onFocus={() => setFocusField(`${qual.id}-name`)} onBlur={() => setFocusField(null)}
                onInput={e => setQual(qual.id, 'qualification', e.detail.value)}
              />
            </InputBox>
          </Field>

          <Field label="证书编号">
            <InputBox focused={focusField === `${qual.id}-cert`}>
              <Input
                style={{ flex: 1, background: 'transparent', fontSize: '14px', color: '#0f172a', lineHeight: '1.5' }}
                placeholder="请输入证书编号" placeholderStyle="color:#cbd5e1;"
                value={qual.certNumber}
                onFocus={() => setFocusField(`${qual.id}-cert`)} onBlur={() => setFocusField(null)}
                onInput={e => setQual(qual.id, 'certNumber', e.detail.value)}
              />
            </InputBox>
          </Field>

          <Field label="发证日期">
            <Picker mode="date" value={qual.issueDate} onChange={e => setQual(qual.id, 'issueDate', e.detail.value)}>
              <View style={{ background: '#fff', borderRadius: '12px', padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #e2e8f0' }}>
                <Text style={{ fontSize: '14px', color: qual.issueDate ? '#0f172a' : '#cbd5e1', lineHeight: '1.5' }}>{qual.issueDate || '请选择发证日期'}</Text>
                <ChevronRight size={15} color="#94a3b8" />
              </View>
            </Picker>
          </Field>

          <Field label="证书照片">
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {qual.files.map((_, fi) => (
                <View key={fi} style={{ position: 'relative', width: '64px', height: '64px' }}>
                  <View style={{ width: '64px', height: '64px', background: '#e2e8f0', borderRadius: '10px' }} />
                  <View style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => removeFile('qualification', qual.id, fi)}>
                    <Text style={{ color: '#fff', fontSize: '12px', lineHeight: '1' }}>×</Text>
                  </View>
                </View>
              ))}
              <View style={{ width: '64px', height: '64px', border: '1.5px dashed #cbd5e1', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleUpload('qualification', qual.id)}>
                <Upload size={20} color="#94a3b8" />
              </View>
            </View>
            <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', lineHeight: '1.5' }}>支持上传职业资格证书照片</Text>
          </Field>
        </View>
      ))}

      <View
        style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #6ee7b7', background: '#f0fdf4' }}
        onClick={() => setFormData(prev => ({ ...prev, qualificationList: [...prev.qualificationList, emptyQual()] }))}
      >
        <Plus size={16} color="#059669" />
        <Text style={{ fontSize: '14px', color: '#059669', fontWeight: '500', lineHeight: '1.5' }}>添加职业资格</Text>
      </View>
      <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>可添加多个职业资格证书，如注册会计师、律师资格证等</Text>
    </View>
  )

  const isLast = currentStep === STEPS.length - 1

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部 ── */}
      <View style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)', padding: '20px 20px 0', position: 'relative', overflow: 'hidden' }}>
        <View style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>填写信息</Text>
        <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', display: 'block', marginTop: '3px', lineHeight: '1.5', marginBottom: '20px' }}>
          带 * 为必填项，其他信息可跳过
        </Text>

        {/* ── 步骤指示器 ── */}
        <View style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px 20px 0 0', padding: '16px 20px 20px' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {STEPS.map((step, i) => (
              <View key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
                {/* 圆点 */}
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <View style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: i < currentStep ? '#10b981' : i === currentStep ? '#fff' : 'rgba(255,255,255,0.2)',
                    border: i === currentStep ? '2.5px solid #fff' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}>
                    {i < currentStep
                      ? <CircleCheck size={18} color="#fff" />
                      : <Text style={{ fontSize: '13px', fontWeight: '700', color: i === currentStep ? '#1e40af' : 'rgba(255,255,255,0.5)', lineHeight: '1' }}>{i + 1}</Text>
                    }
                  </View>
                  <Text style={{ fontSize: '11px', fontWeight: i === currentStep ? '600' : '400', color: i === currentStep ? '#fff' : 'rgba(255,255,255,0.5)', lineHeight: '1.4', whiteSpace: 'nowrap' }}>
                    {step.title}
                  </Text>
                </View>
                {/* 连接线 */}
                {i < STEPS.length - 1 && (
                  <View style={{ flex: 1, height: '2px', background: i < currentStep ? '#10b981' : 'rgba(255,255,255,0.2)', margin: '0 8px', marginBottom: '18px', borderRadius: '1px', transition: 'background 0.3s ease' }} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── 表单内容 ── */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 220px)' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 表单卡片 */}
          <View style={{ background: '#fff', borderRadius: '20px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                {STEPS[currentStep].title}
              </Text>
              {!STEPS[currentStep].required && currentStep > 0 && (
                <Text
                  style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', transition: 'color 0.2s ease' }}
                  onClick={() => setCurrentStep(s => s + 1)}
                >
                  跳过
                </Text>
              )}
            </View>

            {currentStep === 0 && renderIdentity()}
            {currentStep === 1 && renderEducation()}
            {currentStep === 2 && renderQualification()}
          </View>

          {/* 提示 */}
          <View style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', padding: '2px 4px' }}>
            <Text style={{ fontSize: '13px', color: '#f59e0b', lineHeight: '1', flexShrink: 0, marginTop: '1px' }}>⚠</Text>
            <Text style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
              带 * 为必填项，其他信息可跳过。提交后平台将进行核查，核查通过后生成报告。
            </Text>
          </View>

          {/* ── 底部按钮 ── */}
          <View style={{ display: 'flex', gap: '12px', paddingBottom: '24px' }}>
            {currentStep > 0 && (
              <View
                style={{
                  flex: 1, borderRadius: '16px', padding: '14px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  transform: btnPressed === 'prev' ? 'scale(0.97)' : 'scale(1)',
                  transition: 'all 0.2s ease',
                }}
                onTouchStart={() => setBtnPressed('prev')} onTouchEnd={() => setBtnPressed(null)} onTouchCancel={() => setBtnPressed(null)}
                onClick={() => setCurrentStep(s => s - 1)}
              >
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#64748b', lineHeight: '1.5' }}>上一步</Text>
              </View>
            )}
            <View
              style={{
                flex: 2, borderRadius: '16px', padding: '14px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.38)',
                transform: btnPressed === 'next' ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onTouchStart={() => setBtnPressed('next')} onTouchEnd={() => setBtnPressed(null)} onTouchCancel={() => setBtnPressed(null)}
              onClick={loading ? undefined : (isLast ? handleSubmit : handleNext)}
            >
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
                {loading ? '生成中...' : isLast ? '提交信息' : '下一步'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ReportFormPage
