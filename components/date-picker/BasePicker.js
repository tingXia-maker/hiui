import React, {Component} from 'react'
import Modal from './Modal'
import classNames from 'classnames'
import {formatterDate, FORMATS} from './constants'

import PropTypes from 'prop-types'
import DatePickerType from './Type'

import { dateFormat, isValid, startOfWeek, endOfWeek, parse, compatibleToDate } from './dateUtil'
class BasePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showPanel: false,
      style: {},
      date: null,
      isFocus: false,
      texts: ['', ''],
      placeholder: '',
      leftPlaceholder: '',
      rightPlaceholder: '',
      format: ''
    }
    this.inputRoot = React.createRef()
    this.input = null
    this.rInput = null
  }
  setPlaceholder () {
    const {placeholder, localeDatas, type} = this.props
    const tempPlaceholder = localeDatas.datePicker.placeholders[type] || localeDatas.datePicker.placeholder
    let leftPlaceholder = tempPlaceholder
    let rightPlaceholder = tempPlaceholder

    if (placeholder instanceof Array) {
      leftPlaceholder = placeholder[0]
      rightPlaceholder = placeholder[1] || placeholder[0]
    } else if (typeof placeholder === 'string') {
      leftPlaceholder = placeholder
      rightPlaceholder = placeholder
    }
    this.setState({
      leftPlaceholder,
      rightPlaceholder
    })
  }
  componentDidMount () {
    this._parseProps(this.props)
    this.setPlaceholder()
    let rect = this.inputRoot.current.getBoundingClientRect()
    this.calcPanelPos(rect)
  }
  calcPanelPos (rect) {
    const {showTime, type} = this.props
    let _w = type.indexOf('range') !== -1 ? 578 : 288
    let _h = 298
    if (type === 'daterange' && showTime) {
      _h = 344
    }
    const _cw = document.documentElement.clientWidth || document.body.clientWidth
    const _ch = document.documentElement.clientHeight || document.body.clientHeight
    const _st = document.documentElement.scrollTop || document.body.scrollTop
    let {left, width, top, height} = rect
    let _top = rect.top + rect.height + _st
    if (left + _w > _cw) {
      left = left + width - _w
    }
    if (top + _h + height > _ch) {
      _top = top - _h + _st
    }
    this.setState({
      style: {
        position: 'absolute',
        left: left,
        top: _top
      }
    })
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.props.value) {
      this._parseProps(nextProps)
    }
  }
  compatibleFormatString (format) {
    return format.replace(/[Y+|D+]/g, (word) => {
      return word.toLowerCase()
    })
  }

  _parseProps (props) {
    let {value, defaultValue, showTime, type, format, localeDatas, weekOffset, timeInterval = 240} = props
    format = this.compatibleFormatString(format || FORMATS[type])
    let _value = value || defaultValue
    let start
    let end
    let date
    let leftText = ''
    let rightText = ''
    if (_value) {
      if (Object.prototype.toString.call(_value) === '[object Object]') {
        start = compatibleToDate(_value.start) || null
        end = compatibleToDate(_value.end) || new Date()
      } else {
        start = compatibleToDate(_value)
        if (type.includes('range')) {
          end = compatibleToDate(start)
          if (type === 'weekrange') {
            start = startOfWeek(start)
            end = endOfWeek(end)
          }
        }
      }

      if (type === 'timeperiod' && isValid(start)) {
        let startTime = start.getTime()
        startTime += timeInterval * 60 * 1000
        end = new Date(startTime)
      }
    }
    date = {
      startDate: compatibleToDate(start),
      endDate: compatibleToDate(end)
    }
    leftText = isValid(date.startDate) ? formatterDate(type, date.startDate, format, showTime, localeDatas, weekOffset) : ''
    rightText = isValid(date.endDate) ? formatterDate(type, date.endDate, format, showTime, localeDatas, weekOffset) : ''
    this.setState({
      texts: [leftText, rightText],
      date,
      format
    })
  }
  onPick (date, showPanel) {
    if (!date.startDate) {
      date = {startDate: date, endDate: undefined}
    }
    const {type, showTime, localeDatas, weekOffset} = this.props
    const {format} = this.state
    this.setState({
      date,
      texts: [formatterDate(type, date.startDate, format, showTime, localeDatas, weekOffset), formatterDate(type, date.endDate, format, showTime, localeDatas, weekOffset)],
      showPanel
    }, () => {
      if (!showPanel) {
        this.callback()
      }
    })
  }
  callback () {
    const {type, onChange} = this.props
    const {date} = this.state
    if (onChange) {
      let {startDate, endDate} = date
      startDate = isValid(startDate) ? startDate : ''
      endDate = isValid(endDate) ? endDate : ''
      if (type === 'week' || type === 'weekrange') {
        onChange(date)
        return
      }

      if (type === 'time') {
        onChange(startDate, dateFormat(startDate, this.state.format))
        return
      }
      if (['timerange', 'timeperiod', 'daterange'].includes(type)) {
        onChange({start: startDate, end: endDate})
        return
      }
      onChange(startDate)
    }
  }
  timeConfirm (date, onlyTime) {
    const {type, showTime, onChange, localeDatas, weekOffset} = this.props
    let {format} = this.state
    onlyTime && (format = FORMATS['time'])
    this.setState({
      date: date,
      texts: [formatterDate(type, date.startDate || date, format, showTime, localeDatas, weekOffset), formatterDate(type, date.endDate, format, showTime, localeDatas, weekOffset)],
      showPanel: false,
      isFocus: false
    })
    if (onChange) {
      if (date.startDate && date.endDate) {
        onChange({start: date.startDate, end: date.endDate})
      } else {
        onChange(date)
      }
    }
  }
  timeCancel () {
    const {format, date} = this.state
    const {type, showTime, localeDatas, weekOffset} = this.props
    this.setState({
      showPanel: false,
      texts: [formatterDate(type, date.startDate || date, format, showTime, localeDatas, weekOffset), formatterDate(type, date.endDate, format, showTime, localeDatas, weekOffset)],
      isFocus: false
    })
  }
  inputChangeEvent () {
    let { texts, date, format } = this.state
    let startDate = parse(texts[0], format, new Date())
    let endDate = parse(texts[1], format, new Date())
    if (startDate && isValid(startDate)) {
      date.startDate ? date.startDate = startDate : date = startDate
    }
    if (endDate && isValid(endDate)) {
      date.endDate && (date.endDate = endDate)
    }
    this.setState({date})
  }
  clickOutSide (e) {
    const tar = e.target
    this.inputChangeEvent()
    if (tar.className.indexOf('clear') !== -1) {
      this.setState({
        texts: ['', ''],
        showPanel: false
      })
      return false
    }
    if (tar !== this.input && tar !== this.rInput) {
      this.timeCancel()
      this.callback()
    }
  }
  _input (text, ref = 'input', placeholder = 'Please Select...') {
    const {disabled} = this.props
    const { texts } = this.state
    return (
      <input
        type='text'
        ref={el => { this[ref] = el }}
        placeholder={placeholder}
        className={disabled ? 'disabled' : ''}
        disabled={disabled}
        onChange={e => {
          ref === 'input' ? (texts[0] = e.target.value) : (texts[1] = e.target.value)
          this.setState({
            texts
          }, () => {
            this.inputChangeEvent()
          })
        }}
        onFocus={(e) => {
          this.setState({
            showPanel: true,
            isFocus: true
          })
          this.calcPanelPos(this.inputRoot.current.getBoundingClientRect())
        }}
        value={text}
      />
    )
  }
  _clear () {
    const {onChange, type} = this.props
    if (onChange) {
      onChange(
        (type.includes('range') || type === 'timeperiod') ? {start: '', end: ''} : ''
      )
    }
    this.setState({date: {startDate: null, endDate: null}, texts: ['', ''], isFocus: false})
  }
  _icon () {
    const {isFocus} = this.state
    const { clearable, type, showTime } = this.props
    const iconCls = classNames(
      'hi-datepicker__input-icon',
      'hi-icon',
      (isFocus && clearable) ? 'icon-close-circle clear' : ((type.includes('time') || showTime) ? 'icon-time' : 'icon-date')
    )
    return (isFocus && clearable)
      ? <span className={iconCls} onClick={this._clear.bind(this)} />
      : <span className={iconCls} onClick={(e) => {
        if (this.props.disabled) return
        this.calcPanelPos(this.inputRoot.current.getBoundingClientRect())
        this.setState({showPanel: true, isFocus: true})
      }} />
  }
  renderRangeInput () {
    const {
      localeDatas,
      disabled,
      showTime,
      type
    } = this.props
    const _cls = classNames(
      'hi-datepicker__input',
      'hi-datepicker__input--range',
      (showTime || type === 'timeperiod') && 'hi-datepicker__input--range-time',
      disabled && 'hi-datepicker__input--disabled'
    )
    return (
      <div className={_cls}>
        {this._input(this.state.texts[0], 'input', this.state.leftPlaceholder)}
        <span className='hi-datepicker__input--connection'>{localeDatas.datePicker.to}</span>
        {this._input(this.state.texts[1], 'rInput', this.state.rightPlaceholder)}
        {this._icon()}
      </div>
    )
  }
  renderNormalInput () {
    const {
      disabled,
      showTime
    } = this.props
    const _cls = classNames(
      'hi-datepicker__input',
      'hi-datepicker__input--normal',
      disabled && 'hi-datepicker__input--disabled',
      showTime && 'hi-datepicker__input--middle'
    )
    return (
      <div className={_cls}>
        {this._input(this.state.texts[0], 'input', this.state.leftPlaceholder)}
        {this._icon()}
      </div>
    )
  }
  render () {
    const {type, showTime} = this.props
    return (
      <span ref={this.inputRoot} className='hi-datepicker__input-root'>
        {
          (type.indexOf('range') !== -1 || type === 'timeperiod') ? this.renderRangeInput() : this.renderNormalInput()
        }
        {
          this.state.showPanel ? (
            <Modal clickOutSide={this.clickOutSide.bind(this)} showTime={showTime}>
              {this.initPanel(this.state, this.props)}
            </Modal>
          ) : null
        }
      </span>
    )
  }
}
BasePicker.propTypes = {
  type: PropTypes.oneOf(Object.values(DatePickerType)),
  value: function (props, propName, componentName) {
    const val = props[propName]
    if (val === undefined || val === null) {
      return null
    }
    if (!val) {
      return null
    }
    if (val.start && val.end) {
      const _start = isValid(val.start)
      const _end = isValid(val.end)
      if (!_start || !_end) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Validation failed. start or end is an invalid date.`)
      }
    } else {
      if (!isValid(val)) {
        return new Error(`Invalid prop ${propName} supplied to ${componentName}. Validation failed. value is an invalid data.`)
      }
    }
  },
  onChange: PropTypes.func,
  format: PropTypes.string,
  showTime: PropTypes.bool,
  disabled: PropTypes.bool,
  showWeekNumber: PropTypes.bool,
  weekOffset: PropTypes.oneOf([0, 1]),
  timeInterval: function (props, propName, componentName) {
    const val = props[propName]
    if (val < 5 || val > 480 || (val > 60 && val % 60 !== 0) || (val < 60 && 60 % val !== 0)) {
      return new Error(`Invalid prop ${propName} supplied to ${componentName}. This value must be greater than 5 and less than 480 and is a multiple of 60.`)
    }
  },
  clearable: PropTypes.bool
}
BasePicker.defaultProps = {
  type: 'date',
  disabled: false,
  showWeekNumber: true,
  weekOffset: 0,
  timeInterval: 240,
  clearable: true
}
export default BasePicker
