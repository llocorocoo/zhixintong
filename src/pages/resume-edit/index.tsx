import { View, Text, ScrollView, Picker } from '@tarojs/components'
import { FC, useState, useEffect } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Calendar } from 'lucide-react-taro'

interface WorkRecord {
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  school: string
  degree: string
  major: string
  startDate: string
  endDate: string
}

interface Skill {
  name: string
  level: string
}

interface Certification {
  name: string
  issuer: string
  date: string
}

interface Language {
  name: string
  level: string
}

interface Project {
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
}

const degreeOptions = ['高中', '大专', '本科', '硕士', '博士']
const skillLevelOptions = ['入门', '熟练', '精通', '专家']
const languageLevelOptions = ['初级', '中级', '高级', '母语']

const ResumeEditPage: FC = () => {
  const router = useRouter()
  const { userInfo } = useUserStore()
  const [section, setSection] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // 基本信息表单
  const [basicForm, setBasicForm] = useState({
    name: '',
    gender: '',
    age: '',
    phone: '',
    email: ''
  })

  // 工作记录表单
  const [workForm, setWorkForm] = useState<WorkRecord>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  // 学历表单
  const [educationForm, setEducationForm] = useState<Education>({
    school: '',
    degree: '本科',
    major: '',
    startDate: '',
    endDate: ''
  })

  // 技能表单
  const [skillForm, setSkillForm] = useState<Skill>({
    name: '',
    level: '熟练'
  })

  // 证书表单
  const [certForm, setCertForm] = useState<Certification>({
    name: '',
    issuer: '',
    date: ''
  })

  // 语言表单
  const [languageForm, setLanguageForm] = useState<Language>({
    name: '',
    level: '中级'
  })

  // 项目表单
  const [projectForm, setProjectForm] = useState<Project>({
    name: '',
    role: '',
    startDate: '',
    endDate: '',
    description: ''
  })

  // 其他表单
  const [otherForm, setOtherForm] = useState({
    title: '',
    content: ''
  })

  useEffect(() => {
    const params = router.params
    if (params.section) {
      setSection(params.section)
    }
  }, [router.params])

  const handleSave = async () => {
    if (!userInfo?.id) return

    setLoading(true)
    try {
      let data: any = { userId: userInfo.id }

      switch (section) {
        case 'basic':
          if (!basicForm.name) {
            Taro.showToast({ title: '请填写姓名', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...basicForm }
          break

        case 'workRecords':
          if (!workForm.company || !workForm.position) {
            Taro.showToast({ title: '请填写公司和职位', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...workForm }
          break

        case 'education':
          if (!educationForm.school || !educationForm.degree) {
            Taro.showToast({ title: '请填写学校和学历', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...educationForm }
          break

        case 'skills':
          if (!skillForm.name) {
            Taro.showToast({ title: '请填写技能名称', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...skillForm }
          break

        case 'certifications':
          if (!certForm.name) {
            Taro.showToast({ title: '请填写证书名称', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...certForm }
          break

        case 'languages':
          if (!languageForm.name) {
            Taro.showToast({ title: '请填写语言名称', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...languageForm }
          break

        case 'projects':
          if (!projectForm.name || !projectForm.role) {
            Taro.showToast({ title: '请填写项目名称和角色', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...projectForm }
          break

        case 'other':
          if (!otherForm.title) {
            Taro.showToast({ title: '请填写标题', icon: 'none' })
            setLoading(false)
            return
          }
          data = { ...data, ...otherForm }
          break
      }

      const res = await Network.request({
        url: `/api/resume/${section}`,
        method: 'POST',
        data
      })

      if (res.data.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
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

  const renderBasicForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>基本信息</CardTitle>
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
                placeholder="男/女"
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
      </CardContent>
    </Card>
  )

  const renderWorkForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>工作记录</CardTitle>
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
            <Picker mode="date" value={workForm.startDate} onChange={(e) => setWorkForm({ ...workForm, startDate: e.detail.value })}>
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
            <Picker mode="date" value={workForm.endDate} onChange={(e) => setWorkForm({ ...workForm, endDate: e.detail.value })}>
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
      </CardContent>
    </Card>
  )

  const renderEducationForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>学历学籍</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">学校名称 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="请输入学校名称"
              value={educationForm.school}
              onInput={(e) => setEducationForm({ ...educationForm, school: e.detail.value })}
            />
          </View>
        </View>

        <View className="flex gap-3">
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">学历 *</Text>
            <Picker mode="selector" range={degreeOptions} value={degreeOptions.indexOf(educationForm.degree)} onChange={(e) => setEducationForm({ ...educationForm, degree: degreeOptions[Number(e.detail.value)] })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className="text-gray-900">{educationForm.degree}</Text>
              </View>
            </Picker>
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">专业</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="请输入专业"
                value={educationForm.major}
                onInput={(e) => setEducationForm({ ...educationForm, major: e.detail.value })}
              />
            </View>
          </View>
        </View>

        <View className="flex gap-3">
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">入学时间</Text>
            <Picker mode="date" value={educationForm.startDate} onChange={(e) => setEducationForm({ ...educationForm, startDate: e.detail.value })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className={educationForm.startDate ? 'text-gray-900' : 'text-gray-400'}>
                  {educationForm.startDate || '选择日期'}
                </Text>
                <Calendar size={18} color="#9ca3af" />
              </View>
            </Picker>
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">毕业时间</Text>
            <Picker mode="date" value={educationForm.endDate} onChange={(e) => setEducationForm({ ...educationForm, endDate: e.detail.value })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className={educationForm.endDate ? 'text-gray-900' : 'text-gray-400'}>
                  {educationForm.endDate || '选择日期'}
                </Text>
                <Calendar size={18} color="#9ca3af" />
              </View>
            </Picker>
          </View>
        </View>
      </CardContent>
    </Card>
  )

  const renderSkillForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>职业技能</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">技能名称 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="如：JavaScript、产品设计等"
              value={skillForm.name}
              onInput={(e) => setSkillForm({ ...skillForm, name: e.detail.value })}
            />
          </View>
        </View>

        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">熟练程度</Text>
          <Picker mode="selector" range={skillLevelOptions} value={skillLevelOptions.indexOf(skillForm.level)} onChange={(e) => setSkillForm({ ...skillForm, level: skillLevelOptions[Number(e.detail.value)] })}>
            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <Text className="text-gray-900">{skillForm.level}</Text>
            </View>
          </Picker>
        </View>
      </CardContent>
    </Card>
  )

  const renderCertForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>技能证书</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">证书名称 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="如：驾驶证、会计师证等"
              value={certForm.name}
              onInput={(e) => setCertForm({ ...certForm, name: e.detail.value })}
            />
          </View>
        </View>

        <View className="flex gap-3">
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">颁发机构</Text>
            <View className="bg-gray-50 rounded-xl px-4 py-3">
              <Input
                className="w-full bg-transparent"
                placeholder="选填"
                value={certForm.issuer}
                onInput={(e) => setCertForm({ ...certForm, issuer: e.detail.value })}
              />
            </View>
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">获得日期</Text>
            <Picker mode="date" value={certForm.date} onChange={(e) => setCertForm({ ...certForm, date: e.detail.value })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className={certForm.date ? 'text-gray-900' : 'text-gray-400'}>
                  {certForm.date || '选择日期'}
                </Text>
                <Calendar size={18} color="#9ca3af" />
              </View>
            </Picker>
          </View>
        </View>
      </CardContent>
    </Card>
  )

  const renderLanguageForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>语言能力</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">语言名称 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="如：英语、日语等"
              value={languageForm.name}
              onInput={(e) => setLanguageForm({ ...languageForm, name: e.detail.value })}
            />
          </View>
        </View>

        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">熟练程度</Text>
          <Picker mode="selector" range={languageLevelOptions} value={languageLevelOptions.indexOf(languageForm.level)} onChange={(e) => setLanguageForm({ ...languageForm, level: languageLevelOptions[Number(e.detail.value)] })}>
            <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <Text className="text-gray-900">{languageForm.level}</Text>
            </View>
          </Picker>
        </View>
      </CardContent>
    </Card>
  )

  const renderProjectForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>项目经历</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">项目名称 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="请输入项目名称"
              value={projectForm.name}
              onInput={(e) => setProjectForm({ ...projectForm, name: e.detail.value })}
            />
          </View>
        </View>

        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">担任角色 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="请输入您的角色"
              value={projectForm.role}
              onInput={(e) => setProjectForm({ ...projectForm, role: e.detail.value })}
            />
          </View>
        </View>

        <View className="flex gap-3">
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">开始时间</Text>
            <Picker mode="date" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.detail.value })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className={projectForm.startDate ? 'text-gray-900' : 'text-gray-400'}>
                  {projectForm.startDate || '选择日期'}
                </Text>
                <Calendar size={18} color="#9ca3af" />
              </View>
            </Picker>
          </View>
          <View className="flex-1">
            <Text className="block text-sm font-medium text-gray-700 mb-2">结束时间</Text>
            <Picker mode="date" value={projectForm.endDate} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.detail.value })}>
              <View className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <Text className={projectForm.endDate ? 'text-gray-900' : 'text-gray-400'}>
                  {projectForm.endDate || '选择日期'}
                </Text>
                <Calendar size={18} color="#9ca3af" />
              </View>
            </Picker>
          </View>
        </View>

        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">项目描述</Text>
          <View className="bg-gray-50 rounded-xl p-4">
            <Textarea
              style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
              placeholder="描述项目内容和您的贡献..."
              value={projectForm.description}
              onInput={(e) => setProjectForm({ ...projectForm, description: e.detail.value })}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  )

  const renderOtherForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>其他信息</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">标题 *</Text>
          <View className="bg-gray-50 rounded-xl px-4 py-3">
            <Input
              className="w-full bg-transparent"
              placeholder="请输入标题"
              value={otherForm.title}
              onInput={(e) => setOtherForm({ ...otherForm, title: e.detail.value })}
            />
          </View>
        </View>

        <View>
          <Text className="block text-sm font-medium text-gray-700 mb-2">内容</Text>
          <View className="bg-gray-50 rounded-xl p-4">
            <Textarea
              style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent' }}
              placeholder="请输入内容..."
              value={otherForm.content}
              onInput={(e) => setOtherForm({ ...otherForm, content: e.detail.value })}
            />
          </View>
        </View>
      </CardContent>
    </Card>
  )

  const renderForm = () => {
    switch (section) {
      case 'basic':
        return renderBasicForm()
      case 'workRecords':
        return renderWorkForm()
      case 'education':
        return renderEducationForm()
      case 'skills':
        return renderSkillForm()
      case 'certifications':
        return renderCertForm()
      case 'languages':
        return renderLanguageForm()
      case 'projects':
        return renderProjectForm()
      case 'other':
        return renderOtherForm()
      default:
        return null
    }
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      <ScrollView className="flex-1 p-4">
        {renderForm()}
      </ScrollView>

      {/* 底部保存按钮 */}
      <View className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <Button
          className="w-full bg-blue-600"
          onClick={handleSave}
          disabled={loading}
        >
          <Text className="text-white">{loading ? '保存中...' : '保存'}</Text>
        </Button>
      </View>
    </View>
  )
}

export default ResumeEditPage
