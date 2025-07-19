import React, { useState, useRef, useEffect } from 'react';

interface RecognitionOptions {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
}

interface SynthesisOptions {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

const SpeechRecognitionComponent: React.FC = () => {
  // 状态管理
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [status, setStatus] = useState<string>('未开始');
  const [synthesisText, setSynthesisText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // 语音识别实例引用
  const recognitionRef = useRef<any | null>(null);
  // 语音合成实例引用
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 初始化语音识别（兼容浏览器前缀）
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('当前浏览器不支持 Web Speech API');
      return;
    }

    // 初始化识别实例
    const recognition = new SpeechRecognition();
    const recognitionOptions: RecognitionOptions = {
      lang: 'zh-CN', // 识别语言：中文
      continuous: true, // 持续监听
      interimResults: true, // 返回中间结果
    };

    // 应用配置
    Object.assign(recognition, recognitionOptions);

    // 识别结果回调
    recognition.onresult = (event: any) => {

      const result = Array.from(event.results)
        .map((res) => (res as SpeechRecognitionResult)[0])
        .map((res) => res.transcript)
        .join('');
      setTranscript(result);
    };

    // 状态回调
    recognition.onstart = () => {
      setIsListening(true);
      setStatus('正在聆听...');
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus('已停止聆听');
      // 如果需要持续监听，可在此处重新启动
      // if (isListening) recognition.start();
    };

    recognition.onerror = (event: any) => {
      setStatus(`识别错误: ${event}`);
      console.error('语音识别错误:', event);
    };

    recognitionRef.current = recognition;

    // 组件卸载时清理
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [isListening]);

  // 开始/停止语音识别
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // 语音合成
  const handleSpeak = () => {
    if (!synthesisText.trim()) {
      setStatus('请输入要朗读的文本');
      return;
    }

    // 取消当前朗读
    window.speechSynthesis.cancel();

    // 配置语音合成
    const utterance = new SpeechSynthesisUtterance(synthesisText);
    const synthesisOptions: SynthesisOptions = {
      lang: 'zh-CN',
      rate: 1, // 语速（0.1-10）
      pitch: 2, // 音调（0-2）
      volume: 1, // 音量（0-1）
    };

    Object.assign(utterance, synthesisOptions);

    // 合成状态回调
    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus('正在朗读...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setStatus('朗读完成');
    };

    utterance.onerror = (event) => {
      setStatus(`朗读错误: ${event.error}`);
      setIsSpeaking(false);
      console.error('语音合成错误:', event);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // 取消朗读
  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setStatus('已取消朗读');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3 style={{
        textAlign: 'center'
      }}>Web Speech API Demo</h3>
      
      {/* 语音识别区域 */}
      <div style={{ marginBottom: '20px' }}>
        <h4>语音识别</h4>
        <button 
          onClick={toggleListening} 
          disabled={!recognitionRef.current}
          style={{ padding: '8px 16px', marginRight: '10px', cursor: 'pointer' }}
        >
          {isListening ? '停止聆听' : '开始聆听'}
        </button>
        <p style={{ color: '#666' }}>{status}</p>
        <div style={{ marginTop: '10px' }}>
          <p>识别结果:</p>
          <textarea
            cols={30}
            rows={10}
            value={transcript}
            readOnly
            style={{ width: '97%', padding: '8px', marginTop: '5px', resize: 'none', margin: '0 auto' }}
            placeholder="语音识别结果将显示在这里..."
          />
        </div>
      </div>

      {/* 语音合成区域 */}
      <div>
        <h4>语音合成</h4>
        <input
          type="text"
          value={synthesisText}
          onChange={(e) => setSynthesisText(e.target.value)}
          placeholder="输入要朗读的文本..."
          style={{ width: '70%', padding: '8px', marginRight: '10px' }}
        />
        <button 
          onClick={handleSpeak} 
          disabled={isSpeaking}
          style={{ padding: '8px 16px', marginRight: '10px', cursor: 'pointer' }}
        >
          开始朗读
        </button>
        <button 
          onClick={handleStopSpeaking} 
          disabled={!isSpeaking}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          停止朗读
        </button>
      </div>
    </div>
  );
};

export default SpeechRecognitionComponent;