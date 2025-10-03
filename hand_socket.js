const camW = 320, camH = 240;
const webcamCanvas = document.getElementById('webcam-canvas');
const resultDiv = document.getElementById('result-div');

let lastLandmarks = [];
window.currentAction = null;
window.visionReady = false;
window.currentActionLeft = null;
window.currentActionRight = null;

// Create Socket.IO connection with reconnection options
const socket = io('ws://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

socket.on('connect', () => {
  console.log('Connected to server');
  window.visionReady = true;
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  window.visionReady = false;
});

socket.on('landmarks', (data) => {
  // Support multi-hand recognition
  if (Array.isArray(data.actions) && Array.isArray(data.landmarks)) {
    if (data.actions.length === 2) {
      // Two hands case
      window.currentActionLeft = data.actions[0] || null;
      window.currentActionRight = data.actions[1] || null;
      window.lastLandmarksLeft = data.landmarks[0] || [];
      window.lastLandmarksRight = data.landmarks[1] || [];
    } else if (data.actions.length === 1) {
      // Single hand case: determine left or right hand based on position
      const handX = data.landmarks[0][0].x;  // Use first keypoint (palm base) to determine position
      if (handX < 0.5) {
        // Left hand
        window.currentActionLeft = data.actions[0];
        window.currentActionRight = null;
        window.lastLandmarksLeft = data.landmarks[0];
        window.lastLandmarksRight = null;
      } else {
        // Right hand
        window.currentActionLeft = null;
        window.currentActionRight = data.actions[0];
        window.lastLandmarksLeft = null;
        window.lastLandmarksRight = data.landmarks[0];
      }
    } else {
      // No hands case
      window.currentActionLeft = null;
      window.currentActionRight = null;
      window.lastLandmarksLeft = null;
      window.lastLandmarksRight = null;
    }
    // Compatible with original lastLandmarks logic (merge all points)
    window.lastLandmarks = [...(window.lastLandmarksLeft || []), ...(window.lastLandmarksRight || [])];
  } else {
    // Compatible with old format data
    window.currentAction = data.action;
    window.currentActionLeft = null;
    window.currentActionRight = data.action;
    window.lastLandmarks = data.landmarks || [];
    window.lastLandmarksLeft = null;
    window.lastLandmarksRight = data.landmarks || [];
  }
  window.visionReady = true;
});

async function startCamera() {
  const video = document.createElement('video');
  video.width = camW;
  video.height = camH;
  video.autoplay = true;
  video.playsInline = true;
  video.style.display = 'none';
  document.body.appendChild(video);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: camW, height: camH } });
    video.srcObject = stream;
    await new Promise(resolve => video.onloadedmetadata = resolve);
    video.play();

    const ctx = webcamCanvas.getContext('2d');
    function drawFrame() {
      ctx.clearRect(0, 0, camW, camH);
      ctx.drawImage(video, 0, 0, camW, camH);
      // Draw keypoints: red for left hand, green for right hand
      if (window.lastLandmarksLeft && window.lastLandmarksLeft.length > 0) {
        ctx.fillStyle = 'red';
        for (const pt of window.lastLandmarksLeft) {
          if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
            ctx.beginPath();
            ctx.arc(pt.x * camW, pt.y * camH, 6, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
      if (window.lastLandmarksRight && window.lastLandmarksRight.length > 0) {
        ctx.fillStyle = 'lime';
        for (const pt of window.lastLandmarksRight) {
          if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
            ctx.beginPath();
            ctx.arc(pt.x * camW, pt.y * camH, 6, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
      requestAnimationFrame(drawFrame);
    }
    drawFrame();

    setInterval(() => {
      if (socket.connected) {  // Only send frames when connected
        ctx.drawImage(video, 0, 0, camW, camH);
        const dataURL = webcamCanvas.toDataURL('image/jpeg', 0.5);
        socket.emit('frame', dataURL);
      }
    }, 60); // Approximately 16fps
  } catch (err) {
    console.error('Error accessing camera:', err);
  }
}

startCamera();

let lastStatus = '';

function draw() {
  // ...game logic...
  if (currentStatus !== lastStatus) {
    document.getElementById('status-div').innerText = currentStatus;
    lastStatus = currentStatus;
  }
} 