Dataset Preparation
Downloaded multiple datasets containing images and labels from Kaggle and Roboflow.

Forked the datasets into Roboflow for preprocessing and augmentation:

Preprocessing: Resize (640px), auto-orientation, grayscale conversion, random orientation, and brightness adjustment.

Merged all processed datasets into a single YOLO-format dataset structure:
├── train/
├── valid/
├── test/
└── data.yaml

Model Training
Trained a YOLOv8 model using the suspicious_activity_detection.py script for 50 epochs.
Due to limited GPU availability, training was resumed daily:
Saved intermediate model as last.pt.
Loaded last.pt to continue training whenever a free GPU was available (Google Colab).
After completing training, downloaded best.pt and placed it in the backend project for predictions.

best.pt and model trained results:
https://drive.google.com/drive/folders/1AxIj2OQYenNvXlRRBjlvNL9w-WFbtcsM?usp=sharing


Backend (Flask)
python -m venv venv
venv\Scripts\activate     
pip install -r requirements.txt
python run.py


Frontend (React)
cd frontend
npm install
npm run dev
