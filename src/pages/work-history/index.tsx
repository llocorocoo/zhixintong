import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { 
  Briefcase, 
  Plus,
  Upload,
  Calendar,
  Building,
  FileText,
  CircleCheck,
  Clock,
  CircleAlert
} from 'lucide-react-taro'

interface WorkExperience {
  id?: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  proofFiles: string[]
  status: 'pending' | 'verified' | 'rejected'
}

interface Certificate {
  id?: string
  name: string
  issuer: string
  issueDate: string
  certNo: string
  proofFiles: string[]
  status: 'pending' | 'verified' | 'rejected'
}

const WorkHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'work' | 'cert'>('work')
  const [workList, setWorkList] = useState<WorkExperience[]>([])
  const [certList, setCertList] = useState<Certificate[]>([])
  const [showWorkForm, setShowWorkForm] = useState(false)
  const [showCertForm, setShowCertForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [workForm, setWorkForm] = useState<WorkExperience>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
    proofFiles: [],
    status: 'pending'
  })
  
  const [certForm, setCertForm] = useState<Certificate>({
    name: '',
    issuer: '',
    issueDate: '',
    certNo: '',
    proofFiles: [],
    status: 'pending'
  })

  const { userInfo } = useUserStore()

  useEffect(() => {
    fetchWorkHistory()
    fetchCertificates()
  }, [])

  const fetchWorkHistory = async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({
        url: '/api/enhancement/work-history',
        method: 'POST',
        data: { userId: userInfo.id }
      })
      if (res.data.code === 200 && res.data.data) {
        setWorkList(res.data.data)
      }
    } catch (error) {
      console.error('获取工作履历失败:', error)
    }
  }

  const fetchCertificates = async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({
        url: '/api/enhancement/certificates',
        method: 'POST',
        data: { userId: userInfo.id }
      })
      if (res.data.code === 200 && res.data.data) {
        setCertList(res.data.data)
      }
    } catch (error) {
      console.error('获取证书失败:', error)
    }
  }

  const handleUploadProof = async () => {
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

      const response = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data

      if (response.code === 200 && response.data) {
        if (activeTab === 'work') {
          setWorkForm(prev => ({
            ...prev,
            proofFiles: [...prev.proofFiles, response.data.url]
          }))
        } else {
          setCertForm(prev => ({
            ...prev,
            proofFiles: [...prev.proofFiles, response.data.url]
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

  const handleRemoveFile = (index: number) => {
    if (activeTab === 'work') {
      setWorkForm(prev => ({
        ...prev,
        proofFiles: prev.proofFiles.filter((_, i) => i !== index)
      }))
    } else {
      setCertForm(prev => ({
        ...prev,
        proofFiles: prev.proofFiles.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSaveWork = async () => {
    if (!workForm.company || !workForm.position) {
      Taro.showToast({ title: '请填写公司和职位', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/enhancement/work-history/add',
        method: 'POST',
        data: {
          userId: userInfo?.id,
          ...workForm
        }
      })

      if (res.data.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setShowWorkForm(false)
        setWorkForm({
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          proofFiles: [],
          status: 'pending'
        })
        fetchWorkHistory()
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' })
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCert = async () => {
    if (!certForm.name || !certForm.issuer) {
      Taro.showToast({ title: '请填写证书名称和颁发机构', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await Network.request({
        url: '/api/enhancement/certificates/add',
        method: 'POST',
        data: {
          userId: userInfo?.id,
          ...certForm
        }
      })

      if (res.data.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setShowCertForm(false)
        setCertForm({
          name: '',
          issuer: '',
          issueDate: '',
          certNo: '',
          proofFiles: [],
          status: 'pending'
        })
        fetchCertificates()
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' })
      }
    } catch (error) {
      console.error('保存失败:', error)
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CircleCheck size={16} color="#10b981" />
      case 'rejected':
        return <CircleAlert size={16} color="#ef4444" />
      default:
        return <Clock size={16} color="#f59e0b" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return '已核验'
      case 'rejected':
        return '被驳回'
      default:
        return '待核验'
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 标签切换 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex gap-4">
          <View
            className={`pb-2 ${activeTab === 'work' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('work')}
          >
            <Text className={`${activeTab === 'work' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              工作履历
            </Text>
          </View>
          <View
            className={`pb-2 ${activeTab === 'cert' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('cert')}
          >
            <Text className={`${activeTab === 'cert' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              证书资质
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {/* 工作履历Tab */}
        {activeTab === 'work' && (
          <View>
            {/* 添加按钮 */}
            {!showWorkForm && (
              <Card className="mb-4 border-2 border-dashed border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <View
                    className="flex items-center justify-center gap-2"
                    onClick={() => setShowWorkForm(true)}
                  >
                    <Plus size={20} color="#3b82f6" />
                    <Text className="text-blue-600 font-medium">添加工作经历</Text>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 工作经历表单 */}
            {showWorkForm && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>新增工作经历</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">公司名称 *</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入公司名称"
                        value={workForm.company}
                        onInput={(e) => setWorkForm({ ...workForm, company: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">职位 *</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入职位"
                        value={workForm.position}
                        onInput={(e) => setWorkForm({ ...workForm, position: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View className="flex gap-3">
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">入职时间</Text>
                      <Picker mode="date" value={workForm.startDate || ''} onChange={(e) => setWorkForm({ ...workForm, startDate: e.detail.value })}>
                        <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                          <Text className={workForm.startDate ? 'text-gray-900' : 'text-gray-400'}>
                            {workForm.startDate || '选择日期'}
                          </Text>
                          <Calendar size={18} color="#9ca3af" />
                        </View>
                      </Picker>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">离职时间</Text>
                      <Picker mode="date" value={workForm.endDate || ''} onChange={(e) => setWorkForm({ ...workForm, endDate: e.detail.value })}>
                        <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                          <Text className={workForm.endDate ? 'text-gray-900' : 'text-gray-400'}>
                            {workForm.endDate || '选择日期'}
                          </Text>
                          <Calendar size={18} color="#9ca3af" />
                        </View>
                      </Picker>
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">工作描述</Text>
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Textarea
                        style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
                        placeholder="描述您的工作内容和成就..."
                        value={workForm.description}
                        onInput={(e) => setWorkForm({ ...workForm, description: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">证明材料</Text>
                    <View className="flex flex-wrap gap-3">
                      {workForm.proofFiles.map((_, index) => (
                        <View key={index} className="relative w-20 h-20">
                          <View className="w-full h-full bg-gray-100 rounded-lg" />
                          <View
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <Text className="text-white text-xs">×</Text>
                          </View>
                        </View>
                      ))}
                      <View
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                        onClick={() => handleUploadProof()}
                      >
                        <Upload size={24} color="#9ca3af" />
                        <Text className="text-xs text-gray-400 mt-1">上传</Text>
                      </View>
                    </View>
                    <Text className="block text-xs text-gray-400 mt-2">
                      支持上传劳动合同、社保记录、离职证明等
                    </Text>
                  </View>

                  <View className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setShowWorkForm(false)}
                    >
                      <Text className="text-gray-600">取消</Text>
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={handleSaveWork}
                      disabled={loading}
                    >
                      <Text className="text-white">{loading ? '保存中...' : '保存'}</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 工作经历列表 */}
            {workList.map((work, index) => (
              <Card key={work.id || index} className="mb-3">
                <CardContent className="p-4">
                  <View className="flex items-start justify-between mb-2">
                    <View className="flex items-center gap-2">
                      <Building size={18} color="#3b82f6" />
                      <Text className="text-base font-medium text-gray-900">{work.company}</Text>
                    </View>
                    <View className="flex items-center gap-1">
                      {getStatusIcon(work.status)}
                      <Text className="text-xs text-gray-500">{getStatusText(work.status)}</Text>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-600 mb-1">{work.position}</Text>
                  <Text className="block text-xs text-gray-400">
                    {work.startDate} - {work.endDate || '至今'}
                  </Text>
                  {work.description && (
                    <Text className="block text-sm text-gray-500 mt-2">{work.description}</Text>
                  )}
                  {work.proofFiles.length > 0 && (
                    <View className="flex items-center gap-1 mt-2">
                      <FileText size={14} color="#9ca3af" />
                      <Text className="text-xs text-gray-400">{work.proofFiles.length} 个证明文件</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}

            {workList.length === 0 && !showWorkForm && (
              <View className="text-center py-12">
                <Briefcase size={48} color="#d1d5db" className="mx-auto mb-3" />
                <Text className="block text-gray-500 mb-2">暂无工作履历</Text>
                <Text className="block text-sm text-gray-400">添加工作经历，提升信用评分</Text>
              </View>
            )}
          </View>
        )}

        {/* 证书资质Tab */}
        {activeTab === 'cert' && (
          <View>
            {/* 添加按钮 */}
            {!showCertForm && (
              <Card className="mb-4 border-2 border-dashed border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <View
                    className="flex items-center justify-center gap-2"
                    onClick={() => setShowCertForm(true)}
                  >
                    <Plus size={20} color="#3b82f6" />
                    <Text className="text-blue-600 font-medium">添加证书资质</Text>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 证书表单 */}
            {showCertForm && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>新增证书资质</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">证书名称 *</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="如：高级工程师职称"
                        value={certForm.name}
                        onInput={(e) => setCertForm({ ...certForm, name: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">颁发机构 *</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入颁发机构"
                        value={certForm.issuer}
                        onInput={(e) => setCertForm({ ...certForm, issuer: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View className="flex gap-3">
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">发证日期</Text>
                      <Picker mode="date" value={certForm.issueDate || ''} onChange={(e) => setCertForm({ ...certForm, issueDate: e.detail.value })}>
                        <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                          <Text className={certForm.issueDate ? 'text-gray-900' : 'text-gray-400'}>
                            {certForm.issueDate || '选择日期'}
                          </Text>
                          <Calendar size={18} color="#9ca3af" />
                        </View>
                      </Picker>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">证书编号</Text>
                      <View className="bg-gray-50 rounded-xl px-4 py-3">
                        <Input
                          className="w-full bg-transparent"
                          placeholder="选填"
                          value={certForm.certNo}
                          onInput={(e) => setCertForm({ ...certForm, certNo: e.detail.value })}
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">证书照片</Text>
                    <View className="flex flex-wrap gap-3">
                      {certForm.proofFiles.map((_, index) => (
                        <View key={index} className="relative w-20 h-20">
                          <View className="w-full h-full bg-gray-100 rounded-lg" />
                          <View
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <Text className="text-white text-xs">×</Text>
                          </View>
                        </View>
                      ))}
                      <View
                        className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center"
                        onClick={() => handleUploadProof()}
                      >
                        <Upload size={24} color="#9ca3af" />
                        <Text className="text-xs text-gray-400 mt-1">上传</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setShowCertForm(false)}
                    >
                      <Text className="text-gray-600">取消</Text>
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={handleSaveCert}
                      disabled={loading}
                    >
                      <Text className="text-white">{loading ? '保存中...' : '保存'}</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 证书列表 */}
            {certList.map((cert, index) => (
              <Card key={cert.id || index} className="mb-3">
                <CardContent className="p-4">
                  <View className="flex items-start justify-between mb-2">
                    <Text className="text-base font-medium text-gray-900">{cert.name}</Text>
                    <View className="flex items-center gap-1">
                      {getStatusIcon(cert.status)}
                      <Text className="text-xs text-gray-500">{getStatusText(cert.status)}</Text>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-600">颁发机构：{cert.issuer}</Text>
                  {cert.issueDate && (
                    <Text className="block text-xs text-gray-400 mt-1">发证日期：{cert.issueDate}</Text>
                  )}
                  {cert.certNo && (
                    <Text className="block text-xs text-gray-400">证书编号：{cert.certNo}</Text>
                  )}
                </CardContent>
              </Card>
            ))}

            {certList.length === 0 && !showCertForm && (
              <View className="text-center py-12">
                <FileText size={48} color="#d1d5db" className="mx-auto mb-3" />
                <Text className="block text-gray-500 mb-2">暂无证书资质</Text>
                <Text className="block text-sm text-gray-400">添加证书，提升信用评分</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default WorkHistoryPage
