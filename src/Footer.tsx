import './index.css'
import awesome from './icon/awesome.png';

export function Footer({ isActive }: { isActive: boolean }): JSX.Element {
  if (!isActive) {
    return <div/>
  }
  return (        
    <div className='footer'>
        Made by AltF4. <img className='awesomeIcon' src={awesome} alt="awesome"/> Check out the <a href="https://github.com/altf4/enforcer">source code here</a>
        <br/>If you liked this, <a href="https://slippi.gg/#support">donate to Fizzi.</a>
    </div>
  )

}
