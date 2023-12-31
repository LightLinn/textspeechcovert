import React from 'react'
import { useRouter } from 'next/navigation';
import { useState, createContext, useContext, useEffect } from 'react';
import styles from './paragraphs.module.css';
import { DataContext } from '@/context/Context';
import LoadingSpinner from '@/components/loading/LoadingSpinner'
import { AuthContext } from '@/context/AuthContext';

const Paragraphs = () => {
  const [paragraph, setParagraph] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(false);
  const { setPhrases } = useContext(DataContext);
  const { token } = useContext(AuthContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  const domain = 'http://localhost:8000';
    // const domain = 'https://thundercreation.com/textspeechcovert';

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
      body: JSON.stringify({ content: paragraph, user: 1}),
    });
    const data = await response.json();
    setPhrases(data.phrases)
    setReloadFlag(!reloadFlag);
    setParagraph('')
  };

  const handleSelectChange = (event) => {
    setParagraph(event.target.value);
  };

  const handleUrlToText = async (event) => {
    const url = event.target.value;
    console.log('send url')
    setIsLoading(true);

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
    } catch (error) {
      console.error('Failed to convert URL:', error);
      setParagraph('Invalid YouTube URL')
    } finally {
      setIsLoading(false); 
    }
  };

  const handleFocus = () => {
    setParagraph('');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.paragraphContainer}>
          <select 
            onChange={handleSelectChange}
            className={styles.historySelection} 
            placeholder='History Paragraph'
          >
            <option selected disabled>Select Your History Paragraph</option>
            {paragraphs.map((p, index) => (
              <option key={index} value={p.content}>{p.content}</option>
              ))}
          </select>
          <input onChange={handleUrlToText} className={styles.ytinput} type="text" placeholder='or Enter Youtube URL' />
          {isLoading && <LoadingSpinner />}
          <textarea 
            value={paragraph} onChange={(e) => setParagraph(e.target.value)}
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