# BTP Project

## Setup Instructions

Follow these steps to set up and run the project:

### 1. Create a Virtual Environment

```bash
python3 -m venv venv
```

### 2. Activate the Virtual Environment

- On **Linux/macOS**:

  ```bash
  source venv/bin/activate
  ```

- On **Windows**:

  ```bash
  venv\Scripts\activate
  ```

### 3. Install Required Dependencies

```bash
pip install -r requirements.txt
```

### 4. Load Chrome Extension

- Open **Google Chrome**.
- Go to `chrome://extensions/`.
- Enable **Developer mode** (top-right corner).
- Click **Load unpacked**.
- Select the folder `extension1`.

### 5. Start the Server

```bash
python3 server2.py
```

