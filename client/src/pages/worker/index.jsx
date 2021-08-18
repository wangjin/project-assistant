import React, {useEffect, useState} from 'react'
import {View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {AtButton, AtList, AtListItem} from 'taro-ui'

const db = Taro.cloud.database();
const _ = db.command
const logger = Taro.getLogManager()

export default () => {

  const [workers, setWorkers] = useState([])

  const getList = () => {
    logger.debug({str: 'hello world'}, 'debug log', 100, [1, 2, 3])
    db.collection('users')
      .field({
        _id: true,
        name: true,
        phone_number: true,
      })
      .limit(10)
      .get().then(r => setWorkers(r.data))
  }


  useEffect(() => {
    getList()
  }, [])

  return (
    <View>
      <AtList>

        {workers.map(item =>
          <View key={item.id} className='at-row'>
            <View className='at-col at-col-8'><AtListItem title={item.name}/></View>
            <View className='at-col at-col-2'><AtButton size='small'>编辑</AtButton></View>
            <View className='at-col at-col-2'><AtButton size='small'>删除</AtButton></View>
          </View>)}
      </AtList>
    </View>
  )
}
