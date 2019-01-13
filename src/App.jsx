import React, { Component } from 'react'
import Counter from './components/Counter'
import Controls from './components/Controls'

class App extends Component {
  constructor () {
    super()
    this.state = {
      isCounting: false,
      isPause: false,
      total: 1500,
      count: 0,
      totalPause: 300,
      countPause: 0 
    }

    // Listeners for the Tray menu
    window.ipcRenderer.on('start', this.start)
    window.ipcRenderer.on('reset', this.reset)
  }


  /**
   * Launch the counter
   * Creates the `countInterval` variable
   * Send `counting` event to the main process
   */
  start = () => {
    if (this.state.isCounting) return
    this.countInterval = setInterval(this.increment, 1000)
    this.setState({
      isCounting: true
    })
    window.ipcRenderer.send('counting')
  }


  /**
   * Clear the `countInterval`
   * Send `idle` event to the main process
   */
  pause = () => {
    if (!this.state.isCounting) return
    clearInterval(this.countInterval)
    this.setState({
      isCounting: false
    })
    window.ipcRenderer.send('idle')
  }


  /**
   * Clear all intervals
   * Clear the state
   * Send `idle` event to the main process
   */
  reset = () => {
    clearInterval(this.countInterval)
    clearInterval(this.pauseInterval)
    this.setState({
      isCounting: false,
      isPause: false,
      count: 0,
      countPause: 0
    })
    window.ipcRenderer.send('idle')
  }
  

  /**
   * Triggered every 1s when `state.isCounting` = true
   * Increment the `state.count`
   * Create the `pauseInterval` when `state.count` > `state.total`
   */
  increment = () => {
    if (this.state.count >= this.state.total) {
      // Max value for `this.state`
      // Switch into the `pauseInterval`
      this.reset()
      this.setState({
        isPause: true
      })
      window.ipcRenderer.send('pausing')
      return this.pauseInterval = setInterval(this.incrementPause, 1000)
    }
    this.setState(prevState => ({
      count: prevState.count + 1
    }))
  }


  /**
   * Triggered every 1s when `state.isPause` = true
   * Increment the `state.countPause`
   * Switch to the `countInterval`
   */
  incrementPause = () => {
    if (this.state.countPause >= this.state.totalPause) {
      // Max value for `state.countPause`
      // Switch into the `countInterval`
      this.reset()
      window.ipcRenderer.send('counting')
      return this.start()
    }
    this.setState(prevState => ({
      countPause: prevState.countPause + 1
    }))
  }

  
  /**
   *  Set a new value for work time
   */
  setWork = (minutes) => {
    const ms = parseInt(minutes) === 0 ? 1500 : minutes*60
    this.setState({
      total: ms
    })
  }

  /**
   *  Set a new value for pause time
   */
  setPause = (minutes) => {
    const ms = parseInt(minutes) === 0 ? 300 : minutes*60
    this.setState({
      totalPause: ms
    })
  }

  render() {

    return (
      <div className="container">
        <Counter {...this.state} />

        <Controls
          isCounting={this.state.isCounting}
          total={this.state.total}
          totalPause={this.state.totalPause}
          start={this.start}
          pause={this.pause}
          reset={this.reset}
          setWork={this.setWork}
          setPause={this.setPause}
        />
      </div>
    )
  }
}

export default App
