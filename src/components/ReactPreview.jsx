import React from 'react'
import ReactDOM from 'react-dom'

import Resizable from './Resizable'

const PropTypes = React.PropTypes

export default class ReactPreview extends React.Component {

  static propTypes = {
    codeString: PropTypes.string,
    previewConfig: PropTypes.object
  }

  static defaultProps = {
    previewConfig: {}
  }

  constructor(props) {
    super(props)
    this.state = {
      width: 320,
      height: 500
    }
  }

  componentDidMount() {
    this.refreshIframe(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.codeString !== this.props.codeString) {
      this.refreshIframe(nextProps)
    }
  }

  refreshIframe(props) {

    const iframe = ReactDOM.findDOMNode(this.refs.iframe);

    if (iframe) {

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

      iframeDoc.close();

      const styles = props.previewConfig.styles || []
      const scripts = props.previewConfig.scripts || []

      const headBlocks = [];
      const codeBlocks = [];

      styles.forEach((link)=> {
        headBlocks.push(`<link rel='stylesheet' href='${link}'/> `)
      })

      scripts.forEach((link)=> {
        codeBlocks.push(`<script src='${link}'></script>`)
      })

      let script = `
        (function() {
          var __components__ = ${props.previewConfig.components || 'components'};
          function defaultRequire(path) {
            return __components__[path].default || __components__[path];
          }
          (function(require, module, exports) {
            var React = require('react');
            var ReactDOM = require('react-dom');
            ${props.codeString}
            ReactDOM.render(React.createElement(exports.default || module.exports, {}, null), document.getElementById('root'))
          })(defaultRequire, {}, {});
        })();
      `

      codeBlocks.push(`<script>${script}</script>`)

      iframeDoc.open();
      iframeDoc.write(`
      <html>
        <head>${headBlocks.join('\n')}</head>
        <body>
          <div id='root'></div>
          ${codeBlocks.join('\n')}
        </body>
      </html>`
      )

    }

  }

  onResize(evt, {size}) {
    this.setState(size);
  }

  resizeWidth(evt) {
    this.setState({
      width: parseInt(evt.target.value)
    });
  }

  resizeHeight(evt) {
    this.setState({
      height: parseInt(evt.target.value)
    });
  }

  render() {

    const state = this.state

    const styles = {
      width: state.width + 'px', height: state.height + 'px'
    }

    return (<div className='react-preview'>
      <div className='react-preview__size-input'>
        <label>
          <span> width:</span>
          <input name='width'
                 type='number'
                 value={state.width}
                 onChange={this.resizeWidth.bind(this)}/>
        </label>
        <label>
          <span> height:</span>
          <input name='height'
                 type='number'
                 value={state.height}
                 onChange={this.resizeHeight.bind(this)}/>
        </label>
      </div>
      <Resizable
        width={state.width}
        height={state.height}
        className='react-preview__resize--container'
        onResize={this.onResize.bind(this)}>
        <iframe ref='iframe'
                style={styles}/>
      </Resizable>
    </div>)
  }
}
