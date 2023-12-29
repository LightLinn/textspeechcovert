import React from 'react'
import styles from './recordAnimation.module.css';

const RecordAnimation = () => {
  return (
    <div class={styles.recordingAnimationContainer}>
      <p>Repeat this sentence.</p>
      <div class={styles.soundwaveContainer}>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
        <div class={styles.bar}></div>
      </div>
    </div>
  )
}

export default RecordAnimation