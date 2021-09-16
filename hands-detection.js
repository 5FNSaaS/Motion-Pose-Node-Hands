module.exports = function(RED) {

    function HandsDetectionNode(config) {

        function HTML() {
          const html = String.raw`
          <!DOCTYPE html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
  <title>Hands Detection</title>
  <style>    
		.tooltip {
			position: relative;
			display: inline-block;
		}
		.tooltip .tooltip-content {
			visibility: hidden;
			background-color: rgba(255, 255, 255, 0.8);
			color: black;
			text-align: center;
			position: absolute;
      top: 3px;
      left: 3px;
      padding-left: 15px;
      padding-right: 15px;
      margin-top: 0px;
      border-radius: 10px;
			z-index: 1;
		}
		.tooltip:hover .tooltip-content { visibility: visible; }
    #regist-btn{
      background-color:#B2A1F4;
      border:1px solid grey;
      border-left:none;
      height:21px; 
      color:white;
    }
    #regist-btn:hover{
      background-color: #7557f0;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div align="center" style="min-height: 800px;">
    <h1>Hands Detection Page</h1>
    <div style="display: inline-block;" align="center" class="tooltip">
      <video class="input_video" width="480px" height="270px" crossorigin="anonymous" style="border:3px solid grey"></video><br>
      <div class="tooltip-content">
        <p>Your Camera</p>
      </div>
    </div>
    <div style="display: inline-block;" align="center" class="tooltip">
      <canvas class="output_canvas" width="480px" height="270px" style="border:3px solid #B2A1F4"></canvas><br>
      <div class="tooltip-content">
        <p>Tracking your hands</p>
      </div>
    </div>
    <div>
      <br>
      <input type="text" placeholder="Hands Motion Name"><button id="regist-btn">Regist</button>
    </div>
  </div>  
  <hr>
  <div align="center">
    <a href="https://github.com/5FNSaaS">5FNSaaS</a>
  </div>
</body>
<script type="module">
  const videoElement = document.getElementsByClassName('input_video')[0];
  const canvasElement = document.getElementsByClassName('output_canvas')[0];
  const canvasCtx = canvasElement.getContext('2d');

  const ws = new WebSocket('ws://localhost:1880/ws/handsdetection')
  
  function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 5});
        drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
        ws.send(JSON.stringify(landmarks));
      }
    }
    canvasCtx.restore();
  }

  const hands = new Hands({locateFile: (file) => {
    return 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'+file;
  }});
  hands.setOptions({
    maxNumHands: 2,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  hands.onResults(onResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 480,
    height: 270
  });
  camera.start();
</script>
</html>
          `
          return html
        }

        RED.nodes.createNode(this, config)
        
        this.on('input', (msg, send, done) => {
            msg.payload = HTML()
            
            if (done) {
                done()
            }
            
            send = send || function() { this.send.apply(this, arguments )}
            send(msg)
        })
        
        this.send({ payload: 'this is message from HandsDetectionNode' })
        this.on('close', function() {
        })
    }
    RED.nodes.registerType("hands-detection", HandsDetectionNode)
}