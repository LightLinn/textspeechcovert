'use client'

import React from 'react'
import { useRouter } from 'next/navigation';
import { useState, createContext, useContext, useEffect } from 'react';
import { useRunning } from '@/context/RunningContext'
import styles from './paragraphs.module.css';
import Link from "next/link";
import { DataContext } from '@/context/Context';
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { AuthContext } from '@/context/AuthContext';
import { domain } from '@/config';

const Paragraphs = () => {
  const [paragraph, setParagraph] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [recommends, setRecommends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowYT, setIsShowYT] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [url, setUrl] = useState('');
  const [urlInputValue, setUrlInputValue] = useState('');
  const [videoId, setVideoId] = useState('');
  const { setPhrases } = useContext(DataContext);
  const { token } = useContext(AuthContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { isRunning } = useRunning();

  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchParagraphs = async () => {
        try {
            const response = await fetch(`${domain}/api/paragraphs/`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                router.push('/login');
                throw new Error('Network response was not ok');
                
            }
            const data = await response.json();
            setParagraphs(data); // 
        } catch (error) {
            console.error('Fetch error:', error);
        }
      };
      fetchParagraphs();
      
  }, [token, reloadFlag]); 

  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchRecommends = async () => {
      try {
          const response = await fetch(`${domain}/api/recommends/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              router.push('/login');
              throw new Error('Network response was not ok');
              
          }
          const data = await response.json();
          setRecommends(data);
          console.log(recommends)
      } catch (error) {
          console.error('Fetch error:', error);
      }
    };
    fetchRecommends()
  }, [token, reloadFlag])

  const handleSubmit = async (event) => {
    const token = localStorage.getItem('token')
    event.preventDefault();

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!paragraph.trim()) {
      alert("Please input paragraph");
      return; 
    }

    const response = await fetch(`${domain}/api/paragraphs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content: paragraph, user: 1, link: url}),
    });
    const data = await response.json();
    setPhrases(data.phrases)
    setReloadFlag(!reloadFlag);
    setParagraph('')
    setUrl('')
    
  };

  const handleSelectChange = (content, link) => {
    setParagraph(content);
    const id = extractVideoID(link);
    setVideoId(id);
    setIsShowYT(true)
    setUrl(link);
  };

  const handleUrlToText = async (event) => {
    const url = event.target.value;
    setIsLoading(true);
    const id = extractVideoID(url);
    setVideoId(id);
    setUrl(event.target.value);
    setIsShowYT(true)

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${domain}/api/url_to_text/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setParagraph(data.text); 
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to convert URL:', error);
      setErrorMessage('The URL is wrong, please confirm again.');
      setTimeout(() => {
        setErrorMessage(''); // 3秒后清除错误信息
      }, 3000); 
      setParagraph('')
      setUrlInputValue('')
    } finally {
      setIsLoading(false); 
    }
  };

  const extractVideoID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    } else {
      return null;
    }
  };

  return (
    <div className={styles.container}>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.paragraphContainer}>
          <input onChange={handleUrlToText} className={styles.ytinput} type="text" placeholder='Enter Youtube URL' value={url}/>
          {isLoading && <LoadingSpinner />}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <div className={styles.topContainer}>
            <div className={styles.historyContainer}>
              <h3 className={styles.titleH3}>Recommended</h3>
              <ul className={styles.recommendList}>
                {recommends.map((p, index) => (
                  <li className={styles.recommend} key={index} onClick={() => handleSelectChange(p.content, p.link)}>
                    <h4 className={styles.titleH4}>{p.title}</h4>
                    {p.content}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.ytContainer}>
              <div className={styles.ytFrame}>
                
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  ></iframe>
                
              </div>
            </div>
            <div className={styles.historyContainer}>
              <h3 className={styles.titleH3}>History Records</h3>
              <ul className={styles.historyList}>
                {paragraphs.map((p, index) => (
                  <li className={styles.history} key={index} onClick={() => handleSelectChange(p.content, p.link)}>
                    {/* {p.content} */}
                    {p.content.length > 100 ? `${p.content.slice(0, 100)}...` : p.content}
                  </li>
                ))}
              </ul>
              {/* <select
                onChange={handleSelectChange}
                className={styles.historySelection}
                placeholder='History Paragraph'
              >
                <option selected disabled>Select Your History Paragraph</option>
                {paragraphs.map((p, index) => (
                  <option key={index} value={p.content}>{p.content}</option>
                  ))}
              </select> */}
            </div>
          </div>
          <textarea 
            value={paragraph} onChange={(e) => {setParagraph(e.target.value); setUrl('')}}
            cols="30" 
            rows="10" 
            className={styles.textArea} 
            placeholder='or Enter New Paragraph'
            // onFocus={handleFocus}
          ></textarea>
          <button type='submit' className={styles.btn}>Submit</button>
        </div>
      </form>
      
    </div>
  )
}

export default Paragraphs