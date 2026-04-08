from pydantic import BaseModel
from typing import List, Any, Optional

class AnalyzeTemplateRequest(BaseModel):
    data: List[List[Any]]

class TemplateColumn(BaseModel):
    originalHeader: str
    description: str
    index: int
    selected: Optional[bool] = True

class MapFragmentsRequest(BaseModel):
    fragmentData: List[List[Any]]
    templateColumns: List[TemplateColumn]

class Mapping(BaseModel):
    templateHeader: str
    fragmentIndex: int
    confidence: str

class FragmentAnalysisResult(BaseModel):
    headerRowIndex: int
    mappings: List[Mapping]

class DeductCreditsRequest(BaseModel):
    user_id: str
    cost_amount: int
    app_id: str
    feature_name: str
    metadata: Optional[dict] = {}