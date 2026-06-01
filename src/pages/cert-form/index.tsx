import { View, Text, ScrollView } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Network } from '@/network'
import { Input } from '@/components/ui/input'
import { useUserStore } from '@/stores/user'
import { Upload, Plus, Trash2 } from 'lucide-react-taro'

interface QualificationItem {
  id: string
  certNumber: string
  files: string[]
}

const genId = () => Math.random().toString(36).substring(2, 9)
const emptyQual = (): QualificationItem => ({ id: genId(), certNumber: '', files: [] })

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

const CertFormPage: FC = () => {
  const { userInfo } = useUserStore()
  const [list, setList] = useState<QualificationItem[]>([emptyQual()])
  const [focusField, setFocusField] = useState<string | null>(null)
  const [btnPressed, setBtnPressed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const setQual = (id: string, field: keyof QualificationItem, value: string) =>
    setList(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))

  const removeQual = (id: string) =>
    setList(prev => prev.filter(q => q.id !== id))

  const handleUpload = async (id: string) => {
    try {
      const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'] })
      Taro.showLoading({ title: '上传中...' })
      const up = await Network.uploadFile({ url: '/api/upload', filePath: res.tempFilePaths[0], name: 'file' })
      const r = typeof up.data === 'string' ? JSON.parse(up.data) : up.data
      if (r.code === 200 && r.data) {
        setList(prev => prev.map(q => q.id === id ? { ...q, files: [...q.files, r.data.url] } : q))
        Taro.showToast({ title: '上传成功', icon: 'success' })
      }
    } catch { Taro.showToast({ title: '上传失败', icon: 'none' }) }
    finally { Taro.hideLoading() }
  }

  const removeFile = (id: string, idx: number) =>
    setList(prev => prev.map(q => q.id === id ? { ...q, files: q.files.filter((_, i) => i !== idx) } : q))

  const handleSubmit = async () => {
    const filled = list.filter(q => q.certNumber || q.files.length > 0)
    if (filled.length === 0) {
      Taro.showToast({ title: '请至少填写一条证书信息', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await Promise.all(filled.map(q =>
        Network.request({
          url: '/api/enhancement/certificates/add',
          method: 'POST',
          data: {
            userId: userInfo?.id,
            name: q.certNumber,
            issuer: '',
            certNo: q.certNumber,
            proofFiles: q.files,
          }
        })
      ))
      Taro.showToast({ title: '提交成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
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
            <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', display: 'block', marginBottom: '18px' }}>职业资格</Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {list.map((qual, idx) => (
                <View key={qual.id} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <View style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{idx + 1}</Text>
                      </View>
                      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>
                        职业资格 {list.length > 1 ? idx + 1 : ''}
                      </Text>
                    </View>
                    {list.length > 1 && (
                      <View onClick={() => removeQual(qual.id)} style={{ padding: '4px' }}>
                        <Trash2 size={17} color="#ef4444" />
                      </View>
                    )}
                  </View>

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

                  <Field label="证书照片">
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {qual.files.map((_, fi) => (
                        <View key={fi} style={{ position: 'relative', width: '72px', height: '72px' }}>
                          <View style={{ width: '72px', height: '72px', background: '#e2e8f0', borderRadius: '10px' }} />
                          <View
                            style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => removeFile(qual.id, fi)}
                          >
                            <Text style={{ color: '#fff', fontSize: '12px', lineHeight: '1' }}>×</Text>
                          </View>
                        </View>
                      ))}
                      <View
                        style={{ width: '72px', height: '72px', border: '1.5px dashed #cbd5e1', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        onClick={() => handleUpload(qual.id)}
                      >
                        <Upload size={18} color="#94a3b8" />
                        <Text style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.3' }}>点击上传</Text>
                      </View>
                    </View>
                  </Field>
                </View>
              ))}

              <View
                style={{ borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed #6ee7b7', background: '#f0fdf4' }}
                onClick={() => setList(prev => [...prev, emptyQual()])}
              >
                <Plus size={16} color="#059669" />
                <Text style={{ fontSize: '14px', color: '#059669', fontWeight: '500', lineHeight: '1.5' }}>添加职业资格</Text>
              </View>
              <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
                可添加多个职业资格证书，如注册会计师、律师资格证等
              </Text>
            </View>
          </View>

          {/* 底部按钮 */}
          <View style={{ paddingBottom: '24px' }}>
            <View
              style={{
                borderRadius: '16px', padding: '14px 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                boxShadow: '0 6px 20px rgba(37,99,235,0.38)',
                transform: btnPressed ? 'scale(0.97)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
              onTouchStart={() => setBtnPressed(true)} onTouchEnd={() => setBtnPressed(false)} onTouchCancel={() => setBtnPressed(false)}
              onClick={submitting ? undefined : handleSubmit}
            >
              <Text style={{ fontSize: '15px', fontWeight: '700', color: '#fff', lineHeight: '1.5' }}>
                {submitting ? '提交中…' : '提交信息'}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

export default CertFormPage
