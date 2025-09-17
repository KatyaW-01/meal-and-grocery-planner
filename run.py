#!/usr/bin/env python3
"""
Entry point for the Flask application.
Run this file from the project root directory: `python run.py`
"""
from server import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5555)