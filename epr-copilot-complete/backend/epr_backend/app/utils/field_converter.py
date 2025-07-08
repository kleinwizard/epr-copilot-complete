"""
Utility functions for converting field names between camelCase and snake_case.
Used to handle field name mismatches between frontend (camelCase) and backend (snake_case).
"""

import re
from typing import Dict, Any, Union, Optional


def camel_to_snake(data: Union[Dict[str, Any], str]) -> Union[Dict[str, Any], str]:
    """
    Convert camelCase keys to snake_case and handle type conversion.
    
    Args:
        data: Dictionary with camelCase keys or a single camelCase string
        
    Returns:
        Dictionary with snake_case keys or a single snake_case string
    """
    if isinstance(data, str):
        return re.sub(r'(?<!^)(?=[A-Z])', '_', data).lower()
    
    if not isinstance(data, dict):
        return data
        
    converted = {}
    for key, value in data.items():
        snake_key = re.sub(r'(?<!^)(?=[A-Z])', '_', key).lower()
        
        if snake_key in ['recyclable', 'active', 'enabled', 'visible', 'required'] and isinstance(value, str):
            if value.lower() in ['true', '1', 'yes', 'on']:
                converted[snake_key] = True
            elif value.lower() in ['false', '0', 'no', 'off', '']:
                converted[snake_key] = False
            else:
                converted[snake_key] = value
        else:
            converted[snake_key] = value
    return converted


def snake_to_camel(data: Union[Dict[str, Any], str]) -> Union[Dict[str, Any], str]:
    """
    Convert snake_case keys to camelCase.
    
    Args:
        data: Dictionary with snake_case keys or a single snake_case string
        
    Returns:
        Dictionary with camelCase keys or a single camelCase string
    """
    if isinstance(data, str):
        components = data.split('_')
        return components[0] + ''.join(x.capitalize() for x in components[1:])
    
    if not isinstance(data, dict):
        return data
        
    converted = {}
    for key, value in data.items():
        components = key.split('_')
        camel_key = components[0] + ''.join(x.capitalize() for x in components[1:])
        converted[camel_key] = value
    return converted


def convert_frontend_fields(data: Dict[str, Any], field_mapping: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Convert frontend camelCase fields to backend snake_case with optional custom mapping."""
    converted = camel_to_snake(data)
    if not isinstance(converted, dict):
        return {}
    
    if field_mapping:
        for frontend_key, backend_key in field_mapping.items():
            if frontend_key in data:
                converted[backend_key] = data[frontend_key]
                auto_converted_key = re.sub(r'(?<!^)(?=[A-Z])', '_', frontend_key).lower()
                if auto_converted_key in converted and auto_converted_key != backend_key:
                    del converted[auto_converted_key]
    
    return converted


def convert_pydantic_dict_to_snake_case(pydantic_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert a Pydantic model's dict() output from camelCase to snake_case.
    This is specifically for handling Pydantic models that use camelCase field names
    but need to be converted to snake_case for database operations.
    
    Args:
        pydantic_dict: Dictionary from pydantic_model.dict()
        
    Returns:
        Dictionary with snake_case keys suitable for SQLAlchemy models
    """
    result = camel_to_snake(pydantic_dict)
    return result if isinstance(result, dict) else {}


def convert_db_result_to_camel_case(db_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert database result dictionary from snake_case to camelCase.
    This is for converting SQLAlchemy query results to camelCase for frontend consumption.
    
    Args:
        db_dict: Dictionary with snake_case keys from database
        
    Returns:
        Dictionary with camelCase keys suitable for frontend
    """
    result = snake_to_camel(db_dict)
    return result if isinstance(result, dict) else {}


COMMON_FIELD_MAPPINGS = {
    'firstName': 'first_name',
    'lastName': 'last_name',
    'phoneNumber': 'phone_number',
    'avatarUrl': 'avatar_url',
    
    'legalName': 'legal_name',
    'businessId': 'business_id',
    'deqNumber': 'deq_number',
    'naicsCode': 'naics_code',
    'entityType': 'entity_type',
    'streetAddress': 'street_address',
    'zipCode': 'zip_code',
    
    'deadlineAlerts': 'deadline_alerts',
    'reportStatus': 'report_status',
    'feeChanges': 'fee_changes',
    'teamUpdates': 'team_updates',
    'browserNotifications': 'browser_notifications',
    'notificationFrequency': 'notification_frequency',
    
    'designatedProducerId': 'designated_producer_id',
    'lastUpdated': 'last_updated',
    'eprFee': 'epr_fee',
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
}


def apply_field_mapping(data: Dict[str, Any], field_mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Apply a specific field mapping to convert field names.
    
    Args:
        data: Dictionary with original field names
        field_mapping: Dictionary mapping original names to target names
        
    Returns:
        Dictionary with converted field names
    """
    converted = {}
    for key, value in data.items():
        new_key = field_mapping.get(key, key)
        converted[new_key] = value
    return converted
