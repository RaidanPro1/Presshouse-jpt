
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import os
import shutil
from typing import Optional

app = FastAPI()

# Allow all origins for simplicity in this environment.
# In production, this should be restricted to the frontend's URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze_media(file: UploadFile = File(...)):
    # Create a temporary directory for processing
    temp_dir = f"/tmp/{file.filename}-{os.urandom(4).hex()}"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, file.filename)

    try:
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Metadata Extraction with exiftool
        metadata_result = subprocess.run(
            ['exiftool', '-json', file_path],
            capture_output=True, text=True
        )
        metadata = {}
        if metadata_result.returncode == 0 and metadata_result.stdout:
            try:
                metadata = json.loads(metadata_result.stdout)[0]
            except (json.JSONDecodeError, IndexError):
                metadata = {"Error": "Could not parse exiftool output."}
        else:
             metadata = {"Error": f"Exiftool failed: {metadata_result.stderr or 'No output'}"}

        # 2. Keyframe Extraction with ffmpeg (every 5 seconds)
        keyframes_dir = os.path.join(temp_dir, "keyframes")
        os.makedirs(keyframes_dir, exist_ok=True)
        ffmpeg_command = [
            'ffmpeg', '-i', file_path, '-vf', 'fps=1/5',
            os.path.join(keyframes_dir, 'keyframe-%03d.jpg')
        ]
        subprocess.run(ffmpeg_command, capture_output=True)
        
        keyframes = sorted(os.listdir(keyframes_dir))
        
        # 3. Simulate Reverse Image Search
        reverse_search_results = []
        for frame in keyframes[:3]: # Limit to 3 frames for speed
            reverse_search_results.append({
                "frame": frame,
                "potential_matches": [
                    f"https://www.google.com/searchbyimage?image_url=SIMULATED_URL_FOR_{frame}"
                ]
            })

        # 4. Assemble JSON report
        report = {
            "filename": file.filename,
            "metadata": metadata,
            "keyframes_extracted": len(keyframes),
            "reverse_image_search_simulation": reverse_search_results
        }
        
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temporary files
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
