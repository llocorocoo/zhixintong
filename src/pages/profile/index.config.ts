export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '我的',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '我的',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
