from fastapi import HTTPException
from clerk_backend_api import Clerk, AuthenticateRequestOptions
import os
from dotenv import load_dotenv

load_dotenv()


clerk_sdk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

def authenticate_and_get_user_details(request):
    try:
        request_state = clerk_sdk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=[
                    "http://localhost:5173",
                    "https://pemancarq-ai.zeabur.app"
                ]
            )
        )
        if not request_state.is_signed_in:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = request_state.payload.get("sub")
        return {"user_id": user_id}
    except Exception as e:
        # 打印完整的异常信息
        print("="*50)
        print("Clerk Auth Error:")
        print(f"Error type: {type(e).__name__}")
        print(f"Error message: {str(e)}")
        if hasattr(e, 'response'):
            print(f"Response body: {e.response.text if hasattr(e.response, 'text') else 'N/A'}")
        print("="*50)
        raise HTTPException(status_code=500, detail=f"Auth Error: {str(e)}")
