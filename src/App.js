import React, { useState, useRef } from 'react';

const RecordAudio = () => {
  const [recording, setRecording] = useState(false);
  // const [audioURL, setAudioURL] = useState(null);
  const recorderRef = useRef(null);
  const [agentResponse, setAgentResponse] = useState("");
  // const [audioResponse, setAudioResponse] = useState("");

  const handleRecordClick = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = {
      mimeType: 'audio/webm;codecs=opus'
    };
    recorderRef.current = new MediaRecorder(stream, options);
    recorderRef.current.start();
    setRecording(true);
  };

  const handleStopClick = async () => {
    try {
      recorderRef.current.stop();
      recorderRef.current.ondataavailable = async (e) => {
        const audioBlob = new Blob([e.data], { type: 'audio/webm' });
        // setAudioURL(URL.createObjectURL(audioBlob));
  
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        const url = 'http://localhost:8000/getDialogFlowResponseWithAudioOutput'; // Use http:// instead of localhost:
        console.log("Sending request with an audio recording!!")
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const responseBody = await response.json();
          console.log(responseBody);
          setAgentResponse(responseBody.agentResponse);
          const audioResponse = responseBody.audioResponse

          sessionStorage.setItem("key", "value");

          const uint8Array = new Uint8Array(audioResponse.data);
          const arrayBuffer = uint8Array.buffer;
          playOutput(arrayBuffer)
          console.log("Type : " ,typeof arrayBuffer)
          console.log("Length : ", arrayBuffer.byteLength)
        } else {
          console.error(`HTTP error: ${response.status}`);
        }
      };
      setRecording(false);
    } catch (error) {
      console.error(error);
    }
  };

  function playOutput(arrayBuffer){
    // console.log("Entered")
    let audioContext = new AudioContext();
    let outputSource;
    try {
        if(arrayBuffer.byteLength > 0){
            console.log("Audio Detected!!")
            // 2)
            audioContext.decodeAudioData(arrayBuffer,
            function(buffer){
                // 3)
                audioContext.resume();
                outputSource = audioContext.createBufferSource();
                outputSource.connect(audioContext.destination);
                outputSource.buffer = buffer;
                outputSource.start(0);
            },
            function(){
                console.log(arguments);
            });
        }
    } catch(e) {
        console.log(e);
    }
   }
  

  return (
    <div>
      {!recording && (
        <button onClick={handleRecordClick}>Record</button>
      )}
      {recording && <button onClick={handleStopClick}>Stop</button>}
      {agentResponse && (
        <div>
        <p>{agentResponse}</p> {/* this will display the transcription text */}
        {/* <audio controls>
          <source src={audioURL} type="audio/webm" />
        </audio> */}
      </div>
      )}
    </div>
  );
};

export default RecordAudio;
