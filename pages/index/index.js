const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBg: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '广州市',
    locationAuthType: UNPROMPTED
  },
  onLoad(){
    this.qqmapsdk = new QQMapWX({
      key: '42TBZ-GTPW6-NHFS7-MOD2F-MDZFJ-HNBPP'
    })
    wx.getSetting({
      success: res => {
        var auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if(auth)
          this.getCityAndWeather()
        else
          this.getNow()
      }
    })
    this.getNow()
  },
  onPullDownRefresh(){
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        var result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      }, 
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow(result){
    var temp = result.now.temp
    var weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: weatherColorMap[weather]
    })
  },
  setHourlyWeather(result){
    var forecast = result.forecast
    var nowHour = new Date().getHours()
    var hourlyWeather = []
    for (var i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  setToday(result){
    var date = new Date()
    this.setData({
      todayTemp: result.today.minTemp + '° - ' + result.today.maxTemp + '°',
      todayDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' 今天'
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success: res => {
          var auth = res.authSetting['scope.userLocation']
          if(auth) {
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },
  getCityAndWeather(){
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            var city = res.result.address_component.city
            this.setData({
              city: city,
              locationTipsText: ''
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  } 
    
})
