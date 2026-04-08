export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '编辑个人资料' })
  : { navigationBarTitleText: '编辑个人资料' }
