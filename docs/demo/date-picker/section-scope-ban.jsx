import React from 'react'
import DocViewer from '../../../libs/doc-viewer'
import DatePicker from '../../../components/date-picker'
const prefix = 'date-picker-scope-ban'
const code = `
import React from 'react'
import DatePicker from '@hi-ui/hiui/es/date-picker'\n
class Demo extends React.Component {
  render () {
    let _d = new Date().getTime()
    _d += (30 * 24 * 60 * 60 * 1000)

    return (
      <DatePicker
        placeholder={['开始日期', '结束日期']}
        type='daterange'
        minDate={new Date()}
        maxDate={_d}
      />
    )
  }
}`
const DemoScope = () => (
  <DocViewer
    code={code}
    scope={{ DatePicker }}
    prefix={prefix}
  />
)
export default DemoScope
