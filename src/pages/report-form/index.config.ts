export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '填写报告信息',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '填写报告信息',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
