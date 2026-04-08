export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '账户设置' })
  : { navigationBarTitleText: '账户设置' }
