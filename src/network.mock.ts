/**
 * Mock 网络层 - 用于无后端的静态演示
 * 替换 network.ts 后可独立运行，无需启动后端服务
 *
 * 演示状态存储在 localStorage，页面刷新后保持
 * 演示账号：手机号随意，密码随意
 */

import Taro from '@tarojs/taro'

// ── 演示数据 ──────────────────────────────────────────────────────────────

const DEMO_USER = {
  id: 'demo-user-001',
  name: '张三',
  phone: '13800000000',
}

const DEMO_CREDIT_SCORE = {
  score: 650,
  level: 'good',
  factors: {
    authenticity: 80,
    stability: 75,
    compliance: 70,
    safety: 100,
    professionalism: 60,
    reliability: 65,
  },
}

const DEMO_REPORT = {
  id: 'report-demo-001',
  report_no: 'CR20260403001',
  status: 'completed',
  report_url: 'https://example.com/reports/demo.pdf',
  identity_info: { realName: '张三', idCard: '330102199001011234' },
  education_info: { education: '本科', school: '某某大学', major: '计算机科学与技术' },
  expires_at: '2027-04-03T00:00:00.000Z',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEMO_RESUME = {
  name: '张三',
  gender: '男',
  age: '28',
  phone: '138****8888',
  email: 'zhangsan@example.com',
  workRecords: [
    {
      id: 'w1',
      company: '某科技有限公司',
      position: '产品经理',
      startDate: '2022-03',
      endDate: '',
      description: '负责产品规划与迭代，主导多个核心功能从0到1落地',
      isVerified: true,
    },
    {
      id: 'w2',
      company: '某互联网公司',
      position: '产品专员',
      startDate: '2020-06',
      endDate: '2022-02',
      description: '参与产品需求分析与原型设计',
      isVerified: false,
    },
  ],
  skills: [
    { id: 's1', name: '产品设计', level: '熟练', isVerified: true },
    { id: 's2', name: '数据分析', level: '熟练', isVerified: false },
    { id: 's3', name: 'Axure / Figma', level: '熟练', isVerified: false },
  ],
  certifications: [
    { id: 'c1', name: 'PMP 项目管理专业人士', issuer: 'PMI', date: '2023-06', isVerified: true },
    { id: 'c2', name: '产品经理认证 NPDP', issuer: 'PDMA', date: '2022-09', isVerified: false },
  ],
  education: [
    {
      id: 'e1',
      school: '某某大学',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2016-09',
      endDate: '2020-06',
      isVerified: true,
    },
  ],
  languages: [
    { id: 'l1', name: '英语', level: 'CET-6', isVerified: false },
  ],
  projects: [
    {
      id: 'p1',
      name: '某 APP 产品重构项目',
      role: '产品负责人',
      description: '主导 App 全面重构，DAU 提升 30%',
      isVerified: false,
    },
  ],
  other: [],
}

// ── 状态持久化（localStorage） ────────────────────────────────────────────

function getState() {
  try {
    const raw = Taro.getStorageSync('__mock_state__')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function setState(patch: Record<string, any>) {
  try {
    const current = getState()
    Taro.setStorageSync('__mock_state__', JSON.stringify({ ...current, ...patch }))
  } catch {}
}

// ── Mock 请求路由 ──────────────────────────────────────────────────────────

function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function ok(data: any) {
  return { data: { code: 200, data, message: 'success' } }
}

function fail(message: string, code = 400) {
  return { data: { code, data: null, message } }
}

async function mockRequest(url: string, data: any): Promise<any> {
  await delay()
  const state = getState()

  // ── 注册 ──
  if (url.includes('/auth/register')) {
    const phone = data?.phone || '13800000000'
    setState({ registered: true, phone })
    return ok({ message: '注册成功' })
  }

  // ── 登录 ──
  if (url.includes('/auth/login')) {
    const user = { ...DEMO_USER, phone: data?.phone || DEMO_USER.phone }
    const name = data?.phone?.slice(-4)
      ? `用户${data.phone.slice(-4)}`
      : DEMO_USER.name
    setState({ loggedIn: true, userId: DEMO_USER.id, userName: name })
    return ok({ user: { ...user, name }, token: 'mock-token-demo' })
  }

  // ── 退出登录 ──
  if (url.includes('/auth/logout')) {
    setState({ loggedIn: false, reportGenerated: false, resumeSynced: false })
    return ok({ message: '已退出' })
  }

  // ── 信用评分 ──
  if (url.includes('/credit/score')) {
    if (!state.reportGenerated) {
      return fail('暂无信用评分', 404)
    }
    return ok(DEMO_CREDIT_SCORE)
  }

  // ── 创建报告 ──
  if (url.includes('/report/create')) {
    return ok({ reportId: DEMO_REPORT.id, reportNo: DEMO_REPORT.report_no })
  }

  // ── 提交报告（触发生成）──
  if (url.includes('/report/submit')) {
    await delay(1500)
    setState({ reportGenerated: true })
    return ok({ reportId: DEMO_REPORT.id, status: 'processing' })
  }

  // ── 报告列表 ──
  if (url.includes('/report/list')) {
    if (!state.reportGenerated) return ok([])
    return ok([DEMO_REPORT])
  }

  // ── 报告详情 ──
  if (url.includes('/report/step')) {
    return ok({ stepId: data?.stepId, status: 'completed' })
  }

  if (url.match(/\/report\/[^/]+$/)) {
    if (!state.reportGenerated) return fail('报告不存在', 404)
    return ok(DEMO_REPORT)
  }

  // ── 获取最新报告 ──
  if (url.includes('/report')) {
    if (!state.reportGenerated) return fail('暂无报告', 404)
    return ok(DEMO_REPORT)
  }

  // ── 可信简历 ──
  if (url.includes('/resume/sync')) {
    setState({ resumeSynced: true })
    return ok(DEMO_RESUME)
  }

  if (url.includes('/resume/basic') || url.includes('/resume/workRecords') ||
      url.includes('/resume/education') || url.includes('/resume/skills') ||
      url.includes('/resume/certifications') || url.includes('/resume/projects') ||
      url.includes('/resume/languages') || url.includes('/resume/other')) {
    return ok({})
  }

  if (url.includes('/resume')) {
    if (!state.resumeSynced && !state.reportGenerated) return ok(null)
    if (!state.resumeSynced) return ok(null)
    return ok(DEMO_RESUME)
  }

  // ── 增信建议 ──
  if (url.includes('/enhancement/work-history')) {
    return ok([])
  }
  if (url.includes('/enhancement/certificates')) {
    return ok([])
  }
  if (url.includes('/enhancement/create')) {
    return ok({ id: 'enh-001', status: 'pending' })
  }
  if (url.includes('/enhancement')) {
    return ok([])
  }

  // ── 文件上传 ──
  if (url.includes('/upload')) {
    return ok({ url: 'https://example.com/uploads/demo.jpg', filename: 'demo.jpg' })
  }

  // 未匹配的接口
  console.warn('[Mock] Unhandled URL:', url)
  return ok(null)
}

// ── 导出与 network.ts 相同的接口 ─────────────────────────────────────────

export namespace Network {
  export const request = async (option: any): Promise<any> => {
    console.log('[Mock] Request:', option.url, option.data)
    try {
      const result = await mockRequest(option.url, option.data)
      console.log('[Mock] Response:', option.url, result.data)
      return result
    } catch (e) {
      console.error('[Mock] Error:', e)
      return { data: { code: 500, data: null, message: '请求失败' } }
    }
  }

  export const uploadFile = async (option: any): Promise<any> => {
    await delay(800)
    return {
      data: JSON.stringify({ code: 200, data: { url: 'https://example.com/uploads/demo.jpg' }, message: 'success' })
    }
  }

  export const downloadFile = async (option: any): Promise<any> => {
    await delay()
    return { tempFilePath: '' }
  }
}
