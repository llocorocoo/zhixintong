export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '信息核查授权',
      navigationBarBackgroundColor: '#1e40af',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '信息核查授权',
      navigationBarBackgroundColor: '#1e40af',
      navigationBarTextStyle: 'white'
    }
