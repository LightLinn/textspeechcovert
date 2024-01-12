'use client'

import React, { useContext, useState, useRef,  useEffect, useCallback} from 'react';
import { DataContext } from '@/context/Context';
import styles from './mainService.module.css';
import AudioPlayer from 'react-h5-audio-player';
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import RecordAnimation from '../recordAnimation/RecordAnimation';
import { AuthContext } from '@/context/AuthContext';
import { resolve } from 'styled-jsx/css';

const MainService = () => {

  const { phrases } = useContext(DataContext);
  const { token } = useContext(AuthContext);
  const [ phrase , setPhrase ] = useState([])
  const [ wrongWord , setWrongWord ] = useState('')
  const [tokenSave, setTokenSave] = useState('')
  const [audioUrl, setAudioUrl] = useState('');
  const [wrongList, setWrongList] = useState([]);
  const [corrList, setCorrList] = useState([]);
  const [reviseList, setReviseList] = useState([])
  const [isRevising, setIsRevising] = useState(false)
  const [isReviseMode, setIsReviseMode] = useState(false)
  const [currWrongData, setCurrWrongData] = useState('');
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  // const [isWaiting, setIsWaiting] = useState(false)
  const [rate, setRate] = useState(0.8);
  const [text, setText] = useState('');
  const [ show, setShow ] = useState(false)

  const currPhrasesIndex = useRef(0)
  const currPhraseId = useRef(0);
  const currPhrase = useRef('')
  const currWrongList = useRef([])
  const currWrongWord = useRef()
  const currRevising = useRef(false)
  const comment = useRef('')
  const newReviseList = useRef([])
  const audioRef = useRef(null);
  const count = useRef(0)
  const duration = useRef(0);
  const isRunning = useRef(false)
  const isWaiting = useRef(false)
  const isWaiting2 = useRef(false)
  const isWaiting3 = useRef(false)

  const domain = 'http://localhost:8000';
  // const domain = 'https://thundercreation.com/textspeechcovert';
  

  // useEffect(() => {
  //   if (isAnalyzing || isRecording) {
  //     setIsWaiting(true)
  //   } else if (!isAnalyzing && !isRecording) {
  //     setIsWaiting(false)
  //   }
  //   console.log(isWaiting)
  // }, [isAnalyzing, isRecording]);

  useEffect(() => {
    if (token) {
      setTokenSave(token)
    }
  }, [token]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [audioUrl]);
  
  // useEffect(() => {
  //   currPhraseId.current = phrases[currPhraseIndex].id;
  //   console.log(phrases[currPhraseIndex].id)
  // });
  
  useEffect(() => {
    if (wrongList) {
      console.log("wrongList 更新了:", wrongList);
      
    }
  }, [wrongList]);

  useEffect(() => {
    let stream;
    
    const initMediaRecorder = () => {

      return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(newStream => {
        stream = newStream;
        const recorder = new MediaRecorder(stream);
        
        let audioChunks = [];
        
        recorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
  
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            setAudioData(audioBlob);
  
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.play();
            audio.onended = () => {
              sendAudioToServer(audioBlob).then(() => {
                initMediaRecorder();
              });
            };
            audioChunks = [];
          };
          setMediaRecorder(recorder);
        })
        .catch(error => console.error('Audio Error:', error));
    };
  
    initMediaRecorder();

    if (!isRunning.current) {
      return
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAudioEnded = () => {
    if (mediaRecorder && mediaRecorder.state !== "recording") {
      setIsRecording(true);
      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false)
      }, (duration.current+2)*1000);
      // console.log((duration.current+2)*1000)
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);


  const sendPhrase = () => {
    count.current = 0
    currPhrasesIndex.current = Number(event.target.value)
    currPhraseId.current = phrases[currPhrasesIndex.current].id
    currPhrase.current = phrases[currPhrasesIndex.current].content
  }

  const sendNextPhrase = () => {
    const newPhraseIndex = currPhrasesIndex.current + 1;
    if (newPhraseIndex >= phrases.length){
      alert('Finish')
      isRunning.current = false;
      isWaiting.current = false;
      setShow(false)
    } else {
      currPhrasesIndex.current = newPhraseIndex;
      currPhraseId.current = phrases[currPhrasesIndex.current].id;
      currPhrase.current = phrases[currPhrasesIndex.current].content;
      currWrongList.current = []
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
          audio.play();
      } else {
          audio.pause();
      }
    }
  };

  const changeSpeed = (speed) => {
    if (audioRef.current) {
        audioRef.current.playbackRate = speed;
        console.log('here');
        count.current = count.current + 1;
    } 
  };

  const handleAudioRequest = async (newPhrase, newPhraseId=null, rate=1) => {
    try {
        const response = await fetch(`${domain}/api/phrases/text_to_speech/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phrase: newPhrase, phraseId: newPhraseId})
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        };

        const blob = await response.blob();
        // duration.current = Number(response.headers.get('X-Duration'));
        const audioUrl = URL.createObjectURL(blob);
        const pramAudio = new Audio('pram.mp3');
        return new Promise((resolve, reject) => {
          
          pramAudio.play();
          pramAudio.onended = () => {
            const phraseAudio = new Audio(audioUrl);
            phraseAudio.addEventListener('loadedmetadata', () => {
              duration.current = phraseAudio.duration; // 音频长度（秒）
            });
            phraseAudio.playbackRate = rate;
            phraseAudio.play();
            phraseAudio.onended = () => {
              handleAudioEnded()
              resolve();
            }}
          })

    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    setIsAnalyzing(true)
    const formData = new FormData();
    const token = localStorage.getItem('token')

    formData.append('audio', audioBlob);
    formData.append('phraseId', currPhraseId.current);
    // formData.append('phrase', currPhrase.current);

    try {
      const response = await fetch(`${domain}/api/audio_to_results/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
      },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Server respone:', data);
      setWrongList(data.wrong_list || []);
      isWaiting.current = false
      isWaiting2.current = false
      isWaiting3.current = false
      currWrongList.current = data.wrong_list || []
      setCorrList(data.corr_list || ['']);
      setAudioData(null);
      setMediaRecorder(null);

      // if (tryCount === 0) {
      //   const newPhrase = phrases[currPhraseIndex].content;
      //   handleAudioRequest(newPhrase)
      // }
      
      
    } catch (error) {
      console.error('Error:', error);
    }
    if (!isRunning.current) {
      setShow(false)
    }
    setIsAnalyzing(false)
  };

  const reviseMode = () => {
    setReviseList(wrongList);
    setIsReviseMode(true)
  }

  const reviseWrongList = async () => {
    // if (!hasReviseListBeenInitialized) {
    //   setReviseList(wrongList);
    //   setHasReviseListBeenInitialized(true);
    // }

    if (reviseList.length > 0) {
      setIsRevising(true);
      const wrongData = reviseList[0];
      
      setCurrWrongData(wrongData)
      await handleAudioRequest(wrongData)
      setReviseList(prevList => prevList.slice(1));
      
    } else {
      setIsRevising(false)
      setWrongList([])
      sendNextPhrase()
    }
  };

  const cleanWord = (word) => {
    word = word.toLowerCase();
    word = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g, "");
    return word
  };

  const wordColor = (word) => {
    const cleanedWord = cleanWord(word);
    if (wrongList.includes(cleanedWord)) {
      return 'red';
    } else if (corrList.includes(cleanedWord)) {
      return 'green';
    } else {
      return 'black';
    }
  };

  const commentColor = (comment) => {
    
    if (wrongList.length > 0) {
      return 'red';
    } else {
      return 'green';
    }
  };

  const fetchWordInfo = async (word) => {
    try {
      const response = await fetch(`${domain}/api/word_info/?word=${word}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error("Error fetching word info:", error);
      return null; 
    }
  };
  
  const handleWordClick = async (word) => {
    setIsLoading(true);
    const wordInfo = await fetchWordInfo(word);
    setIsLoading(false);
    alert(wordInfo)
  };

  const recordingAnimation = (
    <RecordAnimation />
  );

  function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  const run = async (event) => {
    isRunning.current = true;
    setShow(true)
    count.current = 0
    currPhrasesIndex.current = Number(event.target.value)
    currPhraseId.current = phrases[currPhrasesIndex.current].id
    currPhrase.current = phrases[currPhrasesIndex.current].content
    setPhrase(currPhrase.current)
    console.log(phrase)

      while (isRunning.current) {
        console.log(count.current)
        if (isWaiting.current) {
          await delay(3000);
          console.log('wait')
          continue
        } else {

          try {
            if (count.current === 0) {
              await handleAudioRequest(currPhrase.current, currPhraseId.current);
              count.current = count.current + 1
              isWaiting.current = true
            } else if (count.current === 1) {
              if (!isRunning.current) {
                break;
              }
              if (currWrongList.current.length > 0) {
                // comment.current = ''
                console.log(currWrongList.current)
                await handleAudioRequest(currPhrase.current, currPhraseId.current, rate);
                count.current = count.current + 1
                isWaiting.current = true
              } else {
                // comment.current = 'Good job!'
                count.current = 99999
                isWaiting.current = false
              }
              
            } else if (count.current > 1 && count.current < 9999) {
              if (currWrongList.current.length > 0) {
                newReviseList.current = [...currWrongList.current]
                console.log(newReviseList)
                console.log(currWrongList.current)
                while (newReviseList.current.length >= 0) {
                  currRevising.current = true
                  if (isWaiting2.current) {
                    console.log('waiting')
                    await delay(3000);
                    continue
                  } else if (!isRunning.current) {
                    break;
                  } else if (newReviseList.current.length === 0) {
                    count.current =  9999
                    console.log(count.current)
                    currWrongList.current = []
                    setWrongList([])
                    isWaiting.current = false
                    isWaiting2.current = false
                    currRevising.current = false
                    //comment.current = ''
                    break

                  } else {
                    const wrongData = newReviseList.current[0];
                    currWrongWord.current = wrongData;
                    setWrongWord(wrongData)
                    await handleAudioRequest(wrongData);
                    isWaiting2.current = true
                    newReviseList.current = newReviseList.current.slice(1);
                    console.log(newReviseList.current)
                  }
                } 
                
              } else {
                count.current = 99999
                isWaiting.current = false
              }

            } else if (count.current === 9999) {
              await handleAudioRequest(currPhrase.current, currPhraseId.current);
              isWaiting.current = true
              count.current = 99999
            } else if (count.current === 99999) {
              sendNextPhrase()
              count.current = 0
            } else if (!isRunning.current) {
              break;
            } else {
              sendNextPhrase()
            } 
          } catch (error) {
            console.error('錯誤:', error);
          }
        }
      }
    isRunning.current = false
    isWaiting.current = false
    comment.current = ''
  }
  

  const stopRunning = () => {
    isRunning.current = false;
    isWaiting.current = false;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.serviceContainer}>
        <div className={styles.phraseContainer}>
          <select
            // value={phrases[currPhrase].id}
            onChange={(event) => run(event)}
            multiple
            disabled={show}
            className={styles.phraseSelection}
          >
            {phrases && phrases.map((item, index) => (
              <option key={item.id} value={index} className={styles.optionBlock}>
                {item.content}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.audioContainer}>
          {/* <AudioPlayer
            src={audioUrl}
            autoPlay
            onEnded={handleAudioEnded}
            ref={audioRef}
          /> */}
          {/* <audio 
            className={styles.audioPlayer}
            ref={audioRef} 
            controls
            autoPlay
            onEnded={handleAudioEnded}>
            <source src={audioUrl} type="audio/mpeg" />
          </audio> */}
        </div>
        { show && (
          <button
            className={`${styles.btn2} ${styles.btn2_next}`}
            onClick={stopRunning}
          >Stop
          </button>
        )}
      </div>
      {isRecording && recordingAnimation}
      {isAnalyzing && <LoadingSpinner />}
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle} style={{color: commentColor(comment.current)}}>
          {comment.current}
        </h2>
        <div className={styles.results}>
          {!currRevising.current && (
            <>
            
              {phrases[currPhrasesIndex.current].content.split(' ').map((word, index) => ( 
              <span 
                onClick={() => handleWordClick(word)}
                className={styles.resultsSpacing} 
                key={index}
                style={{ color: wordColor(word) }}>
                {word}
              </span>
              ))}
            </>
          )}
          {currRevising.current && (
            <>
              {newReviseList.current && (
                <div className={styles.reviseContainer} style={{ color: wordColor(currWrongWord.current) }}>
                  {currWrongWord.current}
                </div>
              )}
            </>
          )}
        </div>
        {isLoading && <LoadingSpinner />}
        <div className={styles.tips} >Click on the word to call ChatGPT.</div>
        {/* <button 
          className={`${styles.btn2} ${styles.btn2_next}`}
          onClick={sendNextPhrase}
        >Next</button> */}
      </div>
    </div>
  )
}

export default MainService