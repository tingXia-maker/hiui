import React from 'react'
import DocViewer from '../../../libs/doc-viewer'
import DatePicker from '../../../components/date-picker'
const prefix = 'date-picker-normal'
const code = `
import React from 'react'
import DatePicker from '@hi-ui/hiui/es/date-picker'\n
class Demo extends React.Component {
  constructor() {
    super()
    this.state = {
      date: new Date(),
    }
  }
  render () {
    return (
      <div style={{display:'flex', flexWrap: 'wrap'}}>
        <DatePicker
          value={new Date}
          onChange={(d) => {
            console.log('callback', d)
          }}
        />
        <DatePicker
          value={null}
          onChange={(d) => {
            console.log('callback', d)
          }}
        />
        <DatePicker
          value={undefined}
          onChange={(d) => {
            console.log('callback', d)
          }}
        />
        <DatePicker
          value={1564046819811}
          onChange={(d) => {
            console.log('callback', d)
          }}
        />
        <DatePicker
          value="2019-01-01"
          onChange={(d) => {
            console.log('callback', d)
          }}
        />
      </div>
    )
  }
}`
const DemoNormal = () => <DocViewer code={code} scope={{ DatePicker }} prefix={prefix} />
export default DemoNormal
