from flask import Flask
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import mediapipe as mp
import base64

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent', max_http_buffer_size=100_000_000)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2)

def classify_hand_action(landmarks):
    if not landmarks or len(landmarks) != 21:
        return {'action': None, 'handType': None, 'region': None}
    
    # Calculate palm center point
    palm = landmarks[0]
    
    # Calculate finger extension state
    tip_idx = [8, 12, 16, 20]  # Index, middle, ring, and pinky finger tip indices
    open_fingers = 0
    for idx in tip_idx:
        tip = landmarks[idx]
        dx = tip['x'] - palm['x']
        dy = tip['y'] - palm['y']
        dist = (dx**2 + dy**2) ** 0.5
        if dist > 0.2:  # Adjusting this threshold may affect recognition sensitivity
            open_fingers += 1
    
    # Detect scissors gesture - modified to detect vertical scissors gesture
    # Index and middle finger tips
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    # Index and middle finger bases
    index_mcp = landmarks[5]
    middle_mcp = landmarks[9]
    # Ring and pinky finger tips
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]
    # Ring and pinky finger bases
    ring_mcp = landmarks[13]
    pinky_mcp = landmarks[17]
    
    # Check if index and middle fingers are extended vertically (pointing up)
    index_extended = ((index_tip['y'] < index_mcp['y'] - 0.1) and 
                      (abs(index_tip['x'] - index_mcp['x']) < 0.08))
    middle_extended = ((middle_tip['y'] < middle_mcp['y'] - 0.1) and 
                       (abs(middle_tip['x'] - middle_mcp['x']) < 0.08))
    
    # Check if ring and pinky fingers are bent
    ring_bent = ring_tip['y'] > ring_mcp['y']
    pinky_bent = pinky_tip['y'] > pinky_mcp['y']
    
    # Determine if it's a vertical scissors gesture
    is_scissors = index_extended and middle_extended and (ring_bent or pinky_bent)
    
    # Determine gesture type based on number of extended fingers
    if is_scissors:
        hand_type = 'scissors'
    else:
        hand_type = 'paper' if open_fingers >= 3 else 'rock'
    
    # Determine hand position (upper or lower half)
    region = 'upperHalf' if palm['y'] < 0.6 else 'lowerHalf'  # Adjusted to 0.5 as midline
    
    # Determine action type
    if hand_type == 'rock' and region == 'upperHalf':
        action = 'upperattack'
    elif hand_type == 'rock' and region == 'lowerHalf':
        action = 'lowerattack'
    elif hand_type == 'paper' and region == 'upperHalf':
        action = 'upperdefense'
    elif hand_type == 'paper' and region == 'lowerHalf':
        action = 'lowerdefense'
    elif hand_type == 'scissors':
        action = 'scissors'  # Simplified to one scissors gesture, not distinguishing upper/lower position
    else:
        action = None
    
    return {
        'action': action,
        'handType': hand_type,
        'region': region,
        'position': {'x': palm['x'], 'y': palm['y']}
    }

@socketio.on('frame')
def handle_frame(data):
    img_data = data.split(',')[1]
    img_bytes = base64.b64decode(img_data)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = hands.process(img_rgb)
    
    all_landmarks = []
    all_actions = []
    
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Extract keypoints for single hand
            hand_landmarks_list = []
            for lm in hand_landmarks.landmark:
                hand_landmarks_list.append({'x': lm.x, 'y': lm.y, 'z': lm.z})
            all_landmarks.append(hand_landmarks_list)
            
            # Classify action for single hand
            action_result = classify_hand_action(hand_landmarks_list)
            all_actions.append(action_result['action'])
    
    # Send all hand keypoints and actions
    emit('landmarks', {
        'landmarks': all_landmarks,
        'actions': all_actions
    })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000) 