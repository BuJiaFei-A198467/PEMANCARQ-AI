import sys
import os

# 将 backend 目录添加到 Python 路径
sys.path.insert(0, os.path.dirname(__file__))

from src.app import app

if __name__ == "__main__":
    import uvicorn
    import os as _os
    
    port = int(_os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
