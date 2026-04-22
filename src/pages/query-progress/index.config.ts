export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '查询进度' })
  : { navigationBarTitleText: '查询进度' }
