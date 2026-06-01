export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '学历认证' })
  : { navigationBarTitleText: '学历认证' }
