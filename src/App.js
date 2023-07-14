
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode.react';




function App() {
  const [text, setText] = useState(''); // 追蹤<textarea>的內容
  const [word, setWord] = useState(0); // 算字數
  const [characters, setCharacters] = useState(0); // 算字元數
  const [charactersWithoutSpace, setCharactersWithoutSpace] = useState(0); // 算字元數(不含空白)

  const [fileName, setFileName] = useState("")
  const [msgs, setMsgs] = useState("")

  const [QrDisplay, setQrDisplay] = useState(true)




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
    console.log("rced")
    const inputValue = event;
    setText(inputValue);
    setWord(checkTextLength(inputValue));
    console.log(inputValue.length)
    setCharacters(inputValue.length);
    setCharactersWithoutSpace(countNonSpaceCharacters(inputValue))
    setFileName("")
    setMsgs("")
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

  function formateTextAsUrl(text) {
    return text.replace(/\n/g, '<!b>').replace(/\t/g, '<!t>').replace(/ /g, '<!s>')
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

  function getUrlQrCode() {
    if (characters > 700) {
      return <h2 className='m-3'>字元數太多，無法使用連結</h2>
    } else {
      return (
        <>
          <div className='m-3'> <QRCode value={TextDecode((window.location.href + "?t=" + formateTextAsUrl(text)), "utf-8")} size={200}></QRCode><br></br><h2>網址</h2></div> <br></br>
          <h2 className='m-3'><a href={(window.location.href + "?t=" + formateTextAsUrl(text))}>包含以上文字的連結</a></h2>
        </>
      )
    }
  }

  return (
    <>
      <div className="App m-3">
        <center>
          <textarea
            value={text}
            onChange={(e) => handleTextareaChange(e.target.value)}
            onBlur={(e) => handleTextareaChange(e.target.value)}
            onFocus={(e) => handleTextareaChange(e.target.value)}
            placeholder="輸入文字..."
            style={{ width: `${window.innerWidth - 50}px` }}
            rows={10}
            className='form-control form-textarea animate-textarea'
            disabled={(msgs === "資料處理中..." || msgs === "正在處理檔案..." || msgs === "正在刷新頁面...")}
          ></textarea>
        </center>
        <p></p>
        <div style={{ textAlign: "left" }} className='d-flex'>

          <h3><span className='badge bg-primary'>{word} 個字</span></h3>&nbsp;
          <h3><span className='badge bg-info'>{characters} 個字元</span></h3>&nbsp;
          <h3><span className='badge bg-secondary'>{charactersWithoutSpace} 個字元(不含空白) </span></h3>&nbsp;
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
            setMsgs("正在刷新頁面...")
            window.location.reload()
          }} className='btn btn-info me-1 btn-lg bi bi-arrow-clockwise'><br></br>刷新</button>


          <button className='btn btn-primary bi bi-share btn-lg'
            onClick={e => { setQrDisplay(!QrDisplay); console.log(QrDisplay) }}>
            <br></br>分享
          </button>
        </div>
      </div>
      <div hidden={QrDisplay}>
        <div className='m-3' >
          <div className='m-3'> <QRCode value={TextDecode(text, "utf-8")} size={200}></QRCode><br></br><h2>純文字</h2></div>
          {getUrlQrCode()}
        </div>
      </div>
      <input id='uploadFile' hidden type="file" accept='text/plain' onChange={e => readFile(e.target.files)}></input>

    </>
  );
}


export default App;
