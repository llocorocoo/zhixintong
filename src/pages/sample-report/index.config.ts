export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '样例报告',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '样例报告',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
