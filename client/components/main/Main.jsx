'use client'

import React from 'react'
import { useState } from 'react';
import styles from "./main.module.css";
import AudioPlayer from 'react-h5-audio-player';
import Paragraphs from '../paragraphs/Paragraphs';
import MainService from '../mainService/MainService';
import 'react-h5-audio-player/lib/styles.css';

const Main = () => {
  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <h1 className={styles.title}>Text Speech Convert</h1>
        <p className={styles.desc}>
          This is a Text and Speech Convert Service.
        </p>
        <p className={styles.desc}>
          You can enter articles and Youtube video links to use our services.
        </p>
      </div>
      <div className={styles.videoContainer}>

      </div>
      <Paragraphs />
      <MainService />
    </div>
  )
}

export default Main