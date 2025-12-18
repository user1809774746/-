import React, { useState } from 'react'
import { streamGenerateTravelogue, getCurrentUserId } from '../api/config'

export default function PostCitySelectPage({ onBack, onCitySelected, onNavigateToEditor, onSkip }) {
  const [selectedProvince, setSelectedProvince] = useState('北京')
  const [selectedCity, setSelectedCity] = useState('')
  const [generating, setGenerating] = useState(false)

  const handleProvinceClick = (province) => {
    setSelectedProvince(province)
  }

  const handleCityClick = async (city) => {
    if (generating) return
    console.log('✅ 发帖选择城市:', city)
    setSelectedCity(city)

    if (onCitySelected) {
      onCitySelected(city)
    }

    if (!onNavigateToEditor) {
      return
    }

    try {
      setGenerating(true)
      const userId = await getCurrentUserId()
      const result = await streamGenerateTravelogue({
        userId,
        destination: city
      })

      const prefill = {
        title: (result && result.title) || '',
        summary: (result && result.summary) || '',
        content: (result && result.content) || '',
        destinationName: city,
        destinationCity: city
      }

      onNavigateToEditor(prefill)
    } catch (e) {
      console.error('生成游记失败:', e)
      alert(`生成游记失败：${(e && e.message) || '未知错误'}`)
      onNavigateToEditor({
        title: '',
        summary: '',
        content: '',
        destinationName: city,
        destinationCity: city
      })
    } finally {
      setGenerating(false)
    }
  }

  const provinceCityData = {
    '北京': ['北京市'],
    '天津': ['天津市'],
    '河北': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
    '山西': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
    '内蒙古': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
    '辽宁': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
    '吉林': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
    '黑龙江': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
    '上海': ['上海市'],
    '江苏': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
    '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
    '安徽': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
    '福建': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
    '江西': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
    '山东': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
    '河南': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
    '湖北': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市', '神农架林区'],
    '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
    '广东': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '韶关市', '湛江市', '肇庆市', '江门市', '茂名市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
    '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
    '海南': ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市', '东方市', '定安县', '屯昌县', '澄迈县', '临高县', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
    '重庆': ['重庆市', '万州区', '黔江区', '涪陵区', '渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '长寿区', '江津区', '合川区', '永川区', '南川区', '綦江区', '大足区', '璧山区', '铜梁区', '潼南区', '荣昌区', '开州区', '梁平区', '武隆区', '城口县', '丰都县', '垫江县', '忠县', '云阳县', '奉节县', '巫山县', '巫溪县', '石柱土家族自治县', '秀山土家族苗族自治县', '酉阳土家族苗族自治县', '彭水苗族土家族自治县'],
    '四川': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
    '贵州': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
    '云南': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
    '西藏': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
    '陕西': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
    '甘肃': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
    '青海': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
    '宁夏': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
    '新疆': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子市', '阿拉尔市', '图木舒克市', '五家渠市', '北屯市', '铁门关市', '双河市', '可克达拉市', '昆玉市', '胡杨河市', '新星市'],
  }

  const provinces = Object.keys(provinceCityData)
  const cities = provinceCityData[selectedProvince] || []

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="mr-3">
            <i className="text-xl text-gray-600 fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800">选择城市</h1>
          <h2
            className='absolute right-4 text-sm text-gray-600 cursor-pointer'
            onClick={() => {
              if (onSkip) {
                onSkip()
              }
            }}
          >
            跳过
          </h2>
        </div>
      </div>

      <div className="w-full h-full fixed flex items-end">
        <div
          className="absolute inset-0"
          onClick={onBack}
        ></div>

        <div className="relative bg-white w-full rounded-t-2xl shadow-lg h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">选择城市</h3>
          </div>

          <div className="flex flex-row flex-1 overflow-hidden">
            <div className="w-[40%] border-r border-gray-200 overflow-y-auto">
              <div className="px-3 py-2 bg-gray-50">
                <span className="text-xs text-gray-500 font-semibold">省份</span>
              </div>
              {provinces.map((province) => (
                <div
                  key={province}
                  onClick={() => handleProvinceClick(province)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    selectedProvince === province
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{province}</span>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-3 py-2 bg-gray-50">
                <span className="text-xs text-gray-500 font-semibold">城市</span>
              </div>
              {cities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleCityClick(city)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <span className="text-sm text-gray-700">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
