"""
Test handler to verify Vercel Python setup
"""
import json

def handler(event, context):
    """
    Simple test handler for Vercel
    """
    response = {
        "message": "Hello from Vercel Python!",
        "event": str(event)[:200]
    }
    return {
        "statusCode": 200,
        "body": json.dumps(response),
        "headers": {
            "Content-Type": "application/json"
        }
    }
