import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

const SplashScreen = ({ onEnter }) => {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // 3秒后自动进入
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnter()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleEnter = () => {
    setIsVisible(false)
    setTimeout(() => {
      onEnter()
    }, 500) // 等待淡出动画完成
  }

  // 处理触摸滑动
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const handleTouchEnd = () => {
    // 向上滑动超过50px
    if (touchStart - touchEnd > 50) {
      handleEnter()
    }
  }

  // 处理鼠标滚轮
  const handleWheel = (e) => {
    if (e.deltaY < -30) { // 向上滚动
      handleEnter()
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[10000] transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        backgroundImage: `url('/启动页面.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black bg-opacity-0" />

      {/* 内容区域 */}
      <div className="relative h-full flex flex-col items-center justify-center">
        {/* 标题文字 */}
        <div className="text-center mb-12">
          {/* <h1 
            className="text-white text-6xl mb-4 tracking-widest"
            style={{ 
              fontFamily: 'SimSun, STSong, serif',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
            }}
          >
            好游
          </h1> */}
          <p 
            className="text-white text-3xl tracking-wider"
            style={{ 
              fontFamily: 'SimSun, STSong, serif',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
            }}
          >
           好游，好旅游
          </p>
        </div>

        {/* 向上滑动提示 - 仿照图片样式 */}
        <div className="absolute bottom-24 flex flex-col items-center">
          {/* 白色渐变半透明矩形框 */}
          <div 
            className="relative px-6 py-10 pb-13 backdrop-blur-sm"
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255,0.1 ),rgba(255, 255, 255,0.6 ),rgba(255, 255, 255, 0.9))',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* 两个叠加的箭头 */}
            <div className="flex flex-col items-center">
              <ChevronUp className="text-white w-12 h-12 -mb-6" strokeWidth={3} />
              <ChevronUp className="text-white w-12 h-12 mb-2" strokeWidth={3} />
            </div>
          </div>
          
          {/* 白色圆形 GO 按钮 - 覆盖在矩形下部 */}
          <button
            onClick={handleEnter}
            className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-300 -mt-12 relative z-10"
          >
            <span className="text-black text-2xl font-bold tracking-wider">GO</span>
          </button>
        </div>
      </div>

      {/* 点击区域（备用） */}
      {/* <button
        onClick={handleEnter}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                   bg-white bg-opacity-20 backdrop-blur-sm
                   text-white px-8 py-3 rounded-full
                   border-2 border-white border-opacity-50
                   hover:bg-opacity-30 transition-all duration-300
                   text-sm tracking-wider"
        style={{ fontFamily: 'SimSun, STSong, serif' }}
      >
        立即进入
      </button> */}
    </div>
  )
}

export default SplashScreen
