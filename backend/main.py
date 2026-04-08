import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Optional
import httpx
from dotenv import load_dotenv
from schemas import AnalyzeTemplateRequest, MapFragmentsRequest, TemplateColumn, FragmentAnalysisResult

load_dotenv()

app = FastAPI()

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("LLM_API_KEY")
LLM_URL = os.getenv("LLM_URL", "https://hiapi.online/v1/chat/completions")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3-flash-preview")

async def call_llm(prompt: str, is_json: bool = True) -> str:
    if not API_KEY:
        raise HTTPException(status_code=500, detail="LLM API Key not configured on server")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                LLM_URL,
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": LLM_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are an expert at analyzing Excel data. Always return valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"} if is_json else None,
                    "temperature": 0.1
                },
                timeout=60.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM API Error: {str(e)}")

@app.post("/api/analyze-template", response_model=List[TemplateColumn])
async def analyze_template(request: AnalyzeTemplateRequest):
    data_context = json.dumps(request.data[:20])
    
    prompt = f"""
    Analyze the following 2D array representing the top rows of an Excel sheet.
    The first row usually contains headers.
    Identify the columns.
    
    Return a JSON array of objects with the following properties:
    - originalHeader: The exact text of the header found in the first row
    - description: Content description including synonyms/aliases in Simplified Chinese (简体中文). 
      CRITICAL: You MUST include common synonyms, aliases, or alternative names in the description naturally to help with future matching (e.g., "Customer Phone Number, also matching 'Mobile', 'Cell', 'Contact'").
    - index: The zero-based index of this column in the array

    Data:
    {data_context}
    """
    
    content = await call_llm(prompt)
    # Clean potential markdown blocks
    clean_content = content.replace("```json", "").replace("```", "").strip()
    cols = json.loads(clean_content)
    
    # Handle different response formats from LLM
    result = cols if isinstance(cols, list) else (cols.get("columns") or cols.get("data") or [])
    
    return [TemplateColumn(**{**c, "selected": True}) for c in result]

@app.post("/api/map-fragments", response_model=FragmentAnalysisResult)
async def map_fragments(request: MapFragmentsRequest):
    target_schema = "\n    ".join([
        f'"{t.originalHeader}": {t.description}' 
        for t in request.templateColumns if t.selected
    ])
    
    fragment_context = json.dumps(request.fragmentData[:80])
    
    prompt = f"""
    Task: Map "Fragment" Excel columns to the "Template" structure.
    
    Target Template Columns (Name: Description & Synonyms):
    {target_schema}

    Fragment File Data (First 80 rows):
    {fragment_context}

    Instructions:
    1. Identify the header row index (0-based). Data might start deep (row 10, 20, etc).
    2. For each Target Template Column, find the best matching column in the Fragment File.
    3. Use the provided natural language descriptions (which contain aliases/synonyms) to perform semantic matching.

    Return a JSON object with:
    - headerRowIndex: The 0-based index of the row containing headers
    - mappings: An array of objects with:
        - templateHeader: The header name from the Target Template Columns list
        - fragmentIndex: The zero-based index in the Fragment file, or -1 if not found
        - confidence: "high", "low", or "none"
    """
    
    content = await call_llm(prompt)
    clean_content = content.replace("```json", "").replace("```", "").strip()
    return json.loads(clean_content)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("BACKENDPORT", "6804"))
    uvicorn.run(app, host="0.0.0.0", port=port)