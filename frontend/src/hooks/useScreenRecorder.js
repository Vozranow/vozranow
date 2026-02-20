// import { useState, useRef, useEffect } from "react";

// export const useScreenRecorder = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingBlob, setRecordingBlob] = useState(null);
//   const [error, setError] = useState(null);

//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const streamRef = useRef(null); // Keep track to stop it later

//   const startRecording = async () => {
//     try {
//       setError(null);
      
//       // 2. Get Mic Stream (Listener's Voice)
//       const micStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100,
//         },
//       });


//       // 1. Get Screen Stream (Video + System Audio)
//       // ⚠️ CRITICAL: User MUST check "Share tab audio" in the browser popup
//       const displayStream = await navigator.mediaDevices.getDisplayMedia({
//         video: { 
//           width: { ideal: 1920 }, // 1080p
//           height: { ideal: 1080 }, 
//           frameRate: 30 
//         },
//         audio: {
//             echoCancellation: true, 
//             noiseSuppression: true,
//             sampleRate: 44100
//         }, 
//       });

//       // 3. 🎛️ MIX THE AUDIO TRACKS (The Magic Part)
//       const audioContext = new AudioContext();
//       const destination = audioContext.createMediaStreamDestination();

//       // Add System Audio (if they shared it)
//       if (displayStream.getAudioTracks().length > 0) {
//         const systemSource = audioContext.createMediaStreamSource(displayStream);
//         // GainNode to adjust volume if needed (optional, keeping it simple here)
//         systemSource.connect(destination);
//       } else {
//         console.warn("System audio not shared! You won't hear the user.");
//       }

//       // Add Mic Audio
//       if (micStream.getAudioTracks().length > 0) {
//         const micSource = audioContext.createMediaStreamSource(micStream);
//         micSource.connect(destination);
//       }

//       // 4. Create Final Combined Stream
//       // We take the Video from the screen, and the Audio from our mixer
//       const mixedStream = new MediaStream([
//         ...displayStream.getVideoTracks(),
//         ...destination.stream.getAudioTracks(),
//       ]);
      
//       streamRef.current = mixedStream;

//       // 5. Setup Recorder
//       const mediaRecorder = new MediaRecorder(mixedStream, {
//         mimeType: 'video/webm;codecs=vp9', // High quality, small size
//         videoBitsPerSecond: 2500000 // 2.5 Mbps (Crisp HD)
//       });

//       mediaRecorderRef.current = mediaRecorder;
//       chunksRef.current = [];

//       // Event: Data Available (Recording happening)
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           chunksRef.current.push(event.data);
//         }
//       };

//       // Event: Stop (Cleanup & Save)
//       mediaRecorder.onstop = () => {
//         // A. Create the Blob
//         const blob = new Blob(chunksRef.current, { type: "video/webm" });
//         setRecordingBlob(blob);
        
//         // B. 🛡️ SAFETY NET: Auto-Download to their Device
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         document.body.appendChild(a);
//         a.style = "display: none";
//         a.href = url;
//         a.download = `solance-session-${Date.now()}.webm`; 
//         a.click(); 
        
//         // Cleanup URL object
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);

//         // C. Stop all tracks (Turn off the Red Dot 🔴)
//         mixedStream.getTracks().forEach(track => track.stop());
//         displayStream.getTracks().forEach(track => track.stop());
//         micStream.getTracks().forEach(track => track.stop());
        
//         setIsRecording(false);
//       };

//       // Handle if user clicks "Stop Sharing" native browser button
//       // This is the little floating bar at the bottom
//       displayStream.getVideoTracks()[0].onended = () => {
//         stopRecording();
//       };

//       // Start Recording (save chunk every 1 second)
//       setTimeout(() => {
//         mediaRecorder.start(1000); 
//         setIsRecording(true);
//       }, 500);

//     } catch (err) {
//       console.error("Error starting screen record:", err);
//       setError("Failed to start recording. Please ensure you allow permissions.");
//       setIsRecording(false);
//       throw err;
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
//       mediaRecorderRef.current.stop();
//     }
//   };

//   return {
//     isRecording,
//     recordingBlob,
//     startRecording,
//     stopRecording,
//     error
//   };
// };



import { useState, useRef } from "react";

export const useScreenRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecording = async () => {
    // 1. Declare streams outside the try block for error cleanup
    let micStream = null;
    let displayStream = null;

    try {
      setError(null);
      
      // 2. Get Mic Stream FIRST (Keeps the user on your app for the popup)
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });

      // 3. Get Screen Stream SECOND (Now Chrome can jump them away)
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: 30 },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }, 
      });

      // 4. 🎛️ MIX THE AUDIO TRACKS
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      if (displayStream.getAudioTracks().length > 0) {
        const systemSource = audioContext.createMediaStreamSource(displayStream);
        systemSource.connect(destination);
      } else {
        console.warn("System audio not shared! You won't hear the user.");
      }

      if (micStream.getAudioTracks().length > 0) {
        const micSource = audioContext.createMediaStreamSource(micStream);
        micSource.connect(destination);
      }

      // 5. Create Final Combined Stream
      const mixedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);
      
      streamRef.current = mixedStream;

      // 6. Setup Recorder
      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'video/webm;codecs=vp9', 
        videoBitsPerSecond: 2500000 
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordingBlob(blob);
        
        // Auto-Download to Device
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = `solance-session-${Date.now()}.webm`; 
        a.click(); 
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Turn off all hardware tracks (Kill the Red Dot 🔴)
        mixedStream.getTracks().forEach(track => track.stop());
        displayStream.getTracks().forEach(track => track.stop());
        micStream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
      };

      // 🛑 TRIPWIRE: Listen for the native browser "Stop Sharing" button
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // 🏃‍♂️ FIX: Audio Race Condition (Wait 500ms before starting)
      setTimeout(() => {
        mediaRecorder.start(1000); 
        setIsRecording(true);
      }, 500);

    } catch (err) {
      console.error("Error starting screen record:", err);
      setError("Failed to start recording. Please ensure you allow permissions.");
      setIsRecording(false);
      
      // 🧟‍♂️ FIX: Zombie Mic Cleanup! 
      // If they cancelled the screen share, turn off the mic immediately.
      if (micStream) micStream.getTracks().forEach(track => track.stop());
      if (displayStream) displayStream.getTracks().forEach(track => track.stop());

      // Throw back to LobbyPage so it halts the socket emit
      throw err;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    recordingBlob,
    startRecording,
    stopRecording,
    error
  };
};