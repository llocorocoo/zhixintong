import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { FC, useState, useEffect, useMemo } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  Briefcase, FileText, Wrench, ChevronRight,
  FileSearch, UserCheck, TrendingUp
} from 'lucide-react-taro'

interface CreditScoreData {
  score: number
  level: string
  factors?: Record<string, number>
}

const FACTOR_LABELS: Record<string, string> = {
  authenticity: '真实性', stability: '稳定性', compliance: '合规性',
  safety: '安全性', professionalism: '专业性',
}

const FACTOR_COLORS: Record<string, string> = {
  authenticity: '#3b82f6', stability: '#8b5cf6', compliance: '#f59e0b',
  safety: '#ef4444', professionalism: '#10b981',
}

const getLevelInfo = (score: number) => {
  if (score >= 800) return { label: '优秀', color: '#059669', bg: 'rgba(5,150,105,0.1)' }
  if (score >= 700) return { label: '良好', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' }
  if (score >= 600) return { label: '中等', color: '#d97706', bg: 'rgba(217,119,6,0.1)' }
  return { label: '待提升', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' }
}

const IndexPage: FC = () => {
  const [creditScore, setCreditScore] = useState<CreditScoreData | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [detailTab, setDetailTab] = useState(0)
  const [pressedAction, setPressedAction] = useState<number | null>(null)
  const [pressedMenu, setPressedMenu] = useState<number | null>(null)
  const { userInfo, isLoggedIn } = useUserStore()

  const radarSvg = useMemo(() => {
    if (!creditScore?.factors) return null
    const raw = creditScore.factors
    const filtered = Object.fromEntries(Object.entries(raw).filter(([k]) => k in FACTOR_LABELS))
    const factors = filtered
    const keys = Object.keys(factors), values = Object.values(factors), count = keys.length
    const cx = 140, cy = 120, radius = 80, step = (Math.PI * 2) / count, start = -Math.PI / 2
    const pt = (a: number, r: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    const grids = [1,2,3,4,5].map(l => { const r=(radius/5)*l; const pts=Array.from({length:count},(_,i)=>pt(start+step*i,r)); return `<polygon points="${pts.join(' ')}" fill="none" stroke="#e2e8f0" stroke-width="1"/>` })
    const axes = Array.from({length:count},(_,i)=>{ const a=start+step*i; return `<line x1="${cx}" y1="${cy}" x2="${pt(a,radius).split(',')[0]}" y2="${pt(a,radius).split(',')[1]}" stroke="#e2e8f0" stroke-width="1"/>` })
    const dataPts = Array.from({length:count},(_,i)=>pt(start+step*i,(values[i]/100)*radius))
    const poly = `<polygon points="${dataPts.join(' ')}" fill="rgba(37,99,235,0.12)" stroke="#2563eb" stroke-width="2"/>`
    const dots = dataPts.map(p=>{ const[x,y]=p.split(','); return `<circle cx="${x}" cy="${y}" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>` })
    const lbls = Array.from({length:count},(_,i)=>{ const a=start+step*i; const lx=cx+(radius+26)*Math.cos(a),ly=cy+(radius+26)*Math.sin(a); return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#475569">${FACTOR_LABELS[keys[i]]||keys[i]} ${values[i]}</text>` })
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

  const navigate = (path: string) => {
    const tabs = ['/pages/index/index', '/pages/report/index', '/pages/resume/index', '/pages/profile/index']
    tabs.some(t => path.startsWith(t)) ? Taro.switchTab({ url: path }) : Taro.navigateTo({ url: path })
  }

  const quickActions = [
    { icon: Briefcase, title: 'AI自证',  color: '#2563eb', bg: '#eff6ff', action: () => {} },
    { icon: FileText,  title: '样例报告', color: '#7c3aed', bg: '#f5f3ff', action: () => Taro.navigateTo({ url: '/pages/sample-report/index' }) },
    { icon: Wrench,    title: '信用修复', color: '#d97706', bg: '#fffbeb', action: () => Taro.navigateTo({ url: '/pages/credit-repair/index' }) },
  ]

  const menuItems = [
    { icon: FileSearch, title: '信用报告', desc: '授权查询并生成信用报告', path: '/pages/report/index',    color: '#2563eb', bg: '#eff6ff', accent: '#2563eb' },
    { icon: UserCheck,  title: '可信简历', desc: '生成和维护可信简历',    path: '/pages/resume/index',    color: '#7c3aed', bg: '#f5f3ff', accent: '#7c3aed' },
    { icon: TrendingUp, title: '提升信用', desc: '提升信用分和报告可信度', path: '/pages/enhancement/index', color: '#059669', bg: '#f0fdf4', accent: '#059669' },
  ]

  const SCORE_DIMENSIONS = [
    { num: '1', name: '真实性', color: '#3b82f6', desc: '工作经历、身份等数据是否真实，是否存在造假行为', source: '公安网、学信网、前雇主核实' },
    { num: '2', name: '稳定性', color: '#8b5cf6', desc: '入职后能否稳定产出，是否跳槽频繁、空窗期长', source: '简历、社保记录、背调报告' },
    { num: '3', name: '合规性', color: '#f59e0b', desc: '过往职业生涯是否遵守规则，是否有竞业风险、违纪或欠税记录', source: '前雇主评价、税务公开信息' },
    { num: '4', name: '安全性', color: '#ef4444', desc: '是否存在用工安全风险，如司法诉讼、劳动争议、关联企业风险、个人征信等', source: '司法数据、征信中心、工商数据' },
    { num: '5', name: '专业性', color: '#10b981', desc: '知识技能与岗位匹配度，包括职业资格、学历层次等', source: '简历、证书查询、公开信息' },
  ]

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 毛玻璃吸顶导航 ── */}
      <View style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(246,248,252,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '44px 20px 14px',
        transition: 'all 0.3s ease',
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.3' }}>
              Hi，{userInfo?.name || '用户'} 👋
            </Text>
            <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>
              管理您的职业信用档案
            </Text>
          </View>
        </View>
      </View>

      {/* ── 主内容区 ── */}
      <View style={{ padding: '16px 16px 88px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ── 信用评分卡片 ── */}
        <View style={{
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          <View style={{ padding: '20px 20px 16px' }}>

            {/* 标签行 */}
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500', lineHeight: '1.5' }}>职业信用评分</Text>
              {levelInfo && (
                <View style={{ padding: '3px 10px', borderRadius: '20px', background: levelInfo.bg }}>
                  <Text style={{ fontSize: '12px', fontWeight: '600', color: levelInfo.color }}>{levelInfo.label}</Text>
                </View>
              )}
            </View>

            {/* 分数 + 按钮行 */}
            <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <Text style={{
                  fontSize: '64px', fontWeight: '800', lineHeight: '1',
                  color: creditScore ? '#0f172a' : '#e2e8f0',
                  letterSpacing: '-2px',
                }}>
                  {creditScore ? creditScore.score : '—'}
                </Text>
                {creditScore && (
                  <Text style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '6px', lineHeight: '1.5' }}>/ 940</Text>
                )}
              </View>

              <View
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '10px 16px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.38)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => Taro.switchTab({ url: '/pages/report/index' })}
              >
                  <Text style={{ color: '#fff', fontSize: '13px', fontWeight: '600', lineHeight: '1.5' }}>
                  {creditScore ? '查看报告' : '立即生成'}
                </Text>
                <ChevronRight size={14} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {!creditScore && (
              <Text style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', display: 'block', lineHeight: '1.6' }}>
                生成信用报告后将自动同步评分
              </Text>
            )}
          </View>

          {/* 展开 toggle */}
          {creditScore && (
            <View
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                padding: '10px 0',
                borderTop: '1px solid #f1f5f9',
                transition: 'background 0.2s ease',
              }}
              onClick={() => { setShowDetail(!showDetail); setDetailTab(0) }}
            >
              <Text style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500', lineHeight: '1.5' }}>
                {showDetail ? '收起详情' : '查看详情'}
              </Text>
              <ChevronRight
                size={13}
                color="#3b82f6"
                style={{ transform: showDetail ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
              />
            </View>
          )}

          {/* 展开内容 */}
          {showDetail && creditScore && (
            <View style={{ borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
              {/* Tab */}
              <View style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px 20px 8px' }}>
                {['评分明细', '雷达图'].map((tab, i) => (
                  <View
                    key={i}
                    style={{
                      padding: '5px 16px', borderRadius: '20px',
                      background: detailTab === i ? '#2563eb' : '#e2e8f0',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => setDetailTab(i)}
                  >
                    <Text style={{ fontSize: '12px', fontWeight: '500', color: detailTab === i ? '#fff' : '#64748b', lineHeight: '1.5' }}>{tab}</Text>
                  </View>
                ))}
              </View>

              <Swiper current={detailTab} onChange={e => setDetailTab(e.detail.current)} style={{ height: '248px' }}>
                <SwiperItem>
                  <View style={{ padding: '8px 20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {creditScore?.factors && Object.entries(creditScore.factors).filter(([key]) => key in FACTOR_LABELS).map(([key, val]) => (
                      <View key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                        <View style={{ width: '8px', height: '8px', borderRadius: '50%', background: FACTOR_COLORS[key] || '#3b82f6', flexShrink: 0 }} />
                        <Text style={{ fontSize: '13px', color: '#475569', width: '42px', lineHeight: '1.5' }}>{FACTOR_LABELS[key]}</Text>
                        <View style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <View style={{ height: '100%', borderRadius: '3px', background: FACTOR_COLORS[key] || '#3b82f6', width: `${val}%`, transition: 'width 0.6s ease' }} />
                        </View>
                        <Text style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', width: '26px', textAlign: 'right', lineHeight: '1.5' }}>{val}</Text>
                      </View>
                    ))}
                  </View>
                </SwiperItem>
                <SwiperItem>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {radarSvg && <Image src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(radarSvg)}`} style={{ width: '280px', height: '220px' }} mode="aspectFit" />}
                  </View>
                </SwiperItem>
              </Swiper>

              <View style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>更新时间：{new Date().toLocaleDateString('zh-CN')}</Text>
                <View
                  style={{ padding: '4px 12px', borderRadius: '20px', background: '#eff6ff' }}
                  onClick={() => setShowModel(true)}
                >
                  <Text style={{ fontSize: '11px', color: '#2563eb', fontWeight: '500', lineHeight: '1.5' }}>评分说明</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── 快捷功能 ── */}
        <View style={{
          background: '#fff', borderRadius: '20px',
          padding: '16px 8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
          display: 'flex', justifyContent: 'space-around',
        }}>
          {quickActions.map((item, i) => (
            <View
              key={i}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '4px 12px',
                transform: pressedAction === i ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
              onTouchStart={() => setPressedAction(i)}
              onTouchEnd={() => setPressedAction(null)}
              onTouchCancel={() => setPressedAction(null)}
              onClick={item.action}
            >
              <View style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${item.color}22`,
              }}>
                <item.icon size={24} color={item.color} />
              </View>
              <Text style={{ fontSize: '12px', fontWeight: '500', color: '#475569', lineHeight: '1.5' }}>{item.title}</Text>
            </View>
          ))}
        </View>

        {/* ── 核心功能列表 ── */}
        {menuItems.map((item, i) => (
          <View
            key={i}
            style={{
              background: '#fff', borderRadius: '20px',
              display: 'flex', alignItems: 'center',
              padding: '18px 16px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
              transform: pressedMenu === i ? 'scale(0.99)' : 'scale(1)',
              transition: 'all 0.2s ease',
            }}
            onTouchStart={() => setPressedMenu(i)}
            onTouchEnd={() => setPressedMenu(null)}
            onTouchCancel={() => setPressedMenu(null)}
            onClick={() => navigate(item.path)}
          >
            {/* 右侧彩色渐变细条 */}
            <View style={{
              position: 'absolute', right: 0, top: '14px', bottom: '14px',
              width: '3px', borderRadius: '3px 0 0 3px',
              background: `linear-gradient(to bottom, ${item.accent}, ${item.accent}55)`,
            }} />

            {/* 图标 */}
            <View style={{
              width: '46px', height: '46px', borderRadius: '14px',
              background: item.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: '14px', flexShrink: 0,
              boxShadow: `0 4px 12px ${item.color}20`,
            }}>
              <item.icon size={22} color={item.color} />
            </View>

            {/* 文字 */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>{item.title}</Text>
              <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>{item.desc}</Text>
            </View>

            {/* 箭头 */}
            <View style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ChevronRight size={15} color="#94a3b8" />
            </View>
          </View>
        ))}
      </View>

      {/* ── 评分说明弹窗 ── */}
      {showModel && (
        <View
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', flexDirection: 'column', zIndex: 200 }}
          onClick={() => setShowModel(false)}
        >
          <View
            style={{ background: '#fff', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '60px', borderRadius: '24px 24px 0 0' }}
            onClick={e => e.stopPropagation()}
          >
            <View style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #f1f5f9' }}>
              <Text style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>职业信用评分说明</Text>
              <View
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowModel(false)}
              >
                <Text style={{ color: '#64748b', fontSize: '18px', lineHeight: '1' }}>×</Text>
              </View>
            </View>

            <View style={{ flex: 1, overflowY: 'auto' }}>
              <View style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {SCORE_DIMENSIONS.map((item, idx) => (
                  <View
                    key={item.num}
                    style={{
                      padding: '14px 16px',
                      background: '#fafbfc',
                      borderRadius: '14px',
                      marginBottom: '6px',
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <View style={{ width: '20px', height: '20px', borderRadius: '6px', background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Text style={{ color: '#fff', fontSize: '11px', fontWeight: '700', lineHeight: '1' }}>{item.num}</Text>
                      </View>
                      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', lineHeight: '1.5' }}>{item.name}</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', lineHeight: '1.6', marginBottom: '4px' }}>{item.desc}</Text>
                    <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', lineHeight: '1.5' }}>数据来源：{item.source}</Text>
                  </View>
                ))}
                <View style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '12px', marginTop: '4px' }}>
                  <Text style={{ fontSize: '12px', color: '#2563eb', lineHeight: '1.6' }}>评分范围约 350–940 分，结果仅供参考，不作为任何法律依据。</Text>
                </View>
              </View>
            </View>

            <View style={{ padding: '16px 20px 32px', flexShrink: 0, borderTop: '1px solid #f1f5f9' }}>
              <View
                style={{
                  borderRadius: '16px', padding: '14px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setShowModel(false)}
              >
                <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '600', lineHeight: '1.5' }}>我知道了</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default IndexPage
