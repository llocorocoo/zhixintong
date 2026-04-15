import { View, Text } from '@tarojs/components'
import { FC, useState, useEffect, useCallback } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { Network } from '@/network'
import { useUserStore } from '@/stores/user'
import {
  FileText, Download, Share, CircleCheck, CircleAlert,
  Clock, RefreshCw, Eye, FileSearch, ArrowRight, RotateCcw, ChevronRight
} from 'lucide-react-taro'

interface ReportData {
  id: string
  reportNo: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  reportUrl?: string
  identityInfo?: any
  educationInfo?: any
  qualificationInfo?: any
  createdAt: string
}

const ReportPage: FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [pressedBtn, setPressedBtn] = useState<string | null>(null)
  const { isLoggedIn, userInfo } = useUserStore()

  const fetchLatestReport = useCallback(async () => {
    if (!userInfo?.id) return
    try {
      const res = await Network.request({ url: '/api/report/latest', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200 && res.data.data) setReportData(res.data.data)
    } catch {}
  }, [userInfo?.id])

  useEffect(() => {
    if (!isLoggedIn) { Taro.redirectTo({ url: '/pages/login/index' }); return }
    fetchLatestReport()
  }, [isLoggedIn, fetchLatestReport])

  useDidShow(() => { if (isLoggedIn) fetchLatestReport() })

  const handleCreateReport = () => Taro.navigateTo({ url: '/pages/payment/index?price=50&type=create' })
  const handleUpdateReport = () => Taro.navigateTo({ url: '/pages/payment/index?price=9.9&type=update' })

  const handleDownload = async () => {
    if (!reportData?.reportUrl) return
    Taro.showLoading({ title: '下载中...' })
    try {
      const res = await Network.downloadFile({ url: reportData.reportUrl })
      Taro.hideLoading()
      await Taro.saveFile({ tempFilePath: res.tempFilePath })
      Taro.showToast({ title: '保存成功', icon: 'success' })
    } catch { Taro.hideLoading(); Taro.showToast({ title: '下载失败', icon: 'none' }) }
  }

  const handleShare = () => {
    if (reportData?.reportUrl) Taro.showShareMenu({ withShareTicket: true })
  }

  const handlePreview = () => {
    if (!reportData?.reportUrl) return
    Taro.openDocument({ filePath: reportData.reportUrl, fileType: 'pdf', fail: () => Taro.showToast({ title: '预览失败', icon: 'none' }) })
  }

  const handleSyncToResume = async () => {
    if (!userInfo?.id) return
    setSyncing(true)
    try {
      const res = await Network.request({ url: '/api/resume/sync', method: 'POST', data: { userId: userInfo.id } })
      if (res.data.code === 200) {
        Taro.showToast({ title: '同步成功', icon: 'success' })
        setTimeout(() => Taro.switchTab({ url: '/pages/resume/index' }), 1000)
      }
    } catch {} finally { setSyncing(false) }
  }

  const verificationSteps = [
    { id: 'identity',      title: '身份信息核实', done: !!reportData?.identityInfo },
    { id: 'education',     title: '学历信息核实', done: !!reportData?.educationInfo },
    { id: 'qualification', title: '职业资格核实', done: !!reportData?.qualificationInfo },
  ]

  const btn = (id: string) => ({
    transform: pressedBtn === id ? 'scale(0.97)' : 'scale(1)',
    transition: 'all 0.2s ease',
  })

  const press = (id: string) => setPressedBtn(id)
  const release = () => setPressedBtn(null)

  return (
    <View style={{ background: '#f6f8fc', minHeight: '100vh' }}>

      {/* ── 蓝色渐变头部 ── */}
      <View style={{
        background: 'linear-gradient(135deg, #0f2460 0%, #1e40af 50%, #2563eb 100%)',
        padding: '48px 20px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* 装饰光晕 */}
        <View style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Text style={{ fontSize: '22px', fontWeight: '800', color: '#fff', display: 'block', lineHeight: '1.3', letterSpacing: '0.5px' }}>职业信用报告</Text>
        <Text style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', display: 'block', marginTop: '4px', lineHeight: '1.5' }}>记录您的职业信用，成为职场通行证</Text>
      </View>

      {/* ── 主内容（上移覆盖头部底部） ── */}
      <View style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ══ 空状态 ══ */}
        {!reportData && (
          <View style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)' }}>
            {/* 插画区 */}
            <View style={{ padding: '36px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <View style={{
                width: '88px', height: '88px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
              }}>
                <FileSearch size={40} color="#fff" />
              </View>
              <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.4', marginBottom: '8px' }}>暂无信用报告</Text>
              <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', lineHeight: '1.7', textAlign: 'center' }}>
                生成报告后获得完整职业信用评估，可用于求职、背调等场景
              </Text>
            </View>

            {/* 用途卡片 */}
            <View style={{ display: 'flex', gap: '8px', padding: '0 20px 20px' }}>
              {[
                { icon: '🎯', text: '求职应聘' },
                { icon: '🔍', text: '背景调查' },
                { icon: '📋', text: '职业档案' },
              ].map((item, i) => (
                <View key={i} style={{ flex: 1, background: '#f8fafc', borderRadius: '14px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <Text style={{ fontSize: '20px', lineHeight: '1' }}>{item.icon}</Text>
                  <Text style={{ fontSize: '11px', color: '#64748b', fontWeight: '500', lineHeight: '1.5' }}>{item.text}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <View style={{ padding: '0 20px 24px' }}>
              <View
                style={{
                  ...btn('create'),
                  borderRadius: '16px', padding: '15px 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                  boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
                }}
                onTouchStart={() => press('create')}
                onTouchEnd={release} onTouchCancel={release}
                onClick={handleCreateReport}
              >
                <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>立即生成信用报告</Text>
                <View style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '20px', padding: '2px 8px' }}>
                  <Text style={{ color: '#fde68a', fontSize: '12px', fontWeight: '700', lineHeight: '1.5' }}>¥50</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ══ 报告状态卡片 ══ */}
        {reportData && (
          <View style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)' }}>

            {/* 报告头信息 */}
            <View style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <View style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="#2563eb" />
                </View>
                <View>
                  <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>职业信用报告</Text>
                  <Text style={{ fontSize: '11px', color: '#94a3b8', display: 'block', lineHeight: '1.5' }}>{reportData.reportNo}</Text>
                </View>
              </View>
              <View style={{
                padding: '4px 12px', borderRadius: '20px',
                background: reportData.status === 'completed' ? 'rgba(5,150,105,0.1)' : reportData.status === 'processing' ? 'rgba(37,99,235,0.1)' : 'rgba(220,38,38,0.1)',
              }}>
                <Text style={{
                  fontSize: '12px', fontWeight: '600', lineHeight: '1.5',
                  color: reportData.status === 'completed' ? '#059669' : reportData.status === 'processing' ? '#2563eb' : '#dc2626',
                }}>
                  {reportData.status === 'completed' ? '已完成' : reportData.status === 'processing' ? '核查中' : '生成失败'}
                </Text>
              </View>
            </View>

            {/* ─ 核查中 ─ */}
            {reportData.status === 'processing' && (
              <View style={{ padding: '20px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <Text style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>核查进度</Text>
                  <Text style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', lineHeight: '1.5' }}>核查中...</Text>
                </View>
                {/* 进度条 */}
                <View style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', marginBottom: '20px', overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: '50%', borderRadius: '3px', background: 'linear-gradient(90deg, #1e40af, #3b82f6)', transition: 'width 0.6s ease' }} />
                </View>
                {/* 时间轴步骤 */}
                <View style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {verificationSteps.map((step, i) => (
                    <View key={step.id} style={{ display: 'flex', gap: '12px' }}>
                      {/* 左侧轴 */}
                      <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                        <View style={{ width: '20px', height: '20px', borderRadius: '50%', background: step.done ? '#059669' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {step.done
                            ? <CircleCheck size={14} color="#fff" />
                            : <Clock size={12} color="#94a3b8" />}
                        </View>
                        {i < verificationSteps.length - 1 && (
                          <View style={{ width: '2px', flex: 1, minHeight: '20px', background: step.done ? '#059669' : '#e2e8f0', margin: '2px 0' }} />
                        )}
                      </View>
                      {/* 内容 */}
                      <View style={{ paddingBottom: i < verificationSteps.length - 1 ? '16px' : '0', paddingTop: '1px' }}>
                        <Text style={{ fontSize: '13px', color: step.done ? '#0f172a' : '#94a3b8', fontWeight: step.done ? '600' : '400', lineHeight: '1.5' }}>{step.title}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={{ marginTop: '16px', background: '#eff6ff', borderRadius: '12px', padding: '12px 14px' }}>
                  <Text style={{ fontSize: '12px', color: '#2563eb', lineHeight: '1.7' }}>预计 1-3 个工作日完成核查，届时将通知您查看报告。</Text>
                </View>
              </View>
            )}

            {/* ─ 已完成 ─ */}
            {reportData.status === 'completed' && (
              <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 成功横幅 */}
                <View style={{ background: 'rgba(5,150,105,0.08)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '3px solid #059669' }}>
                  <CircleCheck size={20} color="#059669" />
                  <View>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#064e3b', display: 'block', lineHeight: '1.4' }}>报告已生成</Text>
                    <Text style={{ fontSize: '12px', color: '#6ee7b7', display: 'block', lineHeight: '1.5', color: '#059669', opacity: 0.8 }}>可预览、下载或分享您的信用报告</Text>
                  </View>
                </View>

                {/* 主 CTA：预览 */}
                <View
                  style={{ ...btn('preview'), borderRadius: '16px', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}
                  onTouchStart={() => press('preview')} onTouchEnd={release} onTouchCancel={release}
                  onClick={handlePreview}
                >
                  <Eye size={17} color="#fff" />
                  <Text style={{ color: '#fff', fontSize: '15px', fontWeight: '700', lineHeight: '1.5' }}>预览报告</Text>
                </View>

                {/* 下载 + 分享 */}
                <View style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { id: 'download', icon: Download, label: '下载', onClick: handleDownload },
                    { id: 'share',    icon: Share,    label: '分享', onClick: handleShare },
                  ].map(item => (
                    <View
                      key={item.id}
                      style={{ ...btn(item.id), flex: 1, borderRadius: '14px', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                      onTouchStart={() => press(item.id)} onTouchEnd={release} onTouchCancel={release}
                      onClick={item.onClick}
                    >
                      <item.icon size={16} color="#2563eb" />
                      <Text style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', lineHeight: '1.5' }}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                {/* 更新报告 */}
                <View
                  style={{ ...btn('update'), background: '#fffbeb', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center' }}
                  onTouchStart={() => press('update')} onTouchEnd={release} onTouchCancel={release}
                  onClick={handleUpdateReport}
                >
                  <RotateCcw size={18} color="#d97706" />
                  <Text style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#0f172a', marginLeft: '10px', lineHeight: '1.5' }}>更新信用报告</Text>
                  <View style={{ background: '#fde68a', borderRadius: '20px', padding: '2px 10px', marginRight: '6px' }}>
                    <Text style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', lineHeight: '1.5' }}>¥9.9</Text>
                  </View>
                  <ChevronRight size={16} color="#d97706" />
                </View>

                {/* 同步简历 */}
                <View
                  style={{ ...btn('sync'), background: 'rgba(5,150,105,0.07)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center' }}
                  onTouchStart={() => press('sync')} onTouchEnd={release} onTouchCancel={release}
                  onClick={handleSyncToResume}
                >
                  <RefreshCw size={18} color="#059669" />
                  <Text style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#0f172a', marginLeft: '10px', lineHeight: '1.5' }}>{syncing ? '同步中...' : '更新可信简历'}</Text>
                  <View style={{ background: 'rgba(5,150,105,0.15)', borderRadius: '20px', padding: '2px 10px', marginRight: '6px' }}>
                    <Text style={{ fontSize: '12px', fontWeight: '600', color: '#059669', lineHeight: '1.5' }}>免费</Text>
                  </View>
                  <ChevronRight size={16} color="#059669" />
                </View>
              </View>
            )}

            {/* ─ 失败 ─ */}
            {reportData.status === 'failed' && (
              <View style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <View style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CircleAlert size={34} color="#dc2626" />
                </View>
                <Text style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px', lineHeight: '1.4' }}>报告生成失败</Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.6', textAlign: 'center' }}>请重新提交信息或联系客服</Text>
                <View
                  style={{ ...btn('retry'), borderRadius: '14px', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #1e40af, #2563eb)', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}
                  onTouchStart={() => press('retry')} onTouchEnd={release} onTouchCancel={release}
                  onClick={handleCreateReport}
                >
                  <Text style={{ color: '#fff', fontSize: '14px', fontWeight: '700', lineHeight: '1.5' }}>重新生成</Text>
                  <View style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '1px 8px' }}>
                    <Text style={{ color: '#fde68a', fontSize: '12px', fontWeight: '700', lineHeight: '1.5' }}>¥50</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
        {/* ── 样例报告入口 ── */}
        <View
          style={{ ...btn('sample'), background: '#fff', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
          onTouchStart={() => press('sample')} onTouchEnd={release} onTouchCancel={release}
          onClick={() => Taro.navigateTo({ url: '/pages/sample-report/index' })}
        >
          <View style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '14px', flexShrink: 0 }}>
            <Eye size={20} color="#7c3aed" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', display: 'block', lineHeight: '1.4' }}>查看样例报告</Text>
            <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginTop: '2px', lineHeight: '1.5' }}>了解报告包含哪些内容</Text>
          </View>
          <ChevronRight size={16} color="#94a3b8" />
        </View>
      </View>
    </View>
  )
}

export default ReportPage
