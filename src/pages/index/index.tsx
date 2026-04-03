import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { FC, useState, useEffect, useMemo } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Card, CardContent } from '@/components/ui/card'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Briefcase, FileText, Wrench, ChevronRight, FileSearch, UserCheck, TrendingUp, Award } from 'lucide-react-taro'

interface CreditScoreData {
  score: number
  level: string
  factors?: {
    authenticity?: number
    stability?: number
    compliance?: number
    safety?: number
    professionalism?: number
    reliability?: number
  }
}

const getFactorText = (key: string) => {
  const factorMap: Record<string, string> = {
    authenticity: '真实性',
    stability: '稳定性',
    compliance: '合规性',
    safety: '安全性',
    professionalism: '专业性',
    reliability: '可靠性'
  }
  return factorMap[key] || key
}

const IndexPage: FC = () => {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [detailTab, setDetailTab] = useState(0)

  // 纯 SVG 雷达图数据
  const radarSvg = useMemo(() => {
    if (!creditScore?.factors) return null
    const factors = creditScore.factors
    const keys = Object.keys(factors)
    const values = Object.values(factors) as number[]
    const labels = keys.map(k => getFactorText(k))
    const count = keys.length
    const cx = 140, cy = 120, radius = 80
    const angleStep = (Math.PI * 2) / count
    const startAngle = -Math.PI / 2

    const point = (angle: number, r: number) =>
      `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`

    // 背景网格
    const grids = [1, 2, 3, 4, 5].map(level => {
      const r = (radius / 5) * level
      const pts = Array.from({ length: count }, (_, i) => point(startAngle + angleStep * i, r))
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>`
    })

    // 轴线
    const axes = Array.from({ length: count }, (_, i) => {
      const angle = startAngle + angleStep * i
      return `<line x1="${cx}" y1="${cy}" x2="${point(angle, radius).split(',')[0]}" y2="${point(angle, radius).split(',')[1]}" stroke="#e5e7eb" stroke-width="0.5"/>`
    })

    // 数据多边形
    const dataPts = Array.from({ length: count }, (_, i) =>
      point(startAngle + angleStep * i, (values[i] / 100) * radius)
    )
    const dataPolygon = `<polygon points="${dataPts.join(' ')}" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" stroke-width="2"/>`

    // 数据点
    const dots = dataPts.map(p => {
      const [x, y] = p.split(',')
      return `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" stroke="#fff" stroke-width="2"/>`
    })

    // 标签
    const labelEls = Array.from({ length: count }, (_, i) => {
      const angle = startAngle + angleStep * i
      const lx = cx + (radius + 24) * Math.cos(angle)
      const ly = cy + (radius + 24) * Math.sin(angle)
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#374151">${labels[i]} ${values[i]}</text>`
    })

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 240" width="280" height="240">${grids.join('')}${axes.join('')}${dataPolygon}${dots.join('')}${labelEls.join('')}</svg>`
  }, [creditScore])
  const { userInfo, isLoggedIn } = useUserStore()

  useEffect(() => {
    if (!isLoggedIn) {
      Taro.redirectTo({ url: '/pages/login/index' })
      return
    }
    fetchCreditScore()
  }, [isLoggedIn])

  // 每次页面显示时重新获取评分（从报告页返回时刷新）
  useDidShow(() => {
    if (isLoggedIn) {
      fetchCreditScore()
    }
  })

  const fetchCreditScore = async () => {
    if (!userInfo?.id) return

    try {
      const res = await Network.request({
        url: '/api/credit/score',
        method: 'POST',
        data: { userId: userInfo.id }
      })

      console.log('信用评分响应:', res.data)

      if (res.data.code === 200 && res.data.data) {
        setCreditScore(res.data.data)
      }
    } catch (error) {
      console.error('获取信用评分失败:', error)
    }
  }


  const quickActions = [
    { icon: Briefcase, title: 'AI自证', action: () => {} },
    { icon: FileText, title: '样例报告', action: () => Taro.navigateTo({ url: '/pages/sample-report/index' }) },
    { icon: Wrench, title: '信用修复', action: () => Taro.navigateTo({ url: '/pages/credit-repair/index' }) }
  ]

  const menuItems = [
    { 
      icon: FileSearch, 
      title: '信用报告', 
      desc: '授权查询并生成信用报告',
      path: '/pages/report/index'
    },
    { 
      icon: UserCheck, 
      title: '可信简历', 
      desc: '生成和维护可信简历',
      path: '/pages/resume/index'
    },
    { 
      icon: TrendingUp, 
      title: '提升信用',
      desc: '提升信用分和报告可信度',
      path: '/pages/enhancement/index'
    },
  ]

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部蓝色信息栏 */}
      <View className="bg-blue-500 px-4 pt-12 pb-20">
        <Text className="block text-white text-xl font-semibold mb-1">
          Hi {userInfo?.name || '用户'}
        </Text>
        <Text className="block text-white text-sm opacity-90">
          管理您的职业信用档案
        </Text>
      </View>

      {/* 核心信用展示区 */}
      <View className="px-4 -mt-12">
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* 信用分主区域 */}
            <View className="p-5">
              {/* 信用分居中显示 */}
              <View className="flex flex-col items-center mb-4">
                <Text className="text-sm text-gray-500 mb-3">职业信用评分</Text>
                <View className="flex items-center">
                  <View className={`w-16 h-16 rounded-full flex items-center justify-center mr-3 ${creditScore ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gray-200'}`}>
                    <Award size={32} color={creditScore ? '#ffffff' : '#9ca3af'} />
                  </View>
                  <View
                    className={`flex items-center ${creditScore ? 'active:opacity-70' : ''}`}
                    onClick={() => {
                      if (creditScore) { setShowDetail(!showDetail); setDetailTab(0) }
                    }}
                  >
                    <Text className={`text-5xl font-bold ${creditScore ? 'text-blue-600' : 'text-gray-300'}`}>
                      {creditScore ? creditScore.score : '-'}
                    </Text>
                    {creditScore && (
                      <View className="ml-2 p-1">
                        <ChevronRight
                          size={24}
                          color="#3b82f6"
                          style={{
                            transform: showDetail ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s'
                          }}
                        />
                      </View>
                    )}
                  </View>
                </View>
                {!creditScore && (
                  <Text className="text-xs text-gray-400 mt-2">生成信用报告后将自动同步评分</Text>
                )}
              </View>

              {/* 下方左右分布：slogan + 按钮 */}
              {creditScore ? (
                <View className="flex items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-gray-500 text-sm">职业信用，职场通行证</Text>
                  </View>
                  <View
                    className="bg-blue-600 rounded-full px-5 py-3 shadow-md active:bg-blue-700"
                    onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                  >
                    <Text className="text-white text-sm font-medium">查看报告</Text>
                  </View>
                </View>
              ) : (
                <View
                  className="w-full bg-blue-600 rounded-xl py-3 flex items-center justify-center shadow-md active:bg-blue-700"
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileText size={18} color="#ffffff" />
                  <Text className="text-white text-sm font-medium ml-2">立即查询职业信用评分</Text>
                </View>
              )}
            </View>

            {/* 信用分详情卡片（展开/收起） */}
            {showDetail && (
              <View className="border-t border-gray-100 bg-gray-50">
                {/* Tab 切换指示器 */}
                <View className="flex items-center justify-center gap-4 pt-3 pb-1">
                  <View
                    className={`px-3 py-1 rounded-full ${detailTab === 0 ? 'bg-blue-600' : 'bg-gray-200'}`}
                    onClick={() => setDetailTab(0)}
                  >
                    <Text className={`text-xs font-medium ${detailTab === 0 ? 'text-white' : 'text-gray-500'}`}>评分明细</Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full ${detailTab === 1 ? 'bg-blue-600' : 'bg-gray-200'}`}
                    onClick={() => setDetailTab(1)}
                  >
                    <Text className={`text-xs font-medium ${detailTab === 1 ? 'text-white' : 'text-gray-500'}`}>雷达图</Text>
                  </View>
                </View>

                <Swiper
                  current={detailTab}
                  onChange={(e) => {
                    setDetailTab(e.detail.current)
                  }}
                  style={{ height: '280px' }}
                >
                  {/* 第一页：评分明细 */}
                  <SwiperItem>
                    <View className="p-4">
                      <Text className="block text-sm font-semibold text-gray-700 mb-3">信用评分明细</Text>
                      <View className="space-y-2">
                        {creditScore?.factors && Object.entries(creditScore.factors).map(([key, value]) => (
                          <View key={key} className="flex items-center justify-between py-1.5">
                            <Text className="text-sm text-gray-600">{getFactorText(key)}</Text>
                            <View className="flex items-center">
                              <View className="w-24 h-1.5 bg-gray-200 rounded-full mr-2">
                                <View
                                  className="h-full bg-blue-500 rounded-full"
                                  style={{ width: `${value}%` }}
                                />
                              </View>
                              <Text className="text-sm font-medium text-gray-900 w-8 text-right">{value}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </SwiperItem>

                  {/* 第二页：雷达图 */}
                  <SwiperItem>
                    <View className="flex items-center justify-center" style={{ height: '240px' }}>
                      {radarSvg && (
                        <Image
                          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(radarSvg)}`}
                          style={{ width: '280px', height: '240px' }}
                          mode="aspectFit"
                        />
                      )}
                    </View>
                  </SwiperItem>
                </Swiper>

                {/* 底部：滑动指示点 + 查看说明 */}
                <View className="px-4 pb-3 flex items-center justify-between">
                  <View className="flex items-center gap-1.5">
                    <View className={`w-1.5 h-1.5 rounded-full ${detailTab === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <View className={`w-1.5 h-1.5 rounded-full ${detailTab === 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <Text className="text-xs text-gray-400 ml-1">
                      更新时间：{new Date().toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 bg-blue-50 rounded-full active:bg-blue-100"
                    onClick={() => setShowModel(true)}
                  >
                    <Text className="text-xs text-blue-600 font-medium">查看说明</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 信用评分模型说明弹窗 */}
            {showModel && (
              <View
                className="fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50"
                onClick={() => setShowModel(false)}
              >
                <View
                  className="bg-white flex-1 flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 标题栏 */}
                  <View className="px-5 pt-4 pb-4 flex-shrink-0">
                    <Text className="block text-lg font-bold text-gray-900">职业信用评分说明</Text>
                  </View>
                  <View className="h-px bg-gray-200 flex-shrink-0" />

                  {/* 滚动内容区 */}
                  <View className="flex-1 overflow-y-auto">
                    <View className="p-5 space-y-4">
                      {/* 评分维度 */}
                      <View>
                        <Text className="block text-sm font-semibold text-gray-800 mb-3">评分维度</Text>
                        <View className="border border-gray-200 rounded-xl overflow-hidden">
                          {[
                            { num: '1', name: '真实性', desc: '工作经历、身份等数据是否真实，是否存在造假行为', source: '数据来源：公安网、学信网、前雇主核实' },
                            { num: '2', name: '稳定性', desc: '入职后能否稳定产出，是否跳槽频繁、空窗期长', source: '数据来源：简历、社保记录、背调报告' },
                            { num: '3', name: '合规性', desc: '过往职业生涯是否遵守规则，是否有竞业风险或工作违纪', source: '数据来源：前雇主评价、公开数据' },
                            { num: '4', name: '安全性', desc: '是否存在用工安全风险，如司法诉讼、劳动争议、黑名单、犯罪记录等', source: '数据来源：司法数据、执行信息公开网' },
                            { num: '5', name: '专业性', desc: '知识技能与岗位匹配度，包括职业资格、学历层次、公司规模等', source: '数据来源：简历、证书查询、公开信息' },
                            { num: '6', name: '可靠性', desc: '履约意愿及个人财务信用状况，包括兼职情况、征信、负债、欠税等', source: '数据来源：前雇主评价、社保记录、个人征信报告（授权）、税务信息' },
                          ].map((item, idx, arr) => (
                            <View key={item.num} className={`p-3 ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <View className="flex items-center gap-2 mb-1.5">
                                <View className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                                  <Text className="text-white text-xs font-bold">{item.num}</Text>
                                </View>
                                <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                              </View>
                              <Text className="block text-xs text-gray-500 mb-1">{item.desc}</Text>
                              <Text className="block text-xs text-gray-400">{item.source}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* 评价标准 */}
                      <View>
                        <Text className="block text-sm font-semibold text-gray-800 mb-2">评价标准</Text>
                        <Text className="block text-xs text-gray-500 leading-relaxed">
                          各维度下设置具体评价特征，根据核实结果在基准分上进行加减。正向行为（如信息核实一致、无违规记录）加分，负向行为（如信息造假、存在失信记录）扣分。各维度得分累加后形成最终信用分，评分范围约 350 - 940 分。
                        </Text>
                      </View>

                      <View className="p-3 bg-gray-50 rounded-lg">
                        <Text className="block text-xs text-gray-400">
                          评分结果仅供参考，不作为任何法律依据。
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 底部按钮 */}
                  <View className="h-px bg-gray-200 flex-shrink-0" />
                  <View className="px-4 pt-4 pb-8 flex-shrink-0">
                    <View
                      className="w-full bg-blue-600 rounded-xl py-3.5 flex items-center justify-center active:bg-blue-700"
                      onClick={() => setShowModel(false)}
                    >
                      <Text className="text-white font-semibold text-base">我知道了</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </CardContent>
        </Card>
      </View>

      {/* 快捷功能图标区 */}
      <View className="px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <View className="flex justify-around">
              {quickActions.map((item, index) => (
                <View
                  key={index}
                  className="flex flex-col items-center active:opacity-70"
                  onClick={item.action}
                >
                  <View className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                    <item.icon size={24} color="#3b82f6" />
                  </View>
                  <Text className="text-sm text-blue-600">{item.title}</Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 核心功能列表区 */}
      <View className="px-4 mt-4">
        {menuItems.map((item, index) => (
          <Card key={index} className="mb-3">
            <CardContent className="p-0">
              <View
                className="flex items-center p-4 active:bg-gray-50"
                onClick={() => {
                  const tabBarPages = ['/pages/index/index', '/pages/report/index', '/pages/resume/index', '/pages/profile/index']
                  const isTabBar = tabBarPages.some(p => item.path.startsWith(p))
                  if (isTabBar) {
                    Taro.switchTab({ url: item.path })
                  } else {
                    Taro.navigateTo({ url: item.path })
                  }
                }}
              >
                <View className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-3">
                  <item.icon size={20} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="block text-base font-semibold text-gray-900">{item.title}</Text>
                  <Text className="block text-sm text-gray-500 mt-0.5">{item.desc}</Text>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </View>
            </CardContent>
          </Card>
        ))}
      </View>

    </View>
  )
}

export default IndexPage
