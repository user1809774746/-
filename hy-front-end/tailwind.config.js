/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
       colors: {
        // 马卡龙色系
         // 简化版单色定义（如果你不需要完整的色阶）
          lightPink: '#FFE4EC',
          lightBlue: '#E1F0FF',
          lightGreen: '#E6FFED',
          lightYellow: '#FFFBE6',
          lightPurple: '#F0E6FF',
          lightOrange: '#E6FFF5',
          lightMint: '#C7F0DB',
          lightLavender: '#E6E6FA',
          //古风颜色
          GuText:'#724B10',
          GuGreen:'#5CA39D',
          GuJing:'#DC873A',
          GuRed:'#AE5050',
          GuGreen2:'#A9A786',
          GuPurple:'#615EAA',
          GuBlue:'#7FA0AF',
          // 登录页专用颜色
          loginPrimary: '#A878C',
          loginSecondary: '#F3E5E1',
        macaron: {
          // 粉色系
          pink: {
            50: '#FFF0F5',
            100: '#FFE4EC',
            200: '#FFC2D6',
            300: '#FFA8C5',
            400: '#FF8BB5',
            500: '#FF6BA7', // 主粉色
            600: '#E55A95',
            700: '#CC4A83',
            800: '#B33A72',
            900: '#992B61',
          },
          // 蓝色系
          blue: {
            50: '#F0F8FF',
            100: '#E1F0FF',
            200: '#C2E0FF',
            300: '#99CCFF',
            400: '#66B3FF',
            500: '#3399FF', // 主蓝色
            600: '#2D87E0',
            700: '#2675C2',
            800: '#2063A3',
            900: '#195185',
          },
          // 绿色系
          green: {
            50: '#F0FFF4',
            100: '#E6FFED',
            200: '#C2FFD1',
            300: '#99FFB3',
            400: '#66FF8C',
            500: '#33FF66', // 主绿色
            600: '#2DE05A',
            700: '#26C24D',
            800: '#20A341',
            900: '#198534',
          },
          // 黄色系
          yellow: {
            50: '#FFFDF0',
            100: '#FFFBE6',
            200: '#FFF7C2',
            300: '#FFF399',
            400: '#FFEE66',
            500: '#FFE833', // 主黄色
            600: '#E0CC2D',
            700: '#C2B026',
            800: '#A39420',
            900: '#857819',
          },
          // 紫色系
          purple: {
            50: '#F8F0FF',
            100: '#F0E6FF',
            200: '#E0C2FF',
            300: '#CC99FF',
            400: '#B366FF',
            500: '#9933FF', // 主紫色
            600: '#872DE0',
            700: '#7526C2',
            800: '#6320A3',
            900: '#511985',
          },
          // 橙色系
          orange: {
            50: '#FFF8F0',
            100: '#FFF1E6',
            200: '#FFE0C2',
            300: '#FFCC99',
            400: '#FFB366',
            500: '#FF9933', // 主橙色
            600: '#E0872D',
            700: '#C27526',
            800: '#A36320',
            900: '#855119',
          },
          // 薄荷绿
          mint: {
            50: '#F0FFFA',
            100: '#E6FFF5',
            200: '#C2FFE8',
            300: '#99FFD9',
            400: '#66FFC2',
            500: '#33FFAA', // 主薄荷绿
            600: '#2DE095',
            700: '#26C27F',
            800: '#20A36A',
            900: '#198554',
          },
        }
      },
    },
  },
  plugins: [],
}
