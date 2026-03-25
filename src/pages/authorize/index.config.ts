export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '信息核查授权',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '信息核查授权',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
