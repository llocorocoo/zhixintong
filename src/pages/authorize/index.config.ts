export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '',
      navigationBarBackgroundColor: '#1e40af',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '',
      navigationBarBackgroundColor: '#1e40af',
      navigationBarTextStyle: 'white'
    }
