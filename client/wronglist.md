import React, { useState } from 'react';

const YourComponent = () => {
  const [dataList, setDataList] = useState(["string1", "string2", "string3"]); // 初始数组
  const [result, setResult] = useState(null); // 存储后端返回的结果

  const sendDataToBackend = async (data) => {
    try {
      const response = await fetch('/api/your-backend-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to send data to backend:', error);
    }
  };

  const handleClick = () => {
    if (dataList.length > 0) {
      const dataToSend = dataList[0];
      sendDataToBackend(dataToSend).then((backendResult) => {
        // 更新结果状态并从数组中移除已发送的元素
        setResult(backendResult);
        setDataList(prevList => prevList.slice(1));
      });
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Send First Item</button>
      <h1>Results from Backend</h1>
      {result && <p>{result}</p>}
      {/* 其他组件内容 */}
    </div>
  );
};

export default YourComponent;
