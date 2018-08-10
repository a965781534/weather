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
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
Page({
  data: {
    'nowTemp': '',
    'nowWeather': '',
    'nowWeatherBg': '',
    'hourlyWeather': [],
    'todayDate': '',
    'todayTemp': ''
  },
  onPullDownRefresh(){
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
    this.qqmapsdk = new QQMapWX({
      key: '42TBZ-GTPW6-NHFS7-MOD2F-MDZFJ-HNBPP'
    })
    this.getNow()
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '广州市'
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
      todayDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + ' 今天'
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },
  onTapLocation(){
    wx.getLocation({
      success: res => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            console.log(222)
            var city = res.result.address_component.city 
            console.log(city)
            console.log(111)
          }
        })
      },
    })
  }

})
