export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '个人可信简历',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '个人可信简历',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    }
