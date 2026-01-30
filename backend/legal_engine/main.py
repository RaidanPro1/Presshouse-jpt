
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import base64
import io
import os
import random

# Image Generation
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

app = FastAPI()

# --- Data Models ---
class ViolationItem(BaseModel):
    item: str
    cost: int

class ReceiptRequest(BaseModel):
    official_name: str
    violations: List[ViolationItem]
    total_score: int

class JailCalcRequest(BaseModel):
    severity_score: int

# --- Helper Functions ---
def process_text(text):
    """
    Reshapes Arabic text to be rendered correctly by PIL.
    PIL does not support RTL or shaping out of the box.
    """
    if not text:
        return ""
    reshaped_text = arabic_reshaper.reshape(text)
    bidi_text = get_display(reshaped_text)
    return bidi_text

def get_font(size):
    """
    Attempts to load a font that supports Arabic. 
    Falls back to default if not found (Arabic will likely fail on fallback).
    """
    # Common paths for Arabic-supporting fonts in Linux/Docker containers
    possible_fonts = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/kacst/KacstBook.ttf",
        "/usr/share/fonts/noto/NotoSansArabic-Regular.ttf",
        "arial.ttf" # Windows fallback for dev
    ]
    
    for path in possible_fonts:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
        
        # Check if file exists in current directory (for local testing)
        if os.path.exists(os.path.basename(path)):
             return ImageFont.truetype(os.path.basename(path), size)

    return ImageFont.load_default()

# --- Endpoints ---

@app.post("/api/receipt")
async def generate_receipt(data: ReceiptRequest):
    try:
        # 1. Canvas Setup
        width = 450
        padding = 20
        line_height = 35
        
        # Calculate dynamic height
        header_height = 280
        items_height = len(data.violations) * line_height
        footer_height = 220
        total_height = header_height + items_height + footer_height
        
        # Create Canvas (Off-white receipt paper color)
        img = Image.new('RGB', (width, total_height), color=(252, 252, 250))
        draw = ImageDraw.Draw(img)
        
        # Fonts
        font_title = get_font(28)
        font_bold = get_font(20)
        font_body = get_font(18)
        font_mono = get_font(14)

        # 2. Draw Header
        y = padding + 10
        
        # Center Logo/Text
        draw.text((width/2, y), process_text("الجمهورية اليمنية"), font=font_title, fill=(0,0,0), anchor="ms")
        y += 40
        draw.text((width/2, y), process_text("نظام دستور-ميتر"), font=font_bold, fill=(0,0,0), anchor="ms")
        y += 30
        draw.text((width/2, y), process_text("RaidanPro System v6.0"), font=font_mono, fill=(100,100,100), anchor="ms")
        y += 40
        
        # Dashed Line Separator
        draw.line([(padding, y), (width-padding, y)], fill=(0,0,0), width=2)
        y += 20
        
        # Meta Info
        import datetime
        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        draw.text((width - padding, y), process_text(f"المتهم: {data.official_name}"), font=font_body, fill=(0,0,0), anchor="rs")
        y += 30
        draw.text((width - padding, y), process_text(f"التاريخ: {date_str}"), font=font_body, fill=(0,0,0), anchor="rs")
        y += 40
        
        draw.line([(padding, y), (width-padding, y)], fill=(0,0,0), width=1) 
        y += 20
        
        # 3. Draw Items
        # Columns Headers
        draw.text((width - padding, y), process_text("نوع المخالفة"), font=font_bold, fill=(0,0,0), anchor="rs")
        draw.text((padding, y), process_text("نقاط"), font=font_bold, fill=(0,0,0), anchor="ls")
        y += 35
        
        for v in data.violations:
            # Item Name (Right aligned)
            draw.text((width - padding, y), process_text(v.item), font=font_body, fill=(50,50,50), anchor="rs")
            # Cost (Left aligned)
            draw.text((padding, y), str(v.cost), font=font_mono, fill=(50,50,50), anchor="ls")
            y += line_height

        y += 20
        draw.line([(padding, y), (width-padding, y)], fill=(0,0,0), width=2)
        y += 30
        
        # 4. Draw Footer & Total
        draw.text((width - padding, y), process_text("إجمالي النقاط:"), font=font_title, fill=(0,0,0), anchor="rs")
        draw.text((padding, y), str(data.total_score), font=font_title, fill=(200,0,0), anchor="ls")
        y += 60
        
        # Barcode Simulation
        barcode_y = y
        random.seed(data.total_score) # Deterministic barcode based on score
        current_x = padding + 20
        while current_x < width - padding - 20:
            bar_w = random.randint(1, 4)
            draw.rectangle([(current_x, barcode_y), (current_x + bar_w, barcode_y + 50)], fill=(0,0,0))
            current_x += bar_w + random.randint(2, 6)
            
        y += 70
        draw.text((width/2, y), process_text("العدل أساس الحكم"), font=font_mono, fill=(100,100,100), anchor="ms")

        # 5. Output
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"image_base64": img_str}

    except Exception as e:
        print(f"Error generating receipt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jail-calc")
async def jail_calculator(data: JailCalcRequest):
    score = data.severity_score
    
    # Logic Map
    if score <= 3:
        years = 0
        classification = "تنبيه / غرامة إدارية"
        desc = "المخالفة بسيطة ولا تستوجب السجن، يكتفى بالإنذار."
    elif score <= 6:
        years = 3
        classification = "سجن خفيف (جنحة)"
        desc = "انتهاك متوسط للدستور يستوجب العقوبة التأديبية."
    elif score <= 9:
        years = 7
        classification = "سجن مشدد (جناية)"
        desc = "انتهاك جسيم للقوانين النافذة يضر بالمصلحة العامة."
    else:
        years = 15
        classification = "أمن دولة عليا (خيانة عظمى)"
        desc = "خرق فاضح للدستور يهدد سيادة الدولة وحقوق المواطنين."
        
    return {
        "years": years,
        "classification": classification,
        "description": desc
    }

if __name__ == "__main__":
    import uvicorn
    # Use standard port 5001 for this engine
    uvicorn.run(app, host="0.0.0.0", port=5001)
