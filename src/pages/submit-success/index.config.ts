export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '信息已提交' })
  : { navigationBarTitleText: '信息已提交' }
