import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState } from 'react'
import Taro from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Award,
  Plus,
  Upload,
  Calendar,
  Building,
  FileText,
  CircleCheck,
  Clock,
  CircleAlert,
  User,
  Phone,
  Mail
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

interface BasicInfo {
  name: string
  gender: string
  age: string
  phone: string
  email: string
  idCard: string
  address: string
}

const WorkHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'work' | 'cert'>('basic')
  const [showWorkForm, setShowWorkForm] = useState(false)
  const [showCertForm, setShowCertForm] = useState(false)
  const [editingBasic, setEditingBasic] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 基本信息数据
  const [basicInfo] = useState<BasicInfo>({
    name: '小王',
    gender: '男',
    age: '26',
    phone: '133****3333',
    email: '1234@123.com',
    idCard: '110101xxxxxxxxxxxx',
    address: '北京市东城区'
  })
  
  // 基本信息表单
  const [basicForm, setBasicForm] = useState<BasicInfo>(basicInfo)
  
  // 工作履历数据
  const [workList] = useState<WorkExperience[]>([
    {
      id: '1',
      company: '某某科技有限公司',
      position: '高级前端工程师',
      startDate: '2022-03',
      endDate: '',
      description: '负责公司核心产品的前端架构设计与开发，主导技术选型，优化性能提升30%',
      proofFiles: ['contract.pdf'],
      status: 'verified'
    },
    {
      id: '2',
      company: '互联网科技股份有限公司',
      position: '前端开发工程师',
      startDate: '2020-07',
      endDate: '2022-02',
      description: '参与电商平台前端开发，负责用户模块和订单模块开发',
      proofFiles: ['contract.pdf', 'social_security.pdf'],
      status: 'verified'
    },
    {
      id: '3',
      company: '创业科技有限公司',
      position: '前端实习生',
      startDate: '2019-06',
      endDate: '2019-09',
      description: '学习并参与公司小程序项目开发',
      proofFiles: [],
      status: 'pending'
    }
  ])
  
  // 证书资质数据
  const [certList] = useState<Certificate[]>([
    {
      id: '1',
      name: '教师资格证',
      issuer: '教育部',
      issueDate: '2021-06',
      certNo: '202111001xxxx',
      proofFiles: ['cert.jpg'],
      status: 'verified'
    },
    {
      id: '2',
      name: '法律职业资格证',
      issuer: '司法部',
      issueDate: '2022-09',
      certNo: 'A202209xxxx',
      proofFiles: ['cert.jpg'],
      status: 'verified'
    },
    {
      id: '3',
      name: 'PMP项目管理认证',
      issuer: 'PMI',
      issueDate: '2023-03',
      certNo: 'PMP2023xxxx',
      proofFiles: ['cert.jpg'],
      status: 'pending'
    }
  ])
  
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

  const handleSaveBasic = async () => {
    if (!basicForm.name) {
      Taro.showToast({ title: '请填写姓名', icon: 'none' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setEditingBasic(false)
      Taro.showToast({ title: '保存成功', icon: 'success' })
    }, 500)
  }

  const handleUploadProof = async () => {
    try {
      await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })

      Taro.showLoading({ title: '上传中...' })
      
      setTimeout(() => {
        Taro.hideLoading()
        if (activeTab === 'work') {
          setWorkForm(prev => ({
            ...prev,
            proofFiles: [...prev.proofFiles, 'proof_' + Date.now() + '.jpg']
          }))
        } else {
          setCertForm(prev => ({
            ...prev,
            proofFiles: [...prev.proofFiles, 'proof_' + Date.now() + '.jpg']
          }))
        }
        Taro.showToast({ title: '上传成功', icon: 'success' })
      }, 1000)
    } catch {
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
    setTimeout(() => {
      setLoading(false)
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
    }, 500)
  }

  const handleSaveCert = async () => {
    if (!certForm.name || !certForm.issuer) {
      Taro.showToast({ title: '请填写证书名称和颁发机构', icon: 'none' })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
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
    }, 500)
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-6">
      {/* 顶部导航栏 */}
      <View className="bg-blue-500 px-4 py-3 flex items-center">
        <Text className="flex-1 text-center text-white text-lg font-semibold">资料管理</Text>
      </View>

      {/* 标签切换 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex gap-6">
          <View
            className={`pb-2 ${activeTab === 'basic' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <Text className={`${activeTab === 'basic' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              基本信息
            </Text>
          </View>
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
        {/* 基本信息Tab */}
        {activeTab === 'basic' && (
          <View>
            {/* 已添加的基本信息展示 */}
            {!editingBasic && (
              <Card className="mb-4">
                <CardHeader>
                  <View className="flex items-center justify-between">
                    <CardTitle>基本信息</CardTitle>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 rounded-full px-3 py-1 h-7"
                      onClick={() => setEditingBasic(true)}
                    >
                      <Text className="text-white text-xs">编辑</Text>
                    </Button>
                  </View>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <View className="space-y-3">
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <User size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">姓名</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.name}</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <User size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">性别</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.gender}</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <User size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">年龄</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.age}岁</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <Phone size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">手机号</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.phone}</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <Mail size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">邮箱</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.email}</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <FileText size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">证件号</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.idCard}</Text>
                    </View>
                    <View className="flex items-center gap-3 py-2">
                      <FileText size={18} color="#3b82f6" />
                      <Text className="text-sm text-gray-500 w-16">地址</Text>
                      <Text className="text-sm text-gray-900 flex-1">{basicInfo.address}</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            )}

            {/* 编辑基本信息表单 */}
            {editingBasic && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>编辑基本信息</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">姓名 *</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入姓名"
                        value={basicForm.name}
                        onInput={(e) => setBasicForm({ ...basicForm, name: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View className="flex gap-3">
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">性别</Text>
                      <View className="bg-gray-50 rounded-xl px-4 py-3">
                        <Input
                          className="w-full bg-transparent"
                          placeholder="请输入性别"
                          value={basicForm.gender}
                          onInput={(e) => setBasicForm({ ...basicForm, gender: e.detail.value })}
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="block text-sm font-medium text-gray-700 mb-2">年龄</Text>
                      <View className="bg-gray-50 rounded-xl px-4 py-3">
                        <Input
                          className="w-full bg-transparent"
                          placeholder="请输入年龄"
                          value={basicForm.age}
                          onInput={(e) => setBasicForm({ ...basicForm, age: e.detail.value })}
                        />
                      </View>
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">手机号</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入手机号"
                        value={basicForm.phone}
                        onInput={(e) => setBasicForm({ ...basicForm, phone: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">邮箱</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入邮箱"
                        value={basicForm.email}
                        onInput={(e) => setBasicForm({ ...basicForm, email: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">证件号码</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入证件号码"
                        value={basicForm.idCard}
                        onInput={(e) => setBasicForm({ ...basicForm, idCard: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="block text-sm font-medium text-gray-700 mb-2">地址</Text>
                    <View className="bg-gray-50 rounded-xl px-4 py-3">
                      <Input
                        className="w-full bg-transparent"
                        placeholder="请输入地址"
                        value={basicForm.address}
                        onInput={(e) => setBasicForm({ ...basicForm, address: e.detail.value })}
                      />
                    </View>
                  </View>

                  <View className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setEditingBasic(false)}
                    >
                      <Text className="text-gray-600">取消</Text>
                    </Button>
                    <Button
                      className="flex-1 bg-blue-600"
                      onClick={handleSaveBasic}
                      disabled={loading}
                    >
                      <Text className="text-white">{loading ? '保存中...' : '保存'}</Text>
                    </Button>
                  </View>
                </CardContent>
              </Card>
            )}
          </View>
        )}

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
                          <View className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText size={24} color="#9ca3af" />
                          </View>
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
                    <View className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusBadgeClass(work.status)}`}>
                      {getStatusIcon(work.status)}
                      <Text className="text-xs text-white">{getStatusText(work.status)}</Text>
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
                      <FileText size={14} color="#3b82f6" />
                      <Text className="text-xs text-blue-500">{work.proofFiles.length} 个证明文件</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
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
                          <View className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText size={24} color="#9ca3af" />
                          </View>
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
                    <View className="flex items-center gap-2">
                      <Award size={18} color="#3b82f6" />
                      <Text className="text-base font-medium text-gray-900">{cert.name}</Text>
                    </View>
                    <View className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusBadgeClass(cert.status)}`}>
                      {getStatusIcon(cert.status)}
                      <Text className="text-xs text-white">{getStatusText(cert.status)}</Text>
                    </View>
                  </View>
                  <Text className="block text-sm text-gray-600">颁发机构：{cert.issuer}</Text>
                  {cert.issueDate && (
                    <Text className="block text-xs text-gray-400 mt-1">发证日期：{cert.issueDate}</Text>
                  )}
                  {cert.certNo && (
                    <Text className="block text-xs text-gray-400">证书编号：{cert.certNo}</Text>
                  )}
                  {cert.proofFiles.length > 0 && (
                    <View className="flex items-center gap-1 mt-2">
                      <FileText size={14} color="#3b82f6" />
                      <Text className="text-xs text-blue-500">{cert.proofFiles.length} 个证书文件</Text>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default WorkHistoryPage
