import React from 'react'
import DocViewer from '../../../libs/doc-viewer'
import DatePicker from '../../../components/date-picker'
const prefix = 'date-picker-date'
const code = `
import React from 'react'
import DatePicker from '@hi-ui/hiui/es/date-picker'\n
class Demo extends React.Component {
  constructor () {
    super()
    let _d = new Date().getTime()
    _d += (7 * 24 * 60 * 60 * 1000)

    this.state = {
      date: new Date(),
      maxDate: _d
    }
  }
  render () {
    return (
      <DatePicker
        value={this.state.date}
        minDate={new Date()}
        maxDate={this.state.maxDate}
        onChange={(date) => {
          console.log('选中值', date)
        }}
      />
    )
  }
}`

const DemoBanDate = () => (
  <DocViewer
    code={code}
    scope={{ DatePicker }}
    prefix={prefix}
  />
)
export default DemoBanDate
