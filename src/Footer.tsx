import './index.css'
import awesome from './icon/awesome.png';

export function Footer({ isActive, version }: { isActive: boolean, version: string }): JSX.Element {
  if (!isActive) {
    return <div/>
  }
  return (        
    <div className='footer'>
        SLP Enforcer v{version} Made by AltF4. <img className='awesomeIcon' src={awesome} alt="awesome"/> If you believe you've found a bug, please <a href="https://github.com/altf4/libenforcer/issues">report it here</a>
        <br/>Also, <a href="https://slippi.gg/#support">donate to Fizzi.</a>
    </div>
  )

}
