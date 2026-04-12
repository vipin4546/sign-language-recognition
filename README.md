# Hand Gesture Based Sign Language Recognition System

> Real-time ASL finger-spelling recognition using your webcam — no special hardware required.



---

## Screenshots

| Landing Page | Live Demo UI |
|---|---|
|<img width="1470" height="956" alt="Screenshot 2026-04-11 at 6 01 42 PM" src="https://github.com/user-attachments/assets/6e611ae4-dc3d-4c79-9da5-f1f08ce9e6d1" /> | <img width="1470" height="956" alt="Screenshot 2026-04-11 at 6 03 24 PM" src="https://github.com/user-attachments/assets/0e8a6a4b-c36a-449b-a9f8-5d0e569426ec" /> 


| MediaPipe Landmarks | Model Training |
|---|---|
| <img width="1470" height="956" alt="Screenshot 2026-04-11 at 5 36 25 PM" src="https://github.com/user-attachments/assets/109afd9b-6c57-4428-a670-2a08a857816c" /> | <img width="1470" height="956" alt="Screenshot 2026-04-11 at 6 05 25 PM" src="https://github.com/user-attachments/assets/89888e5e-45da-4cfe-96ae-73f60e79e4e5" />
|

---

## What It Does

This system lets you type text using only hand gestures — point your webcam at your hand, hold an ASL gesture for 2 seconds, and the letter gets typed automatically. When a sentence is complete, the Web Speech API reads it aloud.

**Supports 30 gestures:**
- A–Z (26 letters)
- Space, Backspace, FullStop, NewLine

---

## How It Works

```
Webcam Frame (JPEG)
        ↓
MediaPipe Hands — 21 landmarks × (x, y, z) = 63 features
        ↓
TensorFlow Dense Neural Network — 30-class classification
        ↓
Confidence Filter (≥ 0.70) + Majority Vote Smoothing (last 5 frames)
        ↓
Hold-to-Confirm Logic (2 seconds hold + 0.8s cooldown)
        ↓
Text Output + Web Speech API (TTS)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python, Uvicorn |
| ML Model | TensorFlow / Keras (Dense MLP) |
| Hand Tracking | MediaPipe Hands |
| Communication | WebSocket (real-time) |
| TTS | Web Speech API (browser built-in) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## Model Details

| Property | Value |
|---|---|
| Architecture | Dense(256) → BN → Dropout(0.3) → Dense(128) → BN → Dropout(0.3) → Dense(64) → Dropout(0.2) → Softmax(30) |
| Input Features | 63 (21 landmarks × x, y, z) |
| Output Classes | 30 gestures |
| Test Accuracy | **99.8%** |
| Training Samples | 54,000 |
| Loss Function | Sparse Categorical Crossentropy |
| Optimizer | Adam |

---

## Data Pipeline

```
Step 1 — collect_data.py
  └── Webcam-based collection (200 samples/gesture/person)
  └── Saves raw CSVs to newdata/raw/{person}/{gesture}.csv

Step 2 — merge_data.py
  └── Merges all CSVs → gesture_data_v1.csv (30,000 rows)

Step 3 — generate_synthetic_data.py
  └── 9 virtual subjects with scale/noise/shift augmentation
  └── → massive_gesture_dataset_v2.csv (54,000 rows)

Step 4 — train_model.py
  └── 80/10/10 stratified split
  └── Additional Gaussian noise augmentation on training set
  └── Saves gesture_model.h5 + label_encoder.pkl
```

---

## Project Structure

```
sign-language-recognition/
├── frontend/                  # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── CameraFeed.jsx
│       │   ├── GestureDisplay.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProgressBar.jsx
│       │   └── TextDisplay.jsx
│       ├── hooks/
│       │   └── useGesture.js  # Core WebSocket + camera logic
│       └── pages/
│           ├── Demo.jsx
│           ├── Docs.jsx
│           └── Landing.jsx
├── src/
│   └── api/
│       └── main.py            # FastAPI WebSocket server
├── models/
│   └── v1/
│       ├── gesture_model.h5
│       └── label_encoder.pkl
├── collect_data.py            # Data collection tool
├── generate_synthetic_data.py # Augmentation
├── merge_data.py              # Data merging
├── train_model.py             # Model training
├── Dockerfile
├── render.yaml
└── requirements.txt
```

---

## Local Setup

### Backend

```bash
# Clone the repo
git clone https://github.com/vipin4546/sign-language-recognition.git
cd sign-language-recognition

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend
uvicorn src.api.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
WebSocket at: `ws://localhost:8000/ws`
Health check: `http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5174`

---

## Usage

1. Start the backend (`uvicorn` command above)
2. Start the frontend (`npm run dev`)
3. Open `http://localhost:5174` in your browser
4. Click **"Enable Camera"** and allow webcam access
5. Point your hand at the camera
6. Hold any ASL gesture for **2 seconds** to type that letter
7. Use **FullStop** gesture to trigger Text-to-Speech

---

## Special Gestures

| Gesture | Action |
|---|---|
| A–Z | Types the corresponding letter |
| Space | Adds a space |
| Backspace | Deletes last character |
| FullStop | Adds `.` and reads sentence aloud |
| NewLine | Adds new line and reads sentence aloud |

---

## API Endpoints

| Endpoint | Type | Description |
|---|---|---|
| `GET /` | REST | Root info |
| `GET /health` | REST | Model status + gesture list |
| `ws://localhost:8000/ws` | WebSocket | Real-time gesture recognition |

### WebSocket Response Format

```json
{
  "text": "HELLO",
  "current": "O",
  "progress": 0.85,
  "speak": false
}
```

---

## Contributors

| Name | Role |
|---|---|
| Vipin Kumar | Backend, model training, deployment |
| Ankit | Frontend and Ui/Ux |



---

## Limitations

- Static gesture recognition only — J and Z (movement-based in ASL) may not be accurate
- Trained on 5 real contributors — performance may vary across skin tones and lighting conditions
- Single hand detection only
- Poor lighting or cluttered backgrounds may affect MediaPipe detection

---

## Future Improvements

- LSTM-based temporal modeling for movement gestures (J, Z)
- Two-hand gesture support
- TensorFlow.js port for fully offline browser usage
- Mobile app version
- Larger, more diverse real-world dataset

---


⭐ If you found this useful, please star the repo!
