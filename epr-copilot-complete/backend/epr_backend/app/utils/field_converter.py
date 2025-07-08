from typing import Dict, Optional, Any


def camel_to_snake(data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert camelCase keys to snake_case keys in a dictionary."""
    converted = {}
    for key, value in data.items():
        snake_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
        converted[snake_key] = value
    return converted


def convert_frontend_fields(data: Dict[str, Any], field_mapping: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Convert frontend camelCase fields to backend snake_case with optional custom mapping."""
    converted = camel_to_snake(data)
    
    if field_mapping:
        for frontend_key, backend_key in field_mapping.items():
            if frontend_key in data:
                converted[backend_key] = data[frontend_key]
                auto_converted = camel_to_snake({frontend_key: None})
                if list(auto_converted.keys())[0] in converted:
                    del converted[list(auto_converted.keys())[0]]
    
    return converted
