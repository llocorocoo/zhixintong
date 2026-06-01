export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '工作履历' })
  : { navigationBarTitleText: '工作履历' }
