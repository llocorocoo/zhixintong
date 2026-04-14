import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { FC, useState, useEffect, useMemo } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import { Briefcase, FileText, Wrench, ChevronRight, FileSearch, UserCheck, TrendingUp, Award, Bell } from 'lucide-react-taro'

interface CreditScoreData {
  score: number
  level: string
  factors?: Record<string, number>
}

const FACTOR_LABELS: Record<string, string> = {
  authenticity: '真实性',
  stability: '稳定性',
  compliance: '合规性',
  safety: '安全性',
  professionalism: '专业性',
  reliability: '可靠性',
}

const FACTOR_COLORS: Record<string, string> = {
  authenticity: '#3b82f6',
  stability: '#8b5cf6',
  compliance: '#f59e0b',
  safety: '#ef4444',
  professionalism: '#10b981',
  reliability: '#06b6d4',
}

const getLevelInfo = (score: number) => {
  if (score >= 800) return { label: '优秀', color: '#10b981', bg: '#dcfce7' }
  if (score >= 700) return { label: '良好', color: '#3b82f6', bg: '#dbeafe' }
  if (score >= 600) return { label: '中等', color: '#f59e0b', bg: '#fef3c7' }
  return { label: '待提升', color: '#ef4444', bg: '#fee2e2' }
}

const IndexPage: FC = () => {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [detailTab, setDetailTab] = useState(0)
  const { userInfo, isLoggedIn } = useUserStore()

  const radarSvg = useMemo(() => {
    if (!creditScore?.factors) return null
    const factors = creditScore.factors
    const keys = Object.keys(factors)
    const values = Object.values(factors)
    const count = keys.length
    const cx = 140, cy = 120, radius = 80
    const step = (Math.PI * 2) / count
    const start = -Math.PI / 2
    const pt = (a: number, r: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    const grids = [1,2,3,4,5].map(l => {
      const r = (radius/5)*l
      const pts = Array.from({length:count},(_,i)=>pt(start+step*i,r))
      return `<polygon points="${pts.join(' ')}" fill="none" stroke="#e5e7eb" stroke-width="0.5"/>`
    })
    const axes = Array.from({length:count},(_,i)=>{
      const a=start+step*i
      return `<line x1="${cx}" y1="${cy}" x2="${pt(a,radius).split(',')[0]}" y2="${pt(a,radius).split(',')[1]}" stroke="#e5e7eb" stroke-width="0.5"/>`
    })
    const dataPts = Array.from({length:count},(_,i)=>pt(start+step*i,(values[i]/100)*radius))
    const poly = `<polygon points="${dataPts.join(' ')}" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" stroke-width="2"/>`
    const dots = dataPts.map(p=>{const[x,y]=p.split(',');return `<circle cx="${x}" cy="${y}" r="4" fill="#3b82f6" stroke="#fff" stroke-width="2"/>`})
    const lbls = Array.from({length:count},(_,i)=>{
      const a=start+step*i
      const lx=cx+(radius+24)*Math.cos(a), ly=cy+(radius+24)*Math.sin(a)
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#374151">${FACTOR_LABELS[keys[i]]||keys[i]} ${values[i]}</text>`
    })
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 240" width="280" height="240">${grids.join('')}${axes.join('')}${poly}${dots.join('')}${lbls.join('')}</svg>`
  }, [creditScore])

  useEffect(() => {
    if (!isLoggedIn) { Taro.redirectTo({ url: '/pages/login/index' }); return }
    fetchCreditScore()
  }, [isLoggedIn])

  useDidShow(() => { if (isLoggedIn) fetchCreditScore() })

  const fetchCreditScore = async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({ url: '/api/credit/score', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200 && res.data.data) setCreditScore(res.data.data)
    } catch {}
  }

  const levelInfo = creditScore ? getLevelInfo(creditScore.score) : null

  const quickActions = [
    { icon: Briefcase, title: 'AI自证', color: '#3b82f6', bg: '#eff6ff', action: () => {} },
    { icon: FileText, title: '样例报告', color: '#8b5cf6', bg: '#f5f3ff', action: () => Taro.navigateTo({ url: '/pages/sample-report/index' }) },
    { icon: Wrench, title: '信用修复', color: '#f59e0b', bg: '#fffbeb', action: () => Taro.navigateTo({ url: '/pages/credit-repair/index' }) },
  ]

  const menuItems = [
    { icon: FileSearch, title: '信用报告', desc: '授权查询并生成信用报告', path: '/pages/report/index', color: '#3b82f6', bg: '#eff6ff' },
    { icon: UserCheck, title: '可信简历', desc: '生成和维护可信简历', path: '/pages/resume/index', color: '#8b5cf6', bg: '#f5f3ff' },
    { icon: TrendingUp, title: '提升信用', desc: '提升信用分和报告可信度', path: '/pages/enhancement/index', color: '#10b981', bg: '#f0fdf4' },
  ]

  const navigate = (path: string) => {
    const tabs = ['/pages/index/index', '/pages/report/index', '/pages/resume/index', '/pages/profile/index']
    tabs.some(t => path.startsWith(t)) ? Taro.switchTab({ url: path }) : Taro.navigateTo({ url: path })
  }

  return (
    <View className="min-h-screen" style={{ background: '#f0f4f8' }}>

      {/* ── 顶部渐变头部 ── */}
      <View style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', paddingTop: '48px', paddingBottom: '80px', paddingLeft: '16px', paddingRight: '16px' }}>
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-bold mb-0.5">
              Hi，{userInfo?.name || '用户'} 👋
            </Text>
            <Text className="block text-blue-200 text-sm">管理您的职业信用档案</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center active:opacity-70">
            <Bell size={20} color="#ffffff" />
          </View>
        </View>
      </View>

      {/* ── 信用评分主卡片 ── */}
      <View className="px-4 -mt-14">
        <View className="bg-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>

          {/* 评分区 */}
          <View className="px-5 pt-5 pb-4">
            <View className="flex items-center justify-between mb-4">
              <Text className="text-sm font-medium text-gray-500">职业信用评分</Text>
              {levelInfo && (
                <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: levelInfo.bg }}>
                  <Text className="text-xs font-medium" style={{ color: levelInfo.color }}>{levelInfo.label}</Text>
                </View>
              )}
            </View>

            <View className="flex items-end justify-between">
              <View className="flex items-end gap-2">
                <Text className="font-bold leading-none" style={{ fontSize: creditScore ? '56px' : '48px', color: creditScore ? '#1e40af' : '#d1d5db' }}>
                  {creditScore ? creditScore.score : '—'}
                </Text>
                {creditScore && <Text className="text-sm text-gray-400 mb-2">/ 940</Text>}
              </View>

              {creditScore ? (
                <View
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl active:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 2px 12px rgba(59,130,246,0.4)' }}
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <Text className="text-white text-sm font-medium">查看报告</Text>
                  <ChevronRight size={16} color="#ffffff" />
                </View>
              ) : (
                <View
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl active:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 2px 12px rgba(59,130,246,0.4)' }}
                  onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
                >
                  <FileText size={16} color="#ffffff" />
                  <Text className="text-white text-sm font-medium">立即生成</Text>
                </View>
              )}
            </View>

            {!creditScore && (
              <Text className="block text-xs text-gray-400 mt-2">生成信用报告后将自动同步评分</Text>
            )}
          </View>

          {/* 展开详情 toggle */}
          {creditScore && (
            <View
              className="flex items-center justify-center py-2.5 border-t border-gray-100 active:bg-gray-50"
              onClick={() => { setShowDetail(!showDetail); setDetailTab(0) }}
            >
              <Text className="text-xs text-blue-500 font-medium mr-1">{showDetail ? '收起详情' : '查看详情'}</Text>
              <ChevronRight size={14} color="#3b82f6" style={{ transform: showDetail ? 'rotate(90deg)' : 'rotate(0deg)' }} />
            </View>
          )}

          {/* 展开内容 */}
          {showDetail && (
            <View className="border-t border-gray-100 bg-gray-50">
              <View className="flex items-center justify-center gap-3 pt-3 pb-1">
                {['评分明细', '雷达图'].map((tab, i) => (
                  <View
                    key={i}
                    className={`px-4 py-1.5 rounded-full ${detailTab === i ? 'bg-blue-600' : 'bg-gray-200'}`}
                    onClick={() => setDetailTab(i)}
                  >
                    <Text className={`text-xs font-medium ${detailTab === i ? 'text-white' : 'text-gray-500'}`}>{tab}</Text>
                  </View>
                ))}
              </View>
              <Swiper current={detailTab} onChange={e => setDetailTab(e.detail.current)} style={{ height: '260px' }}>
                <SwiperItem>
                  <View className="p-4 space-y-2">
                    {creditScore?.factors && Object.entries(creditScore.factors).map(([key, val]) => (
                      <View key={key} className="flex items-center justify-between py-1">
                        <View className="flex items-center gap-2">
                          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: FACTOR_COLORS[key] || '#3b82f6' }} />
                          <Text className="text-sm text-gray-600">{FACTOR_LABELS[key]}</Text>
                        </View>
                        <View className="flex items-center gap-2">
                          <View className="w-20 h-1.5 bg-gray-200 rounded-full">
                            <View className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: FACTOR_COLORS[key] || '#3b82f6' }} />
                          </View>
                          <Text className="text-sm font-medium text-gray-900 w-7 text-right">{val}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </SwiperItem>
                <SwiperItem>
                  <View className="flex items-center justify-center h-full">
                    {radarSvg && <Image src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(radarSvg)}`} style={{ width: '280px', height: '220px' }} mode="aspectFit" />}
                  </View>
                </SwiperItem>
              </Swiper>
              <View className="px-4 pb-3 flex items-center justify-between">
                <Text className="text-xs text-gray-400">更新时间：{new Date().toLocaleDateString('zh-CN')}</Text>
                <View className="px-3 py-1 bg-blue-50 rounded-full active:bg-blue-100" onClick={() => setShowModel(true)}>
                  <Text className="text-xs text-blue-500 font-medium">评分说明</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── 快捷功能 ── */}
      <View className="px-4 mt-4">
        <View className="bg-white rounded-2xl p-4 flex justify-around" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {quickActions.map((item, i) => (
            <View key={i} className="flex flex-col items-center gap-2 active:opacity-70" onClick={item.action}>
              <View className="w-13 h-13 rounded-2xl flex items-center justify-center" style={{ width: '52px', height: '52px', backgroundColor: item.bg }}>
                <item.icon size={24} color={item.color} />
              </View>
              <Text className="text-xs font-medium" style={{ color: '#4b5563' }}>{item.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 核心功能列表 ── */}
      <View className="px-4 mt-4 space-y-3 pb-6">
        {menuItems.map((item, i) => (
          <View
            key={i}
            className="bg-white rounded-2xl flex items-center px-4 py-4 active:opacity-90"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            onClick={() => navigate(item.path)}
          >
            <View className="w-11 h-11 rounded-xl flex items-center justify-center mr-4 flex-shrink-0" style={{ backgroundColor: item.bg }}>
              <item.icon size={22} color={item.color} />
            </View>
            <View className="flex-1">
              <Text className="block text-base font-semibold text-gray-900">{item.title}</Text>
              <Text className="block text-xs text-gray-400 mt-0.5">{item.desc}</Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
              <ChevronRight size={16} color="#9ca3af" />
            </View>
          </View>
        ))}
      </View>

      {/* ── 评分说明弹窗 ── */}
      {showModel && (
        <View className="fixed inset-0 bg-black bg-opacity-50 flex flex-col z-50" onClick={() => setShowModel(false)}>
          <View className="bg-white flex-1 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <View className="px-5 pt-5 pb-4 flex-shrink-0 flex items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">职业信用评分说明</Text>
              <View className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200" onClick={() => setShowModel(false)}>
                <Text className="text-gray-500 text-lg leading-none">×</Text>
              </View>
            </View>
            <View className="h-px bg-gray-100 flex-shrink-0" />
            <View className="flex-1 overflow-y-auto">
              <View className="p-5 space-y-4">
                <View className="border border-gray-100 rounded-2xl overflow-hidden">
                  {[
                    { num: '1', name: '真实性', color: '#3b82f6', desc: '工作经历、身份等数据是否真实，是否存在造假行为', source: '公安网、学信网、前雇主核实' },
                    { num: '2', name: '稳定性', color: '#8b5cf6', desc: '入职后能否稳定产出，是否跳槽频繁、空窗期长', source: '简历、社保记录、背调报告' },
                    { num: '3', name: '合规性', color: '#f59e0b', desc: '过往职业生涯是否遵守规则，是否有竞业风险或工作违纪', source: '前雇主评价、公开数据' },
                    { num: '4', name: '安全性', color: '#ef4444', desc: '是否存在用工安全风险，如司法诉讼、劳动争议、黑名单等', source: '司法数据、执行信息公开网' },
                    { num: '5', name: '专业性', color: '#10b981', desc: '知识技能与岗位匹配度，包括职业资格、学历层次等', source: '简历、证书查询、公开信息' },
                    { num: '6', name: '可靠性', color: '#06b6d4', desc: '履约意愿及个人财务信用状况，包括征信、负债、欠税等', source: '前雇主评价、社保记录、征信报告' },
                  ].map((item, idx, arr) => (
                    <View key={item.num} className={`p-4 ${idx < arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <View className="flex items-center gap-2 mb-1.5">
                        <View className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color }}>
                          <Text className="text-white text-xs font-bold">{item.num}</Text>
                        </View>
                        <Text className="text-sm font-semibold text-gray-900">{item.name}</Text>
                      </View>
                      <Text className="block text-xs text-gray-500 mb-1 leading-relaxed">{item.desc}</Text>
                      <Text className="block text-xs text-gray-300">数据来源：{item.source}</Text>
                    </View>
                  ))}
                </View>
                <View className="p-3 bg-blue-50 rounded-xl">
                  <Text className="text-xs text-blue-600 leading-relaxed">评分范围约 350–940 分，结果仅供参考，不作为任何法律依据。</Text>
                </View>
              </View>
            </View>
            <View className="h-px bg-gray-100 flex-shrink-0" />
            <View className="px-4 pt-4 pb-8 flex-shrink-0">
              <View className="w-full rounded-2xl py-3.5 flex items-center justify-center active:opacity-80"
                style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}
                onClick={() => setShowModel(false)}>
                <Text className="text-white font-semibold">我知道了</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default IndexPage
