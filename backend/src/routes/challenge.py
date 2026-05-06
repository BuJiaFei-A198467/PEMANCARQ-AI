from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from ..ai_generator import generate_problem_solving_challenges
from ..database.db import (
    get_challenge_quota,
    create_challenge,
    create_challenge_quota,
    reset_quota_if_needed,
    get_user_challenges_grouped,
    get_challenge_by_share_key,
    get_public_challenges,      # 新增
    update_batch_visibility      # 新增
)
from ..utils import authenticate_and_get_user_details
from ..database.models import get_db, Challenge as ChallengeModel  # 新增
import json
from datetime import datetime
import uuid

router = APIRouter()


class ProblemSolvingChallengeRequest(BaseModel):
    programming_elements: List[str]
    data_structures: List[str]
    input_source: str
    output_source: str
    question_title: str
    question_description: str
    task_list: List[str]
    input_information: str
    output_information: str
    input_output_example: str
    additional_functions: List[str] = []
    additional_formulas: List[str] = []
    additional_diagrams: List[str] = []
    static_elements: List[str] = []
    number_of_questions: int = 1
    visibility: str = 'private'


@router.post("/generate-problem-solving-challenges")
async def generate_problem_solving_challenges_endpoint(
        request: ProblemSolvingChallengeRequest,
        request_obj: Request,
        db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        quota = get_challenge_quota(db, user_id)
        if not quota:
            quota = create_challenge_quota(db, user_id)

        quota = reset_quota_if_needed(db, quota)

        if quota.quota_remaining < request.number_of_questions:
            raise HTTPException(
                status_code=429,
                detail=f"Not enough quota. Available: {quota.quota_remaining}, Required: {request.number_of_questions}"
            )

        challenges_data = generate_problem_solving_challenges(request, request.number_of_questions)

        batch_id = str(uuid.uuid4())

        generated_challenges = []
        for idx, challenge_data in enumerate(challenges_data):
            new_challenge = create_challenge(
                db=db,
                batch_id=batch_id,
                batch_index=idx + 1,
                base_question_title=request.question_title,
                base_question_description=request.question_description,
                base_programming_elements=json.dumps(request.programming_elements),
                base_data_structures=json.dumps(request.data_structures),
                base_input_source=request.input_source,
                base_output_source=request.output_source,
                base_task_list=json.dumps(request.task_list),
                base_input_information=request.input_information,
                base_output_information=request.output_information,
                base_input_output_example=request.input_output_example,
                base_additional_functions=json.dumps(request.additional_functions),
                base_additional_formulas=json.dumps(request.additional_formulas),
                base_static_elements=json.dumps(request.static_elements),
                difficulty="custom",
                created_by=user_id,
                title=challenge_data["title"],
                programming_elements=json.dumps(challenge_data["programming_elements"]),
                data_structures=json.dumps(challenge_data["data_structures"]),
                input_source=challenge_data["input_source"],
                output_source=challenge_data["output_source"],
                question_description=challenge_data["question_description"],
                task_list=json.dumps(challenge_data["task_list"]),
                input_information=challenge_data["input_information"],
                output_information=challenge_data["output_information"],
                input_output_example=challenge_data["input_output_example"],
                additional_functions=json.dumps(challenge_data["additional_functions"]),
                additional_formulas=json.dumps(challenge_data["additional_formulas"]),
                additional_diagrams=json.dumps(challenge_data["additional_diagrams"]),
                visibility=request.visibility,
            )

            generated_challenges.append({
                "id": new_challenge.id,
                "title": new_challenge.title,
                "programming_elements": challenge_data["programming_elements"],
                "data_structures": challenge_data["data_structures"],
                "input_source": new_challenge.input_source,
                "output_source": new_challenge.output_source,
                "question_description": new_challenge.question_description,
                "task_list": challenge_data["task_list"],
                "input_information": new_challenge.input_information,
                "output_information": new_challenge.output_information,
                "input_output_example": new_challenge.input_output_example,
                "additional_functions": challenge_data["additional_functions"],
                "additional_formulas": challenge_data["additional_formulas"],
                "additional_diagrams": challenge_data["additional_diagrams"],
                "timestamp": new_challenge.date_created.isoformat(),
                "visibility": request.visibility,
            })

        quota.quota_remaining -= request.number_of_questions
        db.commit()

        return generated_challenges

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-history")
async def my_history(request: Request, db: Session = Depends(get_db)):
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    history_groups = get_user_challenges_grouped(db, user_id)

    return {"history_groups": history_groups}


@router.get("/quota")
async def get_quota(request: Request, db: Session = Depends(get_db)):
    import traceback
    try:
        user_details = authenticate_and_get_user_details(request)
        user_id = user_details.get("user_id")
        # ... 这里是你的原有逻辑 ...
        quota = get_challenge_quota(db, user_id)
        # ... 等等 ...
        return {
            "quota_remaining": quota.quota_remaining,
            "last_reset_data": quota.last_reset_date.isoformat()
        }
    except Exception as e:
        # 关键：把完整的错误堆栈打印到 Render 的日志里
        print("="*50)
        print("ERROR IN /api/quota:")
        traceback.print_exc()
        print("="*50)
        # 也可以临时返回具体的错误信息给前端，方便调试
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/{share_key}")
async def search_by_share_key(
        share_key: str,
        db: Session = Depends(get_db)
):
    try:
        result = get_challenge_by_share_key(db, share_key)

        if not result:
            raise HTTPException(status_code=404, detail="Share key not found")

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/community")
async def get_community(
        page: int = 1,
        per_page: int = 12,
        db: Session = Depends(get_db)
):
    try:
        result = get_public_challenges(db, page, per_page)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/update-visibility/{batch_id}")
async def update_visibility(
        batch_id: str,
        visibility: str,
        request_obj: Request,
        db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        challenge = db.query(ChallengeModel).filter(
            ChallengeModel.batch_id == batch_id,
            ChallengeModel.created_by == user_id
        ).first()

        if not challenge:
            raise HTTPException(status_code=404, detail="Batch not found or not owned by you")

        update_batch_visibility(db, batch_id, visibility)

        return {"status": "success", "visibility": visibility}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/delete-batch/{batch_id}")
async def delete_batch(
        batch_id: str,
        request_obj: Request,
        db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        # 查找并删除整个批次
        challenges = db.query(ChallengeModel).filter(
            ChallengeModel.batch_id == batch_id,
            ChallengeModel.created_by == user_id
        ).all()

        if not challenges:
            raise HTTPException(status_code=404, detail="Batch not found")

        for challenge in challenges:
            db.delete(challenge)

        db.commit()
        return {"status": "success", "message": f"Deleted {len(challenges)} challenges"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/get-batch/{batch_id}")
async def get_batch(
        batch_id: str,
        request_obj: Request,
        db: Session = Depends(get_db)
):
    try:
        user_details = authenticate_and_get_user_details(request_obj)
        user_id = user_details.get("user_id")

        # 获取该批次的所有挑战
        challenges = db.query(ChallengeModel).filter(
            ChallengeModel.batch_id == batch_id,
            ChallengeModel.created_by == user_id
        ).order_by(ChallengeModel.batch_index).all()

        if not challenges:
            raise HTTPException(status_code=404, detail="Batch not found or access denied")

        # 构建返回数据
        first_challenge = challenges[0]

        result = {
            "batch_id": batch_id,
            "timestamp": first_challenge.date_created.isoformat(),
            "share_key": first_challenge.share_key,
            "visibility": first_challenge.visibility,
            "base_question": {
                "title": first_challenge.base_question_title,
                "description": first_challenge.base_question_description,
                "programming_elements": json.loads(
                    first_challenge.base_programming_elements) if first_challenge.base_programming_elements else [],
                "data_structures": json.loads(
                    first_challenge.base_data_structures) if first_challenge.base_data_structures else [],
                "input_source": first_challenge.base_input_source,
                "output_source": first_challenge.base_output_source,
                "task_list": json.loads(first_challenge.base_task_list) if first_challenge.base_task_list else [],
                "input_information": first_challenge.base_input_information,
                "output_information": first_challenge.base_output_information,
                "input_output_example": first_challenge.base_input_output_example,
                "additional_functions": json.loads(
                    first_challenge.base_additional_functions) if first_challenge.base_additional_functions else [],
                "additional_formulas": json.loads(
                    first_challenge.base_additional_formulas) if first_challenge.base_additional_formulas else [],
                "static_elements": json.loads(
                    first_challenge.base_static_elements) if first_challenge.base_static_elements else [],
            },
            "generated_questions": []
        }

        # 添加所有生成的题目
        for challenge in challenges:
            question_data = {
                "id": challenge.id,
                "index": challenge.batch_index,
                "title": challenge.title,
                "programming_elements": json.loads(
                    challenge.programming_elements) if challenge.programming_elements else [],
                "data_structures": json.loads(challenge.data_structures) if challenge.data_structures else [],
                "input_source": challenge.input_source,
                "output_source": challenge.output_source,
                "question_description": challenge.question_description,
                "task_list": json.loads(challenge.task_list) if challenge.task_list else [],
                "input_information": challenge.input_information,
                "output_information": challenge.output_information,
                "input_output_example": challenge.input_output_example,
                "additional_functions": json.loads(
                    challenge.additional_functions) if challenge.additional_functions else [],
                "additional_formulas": json.loads(
                    challenge.additional_formulas) if challenge.additional_formulas else [],
            }
            result["generated_questions"].append(question_data)

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
