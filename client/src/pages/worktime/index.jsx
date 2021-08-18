import React, {useEffect, useState, useCallback} from 'react'
import Taro from '@tarojs/taro'
import {View, ScrollView, Text, Picker} from '@tarojs/components'
import {
  AtCalendar,
  AtButton,
  AtCard,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtMessage,
  AtTextarea,
  AtCheckbox,
  AtRadio,
  AtList,
  AtListItem,
  AtTag
} from 'taro-ui'
import './index.scss'

// eslint-disable-next-line import/no-named-as-default
import formatDate from '../../util/date-util'

const host = 'http://192.168.31.27:8080'

export default () => {

  // 当前日历日期
  const [currentDate, setCurrentDate] = useState(Date.now())
  const [modalShow, setModalShow] = useState(false)
  const [workerSelected, setWorkerSelected] = useState([])
  const [siteChecked, setSiteChecked] = useState(undefined)
  const [fullDayActive, setFullDayActive] = useState(true)
  const [morningActive, setMorningActive] = useState(false)
  const [afternoonActive, setAfternoonActive] = useState(false)
  const [remarkValue, setRemarkValue] = useState('')
  // 新增工时时选择的日期
  const [dateValue, setDateValue] = useState(undefined)
  const [workTimeList, setWorkTimeList] = useState([])
  const [workerOptions, setWorkerOptions] = useState([])
  const [siteOptions, setSiteOptions] = useState([])
  const [workCount, setWorkCount] = useState(1)
  const [id, setId] = useState(undefined)

  const logger = Taro.getLogManager()

  const handleEdit = (workTime) => {

    setId(workTime.id)
    setDateValue(workTime.workDate)
    const workers = []
    workers.push(workTime.workerId)
    setWorkerSelected(workers)
    setSiteChecked(workTime.siteId)
    setWorkCount(workTime.workCount)
    setRemarkValue(workTime.remark)
    const type = workTime.type
    if (type === 1) {
      setFullDayActive(true)
    } else if (type === 2) {
      setMorningActive(true)
    } else if (type === 3) {
      setAfternoonActive(true)
    }

    setModalShow(true);
  }
  const handleDel = (workTimeId) => {
    Taro.request({
      url: host + '/work-time/' + workTimeId,
      method: 'delete'
    }).then(res => {
      if (res.data === 'success') {
        Taro.atMessage({
          message: '删除成功',
          type: 'success',
          duration: 1000
        })
        getList()
      }
    })


  }

  const handleAdd = () => {
    setModalShow(true)
  }

  const renderContent = (workTime) => {

    return <View className='at-row'>
      <View className='at-col at-col-8'><Text>备注：{workTime.remark}</Text></View>
      <View className='at-col at-col-2'>
        <AtButton
          className='edit-btn'
          type='primary'
          size='small'
          onClick={() => handleEdit(workTime)}
        >修改</AtButton>
      </View>
      <View className='at-col at-col-2'>
        <AtButton
          className='del-btn'
          type='primary'
          size='small'
          onClick={() => handleDel(workTime.id)}
        >删除</AtButton></View>
    </View>
  }

  const handleTagClick = (name) => {
    if (name === 'fullDay') {
      setMorningActive(false)
      setAfternoonActive(false)
      setFullDayActive(true)
    } else if (name === 'morning') {
      setMorningActive(true)
      setAfternoonActive(false)
      setFullDayActive(false)
    } else if (name === 'afternoon') {
      setMorningActive(false)
      setAfternoonActive(true)
      setFullDayActive(false)
    }
  }

  const resetForm = () => {
    setDateValue(formatDate(new Date()))
    setRemarkValue('')
    handleTagClick('fullDay')
    setWorkerSelected([])
    setSiteChecked(undefined)
  }

  const closeModal = () => {
    setModalShow(false)
    resetForm()
  }

  const handleConfirm = () => {

    if (workerSelected.length === 0) {
      Taro.atMessage({
        message: '请选择人员',
        type: 'error',
        duration: 2000
      })
    } else if (!siteChecked) {
      Taro.atMessage({
        message: '请选择地点',
        type: 'error',
        duration: 2000
      })
    } else {
      // 工时类型 1：全天 2：上午 3：下午
      let type = 1

      if (morningActive) {
        setWorkCount(0.5)
        type = 2
      } else if (afternoonActive) {
        setWorkCount(0.5)
        type = 3
      }

      let method = 'post'
      if (id) {
        method = 'put'
      }

      Taro.request({
        url: host + '/work-time',
        method: method,
        data: {
          id: id,
          workDate: dateValue,
          workerIds: workerSelected,
          siteId: siteChecked,
          workCount: workCount,
          remark: remarkValue,
          type: type
        }
      }).then(res => {
        if (res.data === 'success') {
          Taro.atMessage({
            message: '添加成功',
            type: 'success',
            duration: 1000
          })
          closeModal()
          getList()
        }
      })
    }
  }

  const getList = useCallback((date) => {
    logger.info('获取列表')
    if (!date) {
      date = formatDate(new Date(currentDate))
    }
    Taro.request({
      url: host + '/work-time/list',
      data: {
        workDate: date
      }
    }).then(res => {
      setWorkTimeList(res.data)
    })
  }, [currentDate, logger])

  const getWorkers = () => {
    return Taro.request({
      url: host + '/worker/list'
    }).then(res => {
      const workers = res.data.map((obj) => {
        obj.value = obj.id
        obj.label = obj.name
        return obj
      })
      setWorkerOptions(workers)
    })
  }

  const getSites = () => {
    return Taro.request({
      url: host + '/site/list'
    }).then(res => {
      const sites = res.data.map((obj) => {
        obj.value = obj.id
        obj.label = obj.name
        return obj
      })
      setSiteOptions(sites)
    })
  }

  const handleDayClick = (selectedDate) => {
    getList(selectedDate)
  }

  useEffect(() => {
    setDateValue(formatDate(new Date()))
    // 加载日历数据
    getList()
    // 加载人员数据
    getWorkers()
    // 加载地点数据
    getSites()
  }, [getList])

  return (
    <>
      <AtMessage/>
      <AtButton className='add-btn' size='small' onClick={() => handleAdd()}>记录工时</AtButton>
      <AtCalendar
        currentDate={currentDate}
        onDayClick={(item) => handleDayClick(item.value)}
        marks={['2021/02/12']}
      />
      <ScrollView className='time-scroll-view' scrollY enableFlex>
        {workTimeList.map((workTime) => (
          <AtCard
            key={workTime.id}
            className='work-time-card'
            extra={workTime.workCount + '天'}
            title={'【' + workTime.workerName + '】-【' + workTime.siteName + '】'}
          >
            {renderContent(workTime)}
          </AtCard>))}

      </ScrollView>
      <AtModal
        isOpened={modalShow}
        onClose={() => {
          resetForm()
        }}
        closeOnClickOverlay={false}
      >
        <AtModalHeader>编辑工时</AtModalHeader>
        <AtModalContent>
          <Picker mode='date' onChange={(e) => {
            setDateValue(e.detail.value)
          }}
          >
            <AtList>
              <AtListItem title='记录日期' extraText={dateValue}/>
            </AtList>
          </Picker>
          <View className='page-section'>
            <Text>选择人员</Text>
            <AtCheckbox
              options={workerOptions}
              selectedList={workerSelected}
              onChange={(selectedValue) => setWorkerSelected(selectedValue)}
            />
          </View>
          <View className='page-section'>
            <Text>选择地点</Text>
            <AtRadio
              options={siteOptions}
              value={siteChecked}
              onClick={(checkedValue) => setSiteChecked(checkedValue)}
            />
          </View>
          <View className='page-section'>
            <Text>选择工时</Text>
            <View className='at-row'>
              <View className='at-col'>
                <AtTag
                  name='fullDay'
                  active={fullDayActive}
                  onClick={(info) => handleTagClick(info.name)}
                >全天</AtTag>
              </View>
              <View className='at-col'>
                <AtTag
                  name='morning'
                  active={morningActive}
                  onClick={(info) => handleTagClick(info.name)}
                >上午</AtTag>
              </View>
              <View className='at-col'>
                <AtTag
                  name='afternoon'
                  active={afternoonActive}
                  onClick={(info) => handleTagClick(info.name)}
                >下午</AtTag>
              </View>
            </View>
          </View>
          <View className='page-section'>
            <Text>备注</Text>
            <AtTextarea
              value={remarkValue}
              onChange={(value) => {
                setRemarkValue(value)
              }}
              maxLength={200}
              placeholder='请输入备注...'
            />
          </View>
        </AtModalContent>
        <AtModalAction>
          <AtButton size='small' onClick={() => closeModal()}>取消</AtButton>
          <AtButton size='small' onClick={() => handleConfirm()}>确定</AtButton>
        </AtModalAction>
      </AtModal>
    </>
  )
}
