export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '资料管理' })
  : { navigationBarTitleText: '资料管理' }
