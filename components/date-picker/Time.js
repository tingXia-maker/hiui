import React, {Component} from 'react'
import {deconstructDate} from './util'
import TimeList from './TimeList'
import { isSameDay, getValidDate } from './dateUtil'

class Time extends Component {
  constructor (props) {
    super(props)
    this.state = {
      date: getValidDate(props.date),
      prefix: {
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    }
  }
  callback (date) {
    this.setState({
      date
    })
    this.props.onPick(date, true)
  }
  componentWillReceiveProps (props) {
    if (!isSameDay(props.date, this.state.date)) {
      this.setState({
        date: getValidDate(props.date)
      })
    }
  }
  whenDisableChange (list, val, arrowVal) {
    if (!arrowVal) {
      return val
    }
    let _value = val + arrowVal
    while (list.includes(_value)) {
      _value += arrowVal
    }
    return _value
  }
  selectedEvent (type, value, arrow) {
    const { date } = this.state
    const disabledList = this._getDsiabledList()[type]
    if (disabledList.includes(value) && arrow) {
      value = this.whenDisableChange(disabledList, value, arrow)
    }
    if (type === 'hours') {
      date.setHours(value)
    } else if (type === 'minutes') {
      date.setMinutes(value)
    } else if (type === 'seconds') {
      date.setSeconds(value)
    }
    this.callback(date)
  }

  isShowHMS () {
    const { format } = this.props
    return {
      hours: format.indexOf('H') > -1 || format.indexOf('h') > -1,
      minutes: format.indexOf('m') > -1,
      seconds: format.indexOf('s') > -1
    }
  }
  generateDatas (type) {
    let count
    let datas = []
    const currentDate = deconstructDate(this.state.date)
    const disabledList = this._getDsiabledList()
    const disabledTime = disabledList[type]
    if (type === 'hours') {
      count = 24
    } else if (type === 'minutes') {
      count = 60
    } else {
      count = 60
    }
    for (let i = 0; i < count; i += 1) {
      datas.push({
        value: i,
        text: i < 10 ? '0' + i : i.toString(),
        disabled: disabledTime.includes(i),
        current: i === currentDate[type]
      })
    }
    return datas
  }
  _getDsiabledList () {
    const { disabledHours, disabledMinutes, disabledSeconds } = this.props
    const currentDate = deconstructDate(this.state.date)
    return {
      hours: Object.prototype.toString.call(disabledHours) === '[object Array]' ? disabledHours : (disabledHours() || []),
      minutes: Object.prototype.toString.call(disabledMinutes) === '[object Array]' ? disabledMinutes : (disabledMinutes(currentDate['hours']) || []),
      seconds: Object.prototype.toString.call(disabledSeconds) === '[object Array]' ? disabledSeconds : (disabledSeconds(currentDate['hours'], currentDate['minutes']) || [])
    }
  }
  renderTimeList (type) {
    const { hourStep, minuteStep, secondStep } = this.props
    const dDate = deconstructDate(this.state.date)
    const disabledList = this._getDsiabledList()
    const isShow = this.isShowHMS()[type]
    if (!isShow) { return null }
    return <TimeList
      type={type}
      value={dDate[type]}
      onlyTime={this.props.onlyTime}
      datas={this.generateDatas(type)}
      disabledList={disabledList[type]}
      hourStep={hourStep}
      minuteStep={minuteStep}
      secondStep={secondStep}
      onSelect={this.selectedEvent.bind(this)}
      show={this.isShowHMS()[type]}
    />
  }
  render () {
    const { localeDatas } = this.props
    const { hours: lHours, minutes: lMinutes, seconds: lSeconds } = localeDatas.datePicker
    const {
      hours: showHour,
      minutes: showMinute,
      seconds: showSecond
    } = this.isShowHMS()
    return (
      <div className='hi-timepicker__body'>
        <div className='hi-timepicker__timeheader'>
          {
            showHour && <span className='hi-timepicker__mark'>{lHours}</span>
          }
          {
            showMinute && <span className='hi-timepicker__mark'>{lMinutes}</span>
          }
          {
            showSecond && <span className='hi-timepicker__mark'>{lSeconds}</span>
          }
        </div>
        <div className='hi-timepicker__timebody'>
          {this.renderTimeList('hours')}
          {this.renderTimeList('minutes')}
          {this.renderTimeList('seconds')}
          <div className='hi-timepicker__current-line' style={{top: this.props.onlyTime ? 108 : 140}} />
        </div>
      </div>
    )
  }
}
Time.defaultProps = {
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  format: 'HH:mm:ss',
  disabledHours: () => [],
  disabledMinutes: () => [],
  disabledSeconds: () => []
}

export default Time
