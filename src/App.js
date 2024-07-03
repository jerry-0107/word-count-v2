
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'

import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode.react';
import { Button, Fade } from 'react-bootstrap';



function App() {
  const [text, setText] = useState(''); // 追蹤<textarea>的內容
  const [word, setWord] = useState(0); // 算字數
  const [characters, setCharacters] = useState(0); // 算字元數
  const [charactersWithoutSpace, setCharactersWithoutSpace] = useState(0); // 算字元數(不含空白)

  const [fileName, setFileName] = useState("")
  const [msgs, setMsgs] = useState("")

  const [ShareCodeDisplay, setShareCodeDisplay] = useState(false)
  const [receiveCodeDisplay, setReceiveCodeDisplay] = useState(false)

  const [shareCodeData, setShareCodeData] = useState(<></>)
  const [shareCode, setShareCode] = useState("分享碼會顯示在這裡")

  const receiveInput = useRef()
  const textarea = useRef()
  const textareaFsc = useRef()

  const [isFullSc, setIsFullSc] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [currentBattery, setCurrentBattery] = useState("電池資訊")

  const [fullscWordCToggle, setfullscWordCToggle] = useState(0)
  const [fullscCodeToggle, setfullscCodeToggle] = useState(0)

  const [selectStr, setSelectStr] = useState()
  const [isSelected, setIsSelected] = useState(false)
  const [autouploadSec, setAutoUploadSec] = useState(300)

  useEffect(() => {
    if (!UrlParam("t")) {
      // 檢查是否有先前的輸入內容存儲在本地
      /* if (localStorage.getItem("fileName").length > 0) {
         setMsgs("資料處理中...")
       }*/
      console.log(localStorage)
      const storedText = localStorage.getItem('userInput');
      if (storedText) {
        setText(storedText);
        setWord(checkTextLength(storedText));
        setCharacters(storedText.length);
        setCharactersWithoutSpace(countNonSpaceCharacters(storedText))
        setFileName(localStorage.getItem("fileName"))

        if (localStorage.getItem("fileName").length > 0) {
          setMsgs(<><span className='b-yellow'><b>**目前顯示估計值，開始編輯以取得實際數字**</b></span></>)
          return
        } else {
          setMsgs(<><span className='t-blue'><b>成功恢復上次存檔</b></span></>)
          return
        }
      } else {
        //  setMsgs(<><span className='t-blue'><b>開始編輯吧! 系統會自動儲存你的變更</b></span></>)
      }
    } else {
      // if (window.confirm("這個網址包含文字檔案，要導入編輯嗎?\n這將覆蓋現有的檔案，且無法復原!!")) {

      var temptx = decodeUrlAsText(UrlParam("t"))
      console.log(decodeUrlAsText(temptx))

      // if (window.confirm("這個網址包含文字檔案，要導入編輯嗎?\n這將覆蓋現有的檔案，且無法復原!!")) {
      localStorage.setItem('userInput', decodeUrlAsText(temptx))
      window.location.search = "k=1"
      window.location.href = "/"
      setText(temptx)
      setFileName("從網址解析.txt")
      // } else {
      // }
    }
  }, []);

  useEffect(() => {
    // 使用者輸入的內容變動時，將其存儲在本地
    localStorage.setItem('userInput', (text));
    localStorage.setItem("fileName", fileName)
  }, [text, fileName]);




  function countNonSpaceCharacters(text) {
    var textWithoutSpaces = text.replace(/\s/g, '');
    return textWithoutSpaces.length;
  }
  function checkTextLength(str) {
    str = str.replace(/[\u007F-\u00FE]/g, ' ');

    var str1 = str;
    var str2 = str;

    str1 = str1.replace(/[^!-~\d\s]+/gi, ' ');
    str2 = str2.replace(/[!-~\d\s]+/gi, '');

    var matches1 = str1.match(/[\u00ff-\uffff]|\S+/g);
    var matches2 = str2.match(/[\u00ff-\uffff]|\S+/g);

    var count1 = matches1 ? matches1.length : 0;
    var count2 = matches2 ? matches2.length : 0;

    return count1 + count2;
  }

  function handleTextareaChange(event) {
    const inputValue = event;
    setText(inputValue);
    setWord(checkTextLength(inputValue));
    console.log(inputValue.length)
    setCharacters(inputValue.length);
    setCharactersWithoutSpace(countNonSpaceCharacters(inputValue))
    setFileName("")
    setMsgs("")
    setIsSelected(false)
  }

  function handleTextareaSelect(e) {
    function getSelectedText() {
      console.log(textarea)
      const start = textarea.current.selectionStart;
      const end = textarea.current.selectionEnd;
      console.log(start, end)
      if (start === undefined || end === undefined) return null
      return textarea.current.value.substring(start, end);
    }
    var selected = getSelectedText()

    if (!selected) return
    setWord(checkTextLength(selected));
    setCharacters(selected.length);
    setCharactersWithoutSpace(countNonSpaceCharacters(selected))
    setIsSelected(true)
  }

  function readFile(e) {
    if (window.confirm("確定要上傳檔案嗎?\n這將覆蓋現有的檔案，且無法復原!!")) {
      var file = e[0];
      var reader = new FileReader();
      setText("");
      setWord("0");
      setCharacters("0");
      setCharactersWithoutSpace("0")
      setFileName("上傳的檔案: " + e[0].name)
      setMsgs("正在處理檔案...")

      reader.onload = function (event) {
        var fileContent = event.target.result;
        setText(fileContent);
        // setWord(checkTextLength(text));
        // setCharacters(text.length);
        //  console.log(text.length)

        // handleTextareaChange(fileContent)
        localStorage.setItem('userInput', fileContent);

        window.location.reload()
      };

      reader.readAsText(file);
    }
  }




  function clearWord() {
    if (window.confirm('確定要清除嗎?\n此操作無法復原!!')) {
      localStorage.setItem("userInput", "")
      setMsgs("正在刷新頁面...")
      window.location.reload()
    }
  }


  function TextDecode(text, enc) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(text);

    // 自动识别编码并转换为目标编码
    const decoder = new TextDecoder(enc);
    const decodedText = decoder.decode(encodedData);

    return decodedText
  }

  function decodeUrlAsText(urlParam) {
    console.log(urlParam)
    return urlParam.replace(/%3C!b%3E/g, "\n").replace(/%3C!t%3E/g, "    ").replace(/%3C!s%3E/g, " ").replace(/<!b>/g, "\n").replace(/<!t>/g, "    ").replace(/<!s>/g, " ")
  }

  function UrlParam(name) {
    var url = new URL(window.location.href),
      result = url.searchParams.get(name);
    return result
  }


  function getShareCode() {

    setShareCode("正在取得")
    var code;
    fetch("/share/getcode", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "text": text,
        "timestamp": new Date()
      })
    })
      .then(res => res.json())
      .then(res => {
        console.log(res.rantxt)
        code = res.rantxt
        setShareCode(code)
      })
      .catch(err => {
        console.log(err)
        code = `發生錯誤 :( `
        setShareCode(code)
      })

  }

  function getTextByCode() {
    fetch("/get/text", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "uid": receiveInput.current.value
      })
    })
      .then(res => res.json())
      .then(res => {
        if (res.text.useTimesRemain > 0) {
          if (window.confirm("代碼有效，要取代現有的檔案嗎?\n這個操作無法復原!!")) {
            setText(res.text.text)
            setFileName("來自分享碼的檔案")
            setMsgs("正在刷新頁面...")
            window.location.reload()
          }
        } else {
          alert("代碼無效或過期")
        }
      })
      .catch(err => { alert("代碼無效或過期 (ERR)") })
  }

  function getShareCodeStatus() {

    fetch("/query/uid", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "uid": shareCode
      })
    })
      .then(res => res.json())
      .then(res => {
        console.log(res)
        res.status.vaildUntil = new Date(res.status.vaildUntil)
        //var h = res.status.vaildUntil.getHours() < 10 ? "0" + res.status.vaildUntil.getHours() : res.status.vaildUntil.getHours(),
        //m = res.status.vaildUntil.getMinutes() < 10 ? "0" + res.status.vaildUntil.getMinutes() : res.status.vaildUntil.getMinutes()
        if (res.status.useTimesRemain) {
          setShareCodeData(<div className='alert alert-success'>{shareCode}: 代碼有效</div>)
        } else {
          setShareCodeData(<div className='alert alert-danger'>{shareCode}: 代碼無效或過期，請重新取得</div>)
        }
      })
      .catch(err => {
        setShareCodeData(<div className='alert alert-danger'>{shareCode}: 代碼無效或過期，請重新取得 (ERR)</div>)

      })
  }


  function openFullscreen() {
    var elem = document.getElementById("fullscreenContainer");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
    setIsFullSc(true)
  }

  function _exitFsc() {
    setIsFullSc(false)
    document.exitFullscreen()
  }


  const handleBChange = ({ target: { level, charging } }) => {
    function renderBatteryBar(level, charging) {
      var htmlStr = ""
      var colorClass = "";
      var batteryClass = ""
      if (level >= 0.7) {
        colorClass = "text-success-c"
        batteryClass = "bi-battery-full"
      }
      else if (0.4 < level && level < 0.7) {
        colorClass = "text-warning"
        batteryClass = "bi-battery-half"
      }
      else {
        colorClass = "text-danger"
        batteryClass = "bi-battery"
      }

      if (charging) {
        htmlStr =
          <><i class={`bi bi-battery-charging ${colorClass}`} style={{ verticalAlign: "middle" }}></i> <span class={colorClass} style={{ fontSize: "1rem;" }}>{Math.round(level * 100)}% </span></>
      } else {
        htmlStr = <><i class={`bi ${batteryClass} ${colorClass}`} style={{ verticalAlign: "middle" }}></i> <span class={colorClass} style={{ fontSize: "1rem;" }}>{Math.round(level * 100)}% {(level <= 0.2 && !charging ? "請充電" : "")} {(level >= 0.95 && charging ? "充電完成" : "")}</span></>
      }
      setCurrentBattery(htmlStr)
    }
    renderBatteryBar(level, charging)
  }

  useEffect(() => {
    let battery;
    navigator.getBattery().then(bat => {
      var battery = bat;
      battery.addEventListener("levelchange", handleBChange);
      battery.addEventListener("chargingchange", handleBChange);
      handleBChange({ target: battery });
    });
    return () => {
      battery.removeEventListener("levelchange", handleBChange);
      battery.removeEventListener("chargingchange", handleBChange);
    };
  }, []);

  function handlekeydown(e) {
    if (e.keyCode === 13 && ShareCodeDisplay) { getTextByCode() }
    if (e.keyCode === 27) {
      _exitFsc()
    }
  }
  useEffect(() => {

    document.addEventListener("onkeydown", handlekeydown);
    return () => {
      document.removeEventListener("onkeydown", handlekeydown);
    }
  }, [])

  function getTimeAndAutoUploadCount() {
    const today = new Date();
    const hour = (today.getHours() < 10 ? `0${today.getHours()}` : today.getHours())
    const mins = (today.getMinutes() < 10 ? `0${today.getMinutes()}` : today.getMinutes())
    setCurrentTime(`${hour}:${mins}`)
    if (autouploadSec > 0) {
      setAutoUploadSec(s => s - 1);
    } else {
      getShareCode()
      setAutoUploadSec(300)
    }
    return `${hour}:${mins}`;
  }

  useEffect(() => {
    var timer = setInterval(() => getTimeAndAutoUploadCount(), 1000)
    return function cleanup() {
      clearInterval(timer)
    }

  });

  function toggleFscWordCount() {
    if (fullscWordCToggle > 1) {
      setfullscWordCToggle(0)
    } else {
      setfullscWordCToggle(o => o + 1)
    }
  }
  function toggleFscCodeDisplay() {
    if (fullscCodeToggle > 0) {
      setfullscCodeToggle(0)
    }
    else {
      setfullscCodeToggle(1)
    }
  }

  return (
    <>
      <div className="App m-3">

        <center>
          <textarea
            ref={textarea}
            value={text}
            onSelect={handleTextareaSelect}
            onTouchEnd={handleTextareaSelect}
            onTouchMove={handleTextareaSelect}

            onChange={(e) => handleTextareaChange(e.target.value)}
            onBlur={(e) => handleTextareaChange(e.target.value)}
            onFocus={(e) => handleTextareaChange(e.target.value)}
            placeholder="輸入文字..."
            style={{ width: `${window.innerWidth - 50}px`, }}
            rows={10}
            className='form-control form-textarea animate-textarea'
            disabled={(msgs === "資料處理中..." || msgs === "正在處理檔案..." || msgs === "正在刷新頁面...")}
          ></textarea>
        </center>

        <p></p>
        <div style={{ textAlign: "left", flexWrap: "wrap" }} className='d-flex'>

          <h3><span className='badge bg-primary'>{isSelected ? "已選取" : ""} {word} 個字</span></h3>&nbsp;
          <h3><span className='badge bg-info'>{isSelected ? "已選取" : ""} {characters} 個字元</span></h3>&nbsp;
          <h3><span className='badge bg-secondary'>{isSelected ? "已選取" : ""} {charactersWithoutSpace} 個字元(不含空白) </span></h3>&nbsp;
        </div>
        <h3><span className='badge bg-success'>{fileName}</span></h3>
        <p style={{ textAlign: "left" }}>{msgs}</p>
        <hr></hr>

        <div className='d-flex'>
          <label htmlFor='uploadFile' className='btn btn-success me-1 btn-lg bi bi-upload'><br></br>上傳</label>
          <button onClick={e => {
            clearWord()
          }} className='btn btn-danger me-1 btn-lg bi bi-trash'><br></br>清除</button>

          <button onClick={e => {
            setShareCodeDisplay(false); setReceiveCodeDisplay(!receiveCodeDisplay)
          }} className='btn btn-info me-1 btn-lg bi bi-cloud-arrow-down-fill' aria-expanded={receiveCodeDisplay}><br></br>接收</button>


          <button className='btn btn-primary bi bi-share btn-lg me-1' aria-expanded={ShareCodeDisplay}
            onClick={e => { setReceiveCodeDisplay(false); setShareCodeDisplay(!ShareCodeDisplay); }}>
            <br></br>分享
          </button>

          <button className='btn btn-dark bi bi-fullscreen btn-lg' aria-expanded={ShareCodeDisplay}
            onClick={e => { openFullscreen() }}>
            <br></br>全螢幕
          </button>
        </div>
      </div>
      <Fade in={ShareCodeDisplay} hidden={!ShareCodeDisplay}>
        <div className='card m-3 p-2'>
          <h3>分享碼</h3>
          <div className='p-2 bg-dark text-white mt-1 mb-1' style={{ width: "fit-content", borderRadius: "5px", letterSpacing: "5px", textAlign: "center" }}><h2 className='m-0 p-0'>{shareCode}</h2></div>
          <p></p>
          <div className='alert alert-info mb-1'>其他裝置輸入分享碼即可取得你的文字內容<br></br>分享碼有效期限為15分鐘，15分鐘內使用不限次數<br></br>另外，也可以使用純文字QR code來分享文字，但請注意過多的內容可能會造成無法掃描</div>
          <p></p>
          <div className='d-flex'>
            <button className='btn btn-primary me-1 mb-1 btn-lg' style={{ width: "fit-content" }} onClick={e => getShareCode()}>取得分享碼</button>
            <button className='btn btn-primary me-1 mb-1 btn-lg' style={{ width: "fit-content" }} onClick={e => getShareCodeStatus()} disabled={Boolean(!Number(shareCode))}>分享碼狀態</button>
          </div>
          <p>{shareCodeData}</p>
          <hr></hr>
          <h3>純文字QR code</h3>
          <QRCode value={TextDecode(text, "utf-8")} size={200}></QRCode>
          <br></br>

        </div>
      </Fade>

      <Fade in={receiveCodeDisplay} hidden={!receiveCodeDisplay}>
        <div className='card m-3 p-2'>
          <h3>接收</h3>
          <input type='number' ref={receiveInput} placeholder='輸入分享碼' className='form-control form-control-lg' style={{ letterSpacing: "5px" }}></input>
          <p></p>
          <div className='alert alert-info'>輸入分享碼即可取得其他裝置的文字內容<br></br>分享碼有效期限為15分鐘，15分鐘內使用不限次數</div>
          <p></p>
          <button className='btn btn-primary btn-lg' style={{ width: "fit-content" }} onClick={(e) => getTextByCode()}>送出</button>


        </div>
      </Fade>
      <input id='uploadFile' hidden type="file" accept='text/plain' onChange={e => readFile(e.target.files)}></input>



      <div id='fullscreenContainer' style={{ display: (isFullSc ? "flex" : "none"), width: "100vw", height: "100vh", flexDirection: "column" }}>
        <div id='FscTool' className='p-1' style={{ display: "flex", justifyContent: "space-between" }}>
          <div className='d-flex' style={{ color: "#fff" }}>
            <Button onClick={(e) => _exitFsc()} className='btn btn-sm btn-secondary me-1 bi bi-fullscreen-exit '>關閉全螢幕</Button>

          </div>
          <div style={{ float: "right", color: "#fff", userSelect: "none" }}>
            <div style={{ display: "inline-block", paddingRight: "1.5rem" }} >
              <span className='badge bg-success' onClick={() => toggleFscCodeDisplay()}>
                {fullscCodeToggle === 0 ? `${autouploadSec > 0 ? `將於${autouploadSec}秒後自動備份` : `自動備份中...`}`
                  : `${Number(shareCode) ? `上次的備份:${shareCode}` : "目前沒有此文件的備份"}`}</span>
            </div>
            <div style={{ display: "inline-block", paddingRight: "1.5rem" }} ><span className={`badge ${fullscWordCToggle === 0 ? "bg-primary" : fullscWordCToggle === 1 ? "bg-info" : "bg-secondary"}`} onClick={() => toggleFscWordCount()}>{isSelected ? "已選取" : ""} {fullscWordCToggle === 0 ? `${word}個字` : fullscWordCToggle === 1 ? `${characters}個字元` : `${charactersWithoutSpace}個字元(不含空白)`}</span></div>
            <div id="timeBar" style={{ display: "inline-block", paddingRight: "1.5rem" }} >{currentTime}</div>
            <div id="batteryBar" style={{ display: "inline-block" }}>{currentBattery}</div>
          </div>
        </div>
        <textarea
          value={text}
          onSelect={handleTextareaSelect}
          onTouchEnd={handleTextareaSelect}
          onTouchMove={handleTextareaSelect}

          onChange={(e) => handleTextareaChange(e.target.value)}
          onBlur={(e) => handleTextareaChange(e.target.value)}
          onFocus={(e) => handleTextareaChange(e.target.value)}
          placeholder="輸入文字..."
          style={{ width: `100%`, height: "98%", background: (isFullSc ? "#000" : "#fff"), color: (isFullSc ? "#fff" : "#000") }}
          ref={textarea}
          className='form-control form-textarea animate-textarea'
          disabled={(msgs === "資料處理中..." || msgs === "正在處理檔案..." || msgs === "正在刷新頁面...")}
        ></textarea>
      </div>
    </>
  );
}


export default App;
