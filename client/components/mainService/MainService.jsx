'use client'

import React, { useContext, useState, useRef,  useEffect} from 'react';
import { DataContext } from '@/context/Context';
import styles from './mainService.module.css';
import AudioPlayer from 'react-h5-audio-player';
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import Image from "next/image";
import RecordAnimation from '../recordAnimation/RecordAnimation';
import { AuthContext } from '@/context/AuthContext';

const MainService = () => {

  const { phrases } = useContext(DataContext);
  const { token } = useContext(AuthContext);
  const [tokenSave, setTokenSave] = useState('')
  const [currPhraseIndex, setCurrPhraseIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [tryCount, setTryCount] = useState(0);
  const [wrongList, setWrongList] = useState([]);
  const [reviseList, setReviseList] = useState([])
  const [isRevising, setIsRevising] = useState(false)
  const [isReviseMode, setIsReviseMode] = useState(false)
  const [currWrongData, setCurrWrongData] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [rate, setRate] = useState(0.8)

  const currPhraseId = useRef(0);
  const audioRef = useRef(null);

  

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
  
  useEffect(() => {
    currPhraseId.current = phrases[currPhraseIndex].id;
    console.log(phrases[currPhraseIndex].id)
  });
  
  useEffect(() => {
    if (wrongList && wrongList.length > 0) {
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
                setTryCount(prevCount => prevCount + 1);
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

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const sendPhrase = (event) => {
    setTryCount(prevCount => prevCount * 0);
    const newPhraseIndex = Number(event.target.value);
    setCurrPhraseIndex(newPhraseIndex);
    const newPhrase = phrases[newPhraseIndex].content;
    handleAudioRequest(newPhrase);

    
  }

  const sendNextPhrase = () => {
    const newPhraseIndex = currPhraseIndex + 1
    // console.log(typeof currPhraseIndex)
    // console.log(currPhraseIndex)
    // console.log(typeof newPhraseIndex)
    // console.log(phrases.length)
    if (newPhraseIndex >= phrases.length){
      alert('Finish')
      setTryCount(prevCount => prevCount * 0);
    } else {
      const newPhrase = phrases[newPhraseIndex].content;
      setCurrPhraseIndex(newPhraseIndex);
      handleAudioRequest(newPhrase);
      setTryCount(prevCount => prevCount * 0);
    }
  }

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
        togglePlayPause()
        setTryCount(prevCount => prevCount + 1);
        
    }
  };

  const handleAudioRequest = async (newPhrase, rate=1) => {
    try {
        const response = await fetch('https://thundercreation.com/api/phrases/text_to_speech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phrase: newPhrase, rate: rate })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
        
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleAudioEnded = () => {
    if (mediaRecorder && mediaRecorder.state !== "recording") {
      setIsRecording(true);
      mediaRecorder.start();

      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 3000); // 15秒后停止录音
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    setIsAnalyzing(true)
    const formData = new FormData();
    const token = localStorage.getItem('token')

    formData.append('audio', audioBlob);
    formData.append('phraseId', currPhraseId.current);
    try {
      const response = await fetch('https://thundercreation.com/api/audio_to_results/', {
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
      setWrongList(data.wrong_list || ['']);
      setAudioData(null);
      setMediaRecorder(null);
      
    } catch (error) {
      console.error('Error:', error);
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
      setIsRevising(true)
      const wrongData = reviseList[0];
      
      setCurrWrongData(wrongData)
      await handleAudioRequest(wrongData)
      setReviseList(prevList => prevList.slice(1));
      // call handleAudioRequest，wronglist reviseList，有互打問題，要調整
    } else {
      setIsRevising(false)
      setWrongList([])
      sendNextPhrase()
    }
  };

  const cleanWord = (word) => {
    word = word.toLowerCase();
    word = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    return word
  };

  const wordColor = (word) => {
    const cleanedWord = cleanWord(word);
    if (wrongList.includes(cleanedWord)) {
      return 'red';
    } else {
      return 'green';
    }
  };

  const fetchWordInfo = async (word) => {
    try {
      const response = await fetch(`https://thundercreation.com/api/word_info/?word=${word}`);
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
  
  return (
    <div className={styles.container}>
      <div className={styles.serviceContainer}>
        <div className={styles.phraseContainer}>
          <select 
            // value={phrases[currPhrase].id}
            onChange={(event) => sendPhrase(event)}
            multiple 
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
          <audio 
            className={styles.audioPlayer}
            ref={audioRef} 
            controls
            autoPlay
            onEnded={handleAudioEnded}>
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        </div>
      </div>
      {isRecording && recordingAnimation}
      {isAnalyzing && <LoadingSpinner />}  
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle}>
          Identification Results
        </h2>
        <div className={styles.results}>
          {!isRevising && (
            <>
              {phrases[currPhraseIndex].content.split(' ').map((word, index) => (
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
          {isRevising && (
            <>
              {reviseList && (
                <div className={styles.reviseContainer} style={{ color: wordColor(currWrongData) }}>
                  {currWrongData}
                </div>
              )}
            </>
          )}
          
        </div>
        
        {isLoading && <LoadingSpinner />}
        <div className={styles.tips} >Click on the word to call ChatGPT.</div>
        {tryCount === 1 && wrongList.length > 0 && (
          <button 
          className={`${styles.btn2} ${styles.btn2_repeat}`}
          onClick={() => changeSpeed(rate)}
          >Repeat</button>
          )}
        {tryCount > 1 && wrongList.length > 0 && (
          <>
          {isReviseMode ? 
            <button 
              className={`${styles.btn2} ${styles.btn2_revise}`}
              onClick={reviseWrongList}
            >Revise Next</button> :
            <button 
              className={`${styles.btn2} ${styles.btn2_revise}`}
              onClick={reviseMode}
            >ReviseMode</button>
          }
          </>
          )}
          <button 
            className={`${styles.btn2} ${styles.btn2_next}`}
            onClick={sendNextPhrase}
          >Next</button>
        
      </div>
    </div>
  )
}

export default MainService