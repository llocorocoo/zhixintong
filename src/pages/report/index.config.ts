export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '职业信用报告',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '职业信用报告',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
