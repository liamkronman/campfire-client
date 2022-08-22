import './App.css';
import React, { useRef, useEffect } from 'react';
import campfireBackground from './assets/campfire-background-mac.png';
import thefire1 from './assets/thefire.png';
import thefire2 from './assets/thefire_2.png';
import io from 'socket.io-client';

function App() {
  const [inputValue, setInputValue] = React.useState("");
  const [showInstruct, setShowInstruct] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [invalidCampname, setInvalidCampname] = React.useState(false);
  const [inFire, setInFire] = React.useState(false);
  const [socket, setSocket] = React.useState(null);
  const [currMessageAuthor, setCurrMessageAuthor] = React.useState("");
  const [currMessage, setCurrMessage] = React.useState("");
  const [campName, setCampName] = React.useState(null);
  const [frameNum, setFrameNum] = React.useState(1);
  const [currFire, setCurrFire] = React.useState(thefire1);
  const [typing, setTyping] = React.useState(false);

  const handleInputChange = (event) => {
    if (event.target.value.length > 0) {
      setShowInstruct(true);
    } else {
      setShowInstruct(false);
    }
    setInputValue(event.target.value);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const newSocket = io("https://the-campfire.herokuapp.com");
      setSocket(newSocket, () => {
        socket.emit('join', inputValue);
        setCampName(inputValue);
      });
    }
  }

  const handleTyping = (event) => {
    setTyping(true);
    socket.emit('message', `${campName}:${event.key}`);
  }

  useEffect(() => {
    if (socket) {
      if (!authenticated) {
        socket.on('join', (resp) => {
          console.log(resp)
          if (resp[campName]) {
            setInvalidCampname(false);
            setAuthenticated(true);
            setInFire(true);
          } else {
            setInvalidCampname(true);
            // clear campname-input field
            setInputValue("");
          }
        })
      } else {
        socket.on('message', (message) => {
          setCurrMessage(message.value)
          setCurrMessageAuthor(message.user)
        })
        socket.on('deleteMessage', (message) => {
          if (message.value === currMessage) {
            setCurrMessage("")
            setCurrMessageAuthor("")
          }
        })
      }
    }
  })

  // switch between the two fire images every 700 ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (frameNum === 1) {
        setFrameNum(2);
        setCurrFire(thefire2);
      } else {
        setFrameNum(1);
        setCurrFire(thefire1);
      }
    }, 700);
    return () => clearInterval(interval);
  }, [frameNum]);

  return (
    <>
      {inFire 
        ? <div className="App"
          style={{
            backgroundImage: `url(${campfireBackground})`,
            backgroundSize: 'cover',
          }} tabIndex="0" onKeyPress={handleTyping} >
            <div className="text-body">
              <div className="campfire-welcome-title">Welcome<span style={{fontSize: 30}}> </span>to<span style={{fontSize: 30}}> </span><span style={{ color: "#F35B22", fontFamily: "'Space Mono', monospace", fontSize: '60px' }}>The<span style={{fontSize: 25}}> </span>Campfire</span></div>
              {typing ? <></> : <div className="campfire-welcome-direction">Click anywhere. Then just type.</div>}
              {currMessage ? <div className="campfire-message"><span className="message-author">{currMessageAuthor}</span>:<span style={{fontSize: 25}}> </span>{currMessage}</div> : <div className="campfire-message"> </div>}
              <img src={currFire} className="the-fire" />
              <footer className="footer">A Liam Kronman + Jason Seo Production</footer>
            </div>
          </div>
        : <div className="App"
          style={{
            backgroundImage: `url(${campfireBackground})`,
            backgroundSize: 'cover',
          }}>
            <div className="text-body">
              <div className="campfire-title">The<span style={{fontSize: 25}}> </span>Campfire</div>
              <div className="campfire-subtitle">Type like you talk.</div>
              <div className="input-container">
                <input className="campname-input" type="text" value={inputValue} placeholder="Enter a camp name..." onChange={handleInputChange} onKeyDown={handleKeyDown} />
                {invalidCampname
                  ? <div className="invalid-campname">A camper with the same name is at the fire already. Choose another!</div>
                  : showInstruct 
                    ? <div className="campfire-input-instruction">Press enter to join the fire...</div> 
                    : null
                }
              </div>
              <footer className="footer">A Liam Kronman + Jason Seo Production</footer>
            </div>
          </div>}
    </>
  );
}

export default App;