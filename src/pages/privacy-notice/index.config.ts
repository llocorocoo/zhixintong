export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '隐私声明' })
  : { navigationBarTitleText: '隐私声明' }
