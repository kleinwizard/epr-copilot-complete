from dataclasses import dataclass
from typing import Optional


@dataclass
class SimulationResult:
    success: bool
    simulated: bool
    message: Optional[str] = None
    
    @classmethod
    def simulated_success(cls, message: str) -> 'SimulationResult':
        return cls(success=True, simulated=True, message=f"SIMULATED: {message}")
    
    @classmethod
    def actual_success(cls) -> 'SimulationResult':
        return cls(success=True, simulated=False)
    
    @classmethod
    def actual_failure(cls, message: str) -> 'SimulationResult':
        return cls(success=False, simulated=False, message=message)
