import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import './index.scss'
import Worktime from '../worktime'
import Worker from '../worker'
import Site from '../site'

import {AtTabBar} from 'taro-ui'


export default () => {

  const [current, setCurrent] = useState(0)

  const renderContent = () => {
    if (current === 0) {
      return <Worktime/>
    } else if (current === 1) {
      return <Worker/>
    } else if (current === 2) {
      return <Site/>
    }
  }

  return (
    <View className='page'>
      <View className='container'>
        {renderContent()}
      </View>
      <AtTabBar
        fixed
        tabList={[
          {title: '工时管理', iconType: 'bullet-list'},
          {title: '人员管理', iconType: 'camera'},
          {title: '工地管理', iconType: 'folder'}
        ]}
        onClick={(index) => {
          setCurrent(index)
        }}
        current={current}
      />
    </View>
  )
}
