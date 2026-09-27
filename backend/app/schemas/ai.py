from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AIQueryRequest(BaseModel):
    query: str
    timeframe: Optional[str] = "today"

class AIQueryResponse(BaseModel):
    answer: str
    insights: List[str] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None
