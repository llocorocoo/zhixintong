import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { User, GraduationCap, Award, Upload, ChevronRight, CircleCheck, CircleAlert, Plus, Trash2 } from 'lucide-react-taro'

// 学历信息结构
interface EducationItem {
  id: string
  education: string
  school: string
  major: string
  degreeCertNo: string
  diplomaCertNo: string
  files: string[]
}

// 职业资格结构
interface QualificationItem {
  id: string
  qualification: string
  certNumber: string
  issueDate: string
  files: string[]
}

interface FormData {
  // 身份信息
  realName: string
  idCard: string
  // 学历信息（支持多段）
  educationList: EducationItem[]
  // 职业资格（支持多个）
  qualificationList: QualificationItem[]
}

const educationOptions = ['高中', '大专', '本科', '硕士', '博士']

const generateId = () => Math.random().toString(36).substring(2, 9)

const createEmptyEducation = (): EducationItem => ({
  id: generateId(),
  education: '本科',
  school: '',
  major: '',
  degreeCertNo: '',
  diplomaCertNo: '',
  files: []
})

const createEmptyQualification = (): QualificationItem => ({
  id: generateId(),
  qualification: '',
  certNumber: '',
  issueDate: '',
  files: []
})

const ReportFormPage: FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    realName: '',
    idCard: '',
    educationList: [createEmptyEducation()],
    qualificationList: [createEmptyQualification()]
  })
  const { userInfo } = useUserStore()

  const steps = [
    { title: '身份信息', icon: User, required: true },
    { title: '学历信息', icon: GraduationCap, required: false },
    { title: '职业资格', icon: Award, required: false }
  ]

  // 身份信息处理
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 学历信息处理
  const handleEducationChange = (id: string, field: keyof EducationItem, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      educationList: prev.educationList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educationList: [...prev.educationList, createEmptyEducation()]
    }))
  }

  const removeEducation = (id: string) => {
    if (formData.educationList.length <= 1) {
      Taro.showToast({ title: '至少保留一条学历信息', icon: 'none' })
      return
    }
    setFormData((prev) => ({
      ...prev,
      educationList: prev.educationList.filter((item) => item.id !== id)
    }))
  }

  // 职业资格处理
  const handleQualificationChange = (id: string, field: keyof QualificationItem, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      qualificationList: prev.qualificationList.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualificationList: [...prev.qualificationList, createEmptyQualification()]
    }))
  }

  const removeQualification = (id: string) => {
    if (formData.qualificationList.length <= 1) {
      Taro.showToast({ title: '至少保留一条职业资格', icon: 'none' })
      return
    }
    setFormData((prev) => ({
      ...prev,
      qualificationList: prev.qualificationList.filter((item) => item.id !== id)
    }))
  }

  // 文件上传
  const handleUploadFile = async (type: 'education' | 'qualification', id: string) => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      Taro.showLoading({ title: '上传中...' })

      const uploadRes = await Network.uploadFile({
        url: '/api/upload',
        filePath: res.tempFilePaths[0],
        name: 'file'
      })

      console.log('上传响应:', uploadRes.data)

      const response = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data

      if (response.code === 200 && response.data) {
        const fileUrl = response.data.url
        if (type === 'education') {
          setFormData((prev) => ({
            ...prev,
            educationList: prev.educationList.map((item) =>
              item.id === id ? { ...item, files: [...item.files, fileUrl] } : item
            )
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            qualificationList: prev.qualificationList.map((item) =>
              item.id === id ? { ...item, files: [...item.files, fileUrl] } : item
            )
          }))
        }
        Taro.showToast({ title: '上传成功', icon: 'success' })
      } else {
        Taro.showToast({ title: '上传失败', icon: 'none' })
      }
    } catch (error) {
      console.error('上传失败:', error)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const handleRemoveFile = (type: 'education' | 'qualification', id: string, fileIndex: number) => {
    if (type === 'education') {
      setFormData((prev) => ({
        ...prev,
        educationList: prev.educationList.map((item) =>
          item.id === id ? { ...item, files: item.files.filter((_, i) => i !== fileIndex) } : item
        )
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        qualificationList: prev.qualificationList.map((item) =>
          item.id === id ? { ...item, files: item.files.filter((_, i) => i !== fileIndex) } : item
        )
      }))
    }
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.realName || !formData.idCard) {
        Taro.showToast({ title: '请填写完整身份信息', icon: 'none' })
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handleSkip = () => {
    setCurrentStep(currentStep + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/report/submit',
        method: 'POST',
        data: {
          userId: userInfo?.id,
          realName: formData.realName,
          idCard: formData.idCard,
          educationList: formData.educationList.filter((e) => e.school || e.major),
          qualificationList: formData.qualificationList.filter((q) => q.qualification || q.certNumber)
        }
      })

      if (res.data.code === 200) {
        Taro.showLoading({ title: '职业信用报告生成中...' })
        // 等待报告生成（后端5秒后自动完成）
        await new Promise(resolve => setTimeout(resolve, 3000))
        Taro.hideLoading()
        Taro.showToast({ title: '报告已生成', icon: 'success' })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/report/index' })
        }, 1000)
      } else {
        Taro.showToast({ title: res.data.message || '提交失败', icon: 'none' })
      }
    } catch (error) {
      console.error('提交失败:', error)
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const renderIdentityForm = () => (
    <View className="space-y-4">
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">真实姓名 *</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入真实姓名"
            value={formData.realName}
            onInput={(e) => handleInputChange('realName', e.detail.value)}
          />
        </View>
      </View>
      <View>
        <Text className="block text-sm font-medium text-gray-700 mb-2">身份证号 *</Text>
        <View className="bg-gray-50 rounded-xl px-4 py-3">
          <Input
            className="w-full bg-transparent"
            placeholder="请输入身份证号"
            maxlength={18}
            value={formData.idCard}
            onInput={(e) => handleInputChange('idCard', e.detail.value)}
          />
        </View>
      </View>
    </View>
  )

  const renderEducationForm = () => (
    <View className="space-y-4">
      {formData.educationList.map((edu, index) => (
        <View key={edu.id} className="bg-gray-50 rounded-xl p-4">
          {/* 学历卡片头部 */}
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center gap-2">
              <View className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Text className="text-white text-xs font-medium">{index + 1}</Text>
              </View>
              <Text className="font-medium text-gray-900">
                学历 {formData.educationList.length > 1 ? `${index + 1}` : ''}
              </Text>
            </View>
            {formData.educationList.length > 1 && (
              <View
                className="p-1"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 size={18} color="#ef4444" />
              </View>
            )}
          </View>

          {/* 学历选择 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">学历</Text>
            <Picker
              mode="selector"
              range={educationOptions}
              value={educationOptions.indexOf(edu.education)}
              onChange={(e) => handleEducationChange(edu.id, 'education', educationOptions[e.detail.value])}
            >
              <View className="bg-white rounded-lg px-3 py-2.5 flex items-center justify-between border border-gray-200">
                <Text className={edu.education ? 'text-gray-900' : 'text-gray-400'}>
                  {edu.education || '请选择学历'}
                </Text>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            </Picker>
          </View>

          {/* 毕业院校 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">毕业院校</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入毕业院校"
                value={edu.school}
                onInput={(e) => handleEducationChange(edu.id, 'school', e.detail.value)}
              />
            </View>
          </View>

          {/* 所学专业 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">所学专业</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入所学专业"
                value={edu.major}
                onInput={(e) => handleEducationChange(edu.id, 'major', e.detail.value)}
              />
            </View>
          </View>

          {/* 证书编号 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">学位证书编号</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入学位证书编号"
                value={edu.degreeCertNo}
                onInput={(e) => handleEducationChange(edu.id, 'degreeCertNo', e.detail.value)}
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">毕业证书编号</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入毕业证书编号"
                value={edu.diplomaCertNo}
                onInput={(e) => handleEducationChange(edu.id, 'diplomaCertNo', e.detail.value)}
              />
            </View>
          </View>

          {/* 证书照片 */}
          <View>
            <Text className="block text-sm text-gray-600 mb-2">学历证书照片</Text>
            <View className="flex flex-wrap gap-2">
              {edu.files.map((_, fileIndex) => (
                <View key={fileIndex} className="relative w-16 h-16">
                  <View className="w-full h-full bg-gray-200 rounded-lg" />
                  <View
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    onClick={() => handleRemoveFile('education', edu.id, fileIndex)}
                  >
                    <Text className="text-white text-xs">×</Text>
                  </View>
                </View>
              ))}
              <View
                className="w-16 h-16 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                onClick={() => handleUploadFile('education', edu.id)}
              >
                <Upload size={20} color="#9ca3af" />
              </View>
            </View>
            <Text className="block text-xs text-gray-400 mt-1">
              支持上传学历证书、学位证书照片
            </Text>
          </View>
        </View>
      ))}

      {/* 添加学历按钮 */}
      <Button
        className="w-full border border-dashed border-blue-300 bg-blue-50"
        onClick={addEducation}
      >
        <View className="flex items-center gap-1">
          <Plus size={18} color="#3b82f6" />
          <Text className="text-blue-600">添加学历</Text>
        </View>
      </Button>

      <Text className="block text-xs text-gray-400 px-1">
        可添加多段学历信息，如本科、硕士、博士等
      </Text>
    </View>
  )

  const renderQualificationForm = () => (
    <View className="space-y-4">
      {formData.qualificationList.map((qual, index) => (
        <View key={qual.id} className="bg-gray-50 rounded-xl p-4">
          {/* 职业资格卡片头部 */}
          <View className="flex items-center justify-between mb-4">
            <View className="flex items-center gap-2">
              <View className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Text className="text-white text-xs font-medium">{index + 1}</Text>
              </View>
              <Text className="font-medium text-gray-900">
                职业资格 {formData.qualificationList.length > 1 ? `${index + 1}` : ''}
              </Text>
            </View>
            {formData.qualificationList.length > 1 && (
              <View
                className="p-1"
                onClick={() => removeQualification(qual.id)}
              >
                <Trash2 size={18} color="#ef4444" />
              </View>
            )}
          </View>

          {/* 证书名称 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">职业资格证书名称</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入职业资格证书名称"
                value={qual.qualification}
                onInput={(e) => handleQualificationChange(qual.id, 'qualification', e.detail.value)}
              />
            </View>
          </View>

          {/* 证书编号 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">证书编号</Text>
            <View className="bg-white rounded-lg px-3 py-2.5 border border-gray-200">
              <Input
                className="w-full bg-transparent text-sm"
                placeholder="请输入证书编号"
                value={qual.certNumber}
                onInput={(e) => handleQualificationChange(qual.id, 'certNumber', e.detail.value)}
              />
            </View>
          </View>

          {/* 发证日期 */}
          <View className="mb-3">
            <Text className="block text-sm text-gray-600 mb-1">发证日期</Text>
            <Picker
              mode="date"
              value={qual.issueDate}
              onChange={(e) => handleQualificationChange(qual.id, 'issueDate', e.detail.value)}
            >
              <View className="bg-white rounded-lg px-3 py-2.5 flex items-center justify-between border border-gray-200">
                <Text className={qual.issueDate ? 'text-gray-900' : 'text-gray-400'}>
                  {qual.issueDate || '请选择发证日期'}
                </Text>
                <ChevronRight size={16} color="#9ca3af" />
              </View>
            </Picker>
          </View>

          {/* 证书照片 */}
          <View>
            <Text className="block text-sm text-gray-600 mb-2">证书照片</Text>
            <View className="flex flex-wrap gap-2">
              {qual.files.map((_, fileIndex) => (
                <View key={fileIndex} className="relative w-16 h-16">
                  <View className="w-full h-full bg-gray-200 rounded-lg" />
                  <View
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    onClick={() => handleRemoveFile('qualification', qual.id, fileIndex)}
                  >
                    <Text className="text-white text-xs">×</Text>
                  </View>
                </View>
              ))}
              <View
                className="w-16 h-16 border border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                onClick={() => handleUploadFile('qualification', qual.id)}
              >
                <Upload size={20} color="#9ca3af" />
              </View>
            </View>
            <Text className="block text-xs text-gray-400 mt-1">
              支持上传职业资格证书照片
            </Text>
          </View>
        </View>
      ))}

      {/* 添加职业资格按钮 */}
      <Button
        className="w-full border border-dashed border-green-300 bg-green-50"
        onClick={addQualification}
      >
        <View className="flex items-center gap-1">
          <Plus size={18} color="#22c55e" />
          <Text className="text-green-600">添加职业资格</Text>
        </View>
      </Button>

      <Text className="block text-xs text-gray-400 px-1">
        可添加多个职业资格证书，如注册会计师、律师资格证等
      </Text>
    </View>
  )

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 步骤指示器 */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex items-center justify-between">
          {steps.map((step, index) => (
            <View key={index} className="flex items-center">
              <View
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                {index < currentStep ? (
                  <CircleCheck size={16} color="#ffffff" />
                ) : (
                  <step.icon size={16} color={index <= currentStep ? '#ffffff' : '#9ca3af'} />
                )}
              </View>
              <Text
                className={`ml-2 text-sm ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step.title}
              </Text>
              {index < steps.length - 1 && (
                <View
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="p-4" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 表单内容 */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex items-center justify-between">
              <CardTitle>{steps[currentStep].title}</CardTitle>
              {!steps[currentStep].required && currentStep > 0 && (
                <Button size="sm" variant="outline" onClick={handleSkip}>
                  <Text className="text-sm text-gray-500">跳过</Text>
                </Button>
              )}
            </View>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && renderIdentityForm()}
            {currentStep === 1 && renderEducationForm()}
            {currentStep === 2 && renderQualificationForm()}
          </CardContent>
        </Card>

        {/* 提示信息 */}
        <View className="flex items-start gap-2 px-2">
          <CircleAlert size={16} color="#f59e0b" className="mt-0.5" />
          <Text className="text-xs text-gray-500 flex-1">
            带 * 号的为必填项，其他信息可跳过。提交后平台将进行核查，核查通过后生成报告。
          </Text>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <View className="flex gap-3">
          {currentStep > 0 && (
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <Text className="text-gray-600">上一步</Text>
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button className="flex-1 bg-blue-600" onClick={handleNext}>
              <Text className="text-white">下一步</Text>
            </Button>
          ) : (
            <Button
              className="flex-1 bg-blue-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white">{loading ? '生成中...' : '提交信息'}</Text>
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}

export default ReportFormPage
