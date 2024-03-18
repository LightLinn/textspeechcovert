'use client'

import React from 'react'
import { useState } from 'react';
import styles from "./main.module.css";
import AudioPlayer from 'react-h5-audio-player';
import Paragraphs from '../paragraphs/Paragraphs';
import MainService from '../mainService/MainService';
import 'react-h5-audio-player/lib/styles.css';
import { domain } from '@/config';

const Main = () => {
  const [key, setKey] = useState(0);

  const reloadMainService = () => {
    setKey(prevKey => prevKey + 1); // 更新key状态以重新挂载MainService组件
  };

  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>Easy Talk with MoMoGo</h1>
        <p className={styles.desc}>
          Enter a phrase or Youtube URL and speak after me:
        </p>
        <p className={styles.desc}>
          請輸入英文句子或Youtube連結之後跟著我說：
        </p>
      </div>
      <div className={styles.videoContainer}>

      </div>
      <Paragraphs />
      <MainService key={key} />
      <button onClick={reloadMainService}>Reload Main Service</button>
    </div>
  )
}

export default Main