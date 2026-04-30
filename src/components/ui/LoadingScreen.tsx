import logo from '../../assets/logo.png'

export const LoadingScreen = () => (
  <div className="loading-screen">
    <img src={logo} alt="SubS" className="loading-logo" />
    <div className="loading-dots">
      <span /><span /><span />
    </div>
  </div>
)
