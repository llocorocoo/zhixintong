export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/report/index',
    'pages/sample-report/index',
    'pages/authorize/index',
    'pages/report-form/index',
    'pages/submit-success/index',
    'pages/query-progress/index',
    'pages/resume/index',
    'pages/resume-edit/index',
    'pages/enhancement/index',
    'pages/work-history/index',
    'pages/credit-repair/index',
    'pages/profile-edit/index',
    'pages/privacy/index',
    'pages/privacy-notice/index',
    'pages/account-settings/index',
    'pages/help-center/index',
    'pages/payment/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '职业信用管理',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#1e40af',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/report/index',
        text: '信用报告',
        iconPath: './assets/tabbar/file-text.png',
        selectedIconPath: './assets/tabbar/file-text-active.png'
      },
      {
        pagePath: 'pages/resume/index',
        text: '可信简历',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user-circle.png',
        selectedIconPath: './assets/tabbar/user-circle-active.png'
      }
    ]
  }
})
