from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models
import json
import uuid
import secrets
import string


def get_challenge_quota(db: Session, user_id: str):
    quota = db.query(models.ChallengeQuota).filter(models.ChallengeQuota.user_id == user_id).first()
    if quota is None:
        quota = create_challenge_quota(db, user_id)
    return quota


def create_challenge_quota(db: Session, user_id: str):
    db_quota = models.ChallengeQuota(
        user_id=user_id,
        quota_remaining=100
    )
    db.add(db_quota)
    db.commit()
    db.refresh(db_quota)
    return db_quota


def reset_quota_if_needed(db: Session, quota: models.ChallengeQuota):
    now = datetime.now()
    if now - quota.last_reset_date > timedelta(hours=24):
        quota.quota_remaining = 100
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
    return quota


# 添加生成唯一分享码的函数
def generate_unique_share_key(db: Session) -> str:
    """生成唯一的分享码（8位字母数字组合）"""
    while True:
        # 生成 8 位随机字符串（大小写字母+数字）
        alphabet = string.ascii_letters + string.digits
        share_key = ''.join(secrets.choice(alphabet) for _ in range(8))

        # 检查是否已存在
        existing = db.query(models.Challenge).filter(
            models.Challenge.share_key == share_key
        ).first()

        if not existing:
            return share_key


def create_challenge(
        db: Session,
        # 批次信息
        batch_id: str,
        batch_index: int,
        # Base Question
        base_question_title: str,
        base_question_description: str,
        base_programming_elements: str,
        base_data_structures: str,
        base_input_source: str,
        base_output_source: str,
        base_task_list: str,
        base_input_information: str,
        base_output_information: str,
        base_input_output_example: str,
        base_additional_functions: str,
        base_additional_formulas: str,
        base_static_elements: str,
        # Generated Question
        difficulty: str,
        created_by: str,
        title: str,
        programming_elements: str,
        data_structures: str,
        input_source: str,
        output_source: str,
        question_description: str,
        task_list: str,
        input_information: str,
        output_information: str,
        input_output_example: str,
        additional_functions: str,
        additional_formulas: str,
        additional_diagrams: str,
        visibility: str = 'private',  # 新增参数
):
    # 生成唯一的分享码
    share_key = generate_unique_share_key(db)

    db_challenge = models.Challenge(
        batch_id=batch_id,
        batch_index=batch_index,
        base_question_title=base_question_title,
        base_question_description=base_question_description,
        base_programming_elements=base_programming_elements,
        base_data_structures=base_data_structures,
        base_input_source=base_input_source,
        base_output_source=base_output_source,
        base_task_list=base_task_list,
        base_input_information=base_input_information,
        base_output_information=base_output_information,
        base_input_output_example=base_input_output_example,
        base_additional_functions=base_additional_functions,
        base_additional_formulas=base_additional_formulas,
        base_static_elements=base_static_elements,
        difficulty=difficulty,
        created_by=created_by,
        title=title,
        programming_elements=programming_elements,
        data_structures=data_structures,
        input_source=input_source,
        output_source=output_source,
        question_description=question_description,
        task_list=task_list,
        input_information=input_information,
        output_information=output_information,
        input_output_example=input_output_example,
        additional_functions=additional_functions,
        additional_formulas=additional_formulas,
        additional_diagrams=additional_diagrams,
        share_key=share_key,  # 新增
        visibility=visibility,  # 新增
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


def get_user_challenges_grouped(db: Session, user_id: str):
    """获取用户的所有挑战，按批次分组 - 返回完整字段"""
    challenges = db.query(models.Challenge).filter(
        models.Challenge.created_by == user_id
    ).order_by(models.Challenge.date_created.desc()).all()

    # 按 batch_id 分组
    groups = {}
    for challenge in challenges:
        if challenge.batch_id not in groups:
            groups[challenge.batch_id] = {
                "batch_id": challenge.batch_id,
                "timestamp": challenge.date_created.isoformat(),
                "share_key": challenge.share_key,  # 添加批次级别的 share_key（使用第一个问题的）

                # ========== Base Question 完整字段 ==========
                "base_question": {
                    "title": challenge.base_question_title,
                    "description": challenge.base_question_description,
                    "programming_elements": json.loads(
                        challenge.base_programming_elements) if challenge.base_programming_elements else [],
                    "data_structures": json.loads(
                        challenge.base_data_structures) if challenge.base_data_structures else [],
                    "input_source": challenge.base_input_source,
                    "output_source": challenge.base_output_source,
                    "task_list": json.loads(challenge.base_task_list) if challenge.base_task_list else [],
                    "input_information": challenge.base_input_information,
                    "output_information": challenge.base_output_information,
                    "input_output_example": challenge.base_input_output_example,
                    "additional_functions": json.loads(
                        challenge.base_additional_functions) if challenge.base_additional_functions else [],
                    "additional_formulas": json.loads(
                        challenge.base_additional_formulas) if challenge.base_additional_formulas else [],
                    "additional_diagrams": [],  # 图片暂不支持
                    "static_elements": json.loads(
                        challenge.base_static_elements) if challenge.base_static_elements else [],
                },
                "generated_questions": []
            }
        else:
            # 如果已经存在，确保 share_key 一致
            pass

        # ========== Generated Question 完整字段 ==========
        groups[challenge.batch_id]["generated_questions"].append({
            "id": challenge.id,
            "index": challenge.batch_index,
            "share_key": challenge.share_key,  # 为每个问题也添加 share_key

            # Core Elements
            "title": challenge.title,
            "programming_elements": json.loads(
                challenge.programming_elements) if challenge.programming_elements else [],
            "data_structures": json.loads(challenge.data_structures) if challenge.data_structures else [],
            "input_source": challenge.input_source,
            "output_source": challenge.output_source,
            # Scenario Elements
            "question_description": challenge.question_description,
            "task_list": json.loads(challenge.task_list) if challenge.task_list else [],
            "input_information": challenge.input_information,
            "output_information": challenge.output_information,
            "input_output_example": challenge.input_output_example,
            # Optional Elements
            "additional_functions": json.loads(
                challenge.additional_functions) if challenge.additional_functions else [],
            "additional_formulas": json.loads(challenge.additional_formulas) if challenge.additional_formulas else [],
        })

    # 转换为列表并按时间倒序
    result = list(groups.values())
    result.sort(key=lambda x: x["timestamp"], reverse=True)

    return result


# 添加通过分享码查询的函数
def get_challenge_by_share_key(db: Session, share_key: str):
    """通过分享码查询挑战（返回整个批次的所有问题）"""
    # 先找到这个分享码对应的 challenge
    challenge = db.query(models.Challenge).filter(
        models.Challenge.share_key == share_key
    ).first()

    if not challenge:
        return None

    # 返回同一 batch_id 的所有问题
    batch_challenges = db.query(models.Challenge).filter(
        models.Challenge.batch_id == challenge.batch_id
    ).order_by(models.Challenge.batch_index).all()

    return {
        "share_key": share_key,
        "batch_id": challenge.batch_id,
        "timestamp": challenge.date_created.isoformat(),
        "base_question": {
            "title": batch_challenges[0].base_question_title,
            "description": batch_challenges[0].base_question_description,
            "programming_elements": json.loads(batch_challenges[0].base_programming_elements) if batch_challenges[
                0].base_programming_elements else [],
            "data_structures": json.loads(batch_challenges[0].base_data_structures) if batch_challenges[
                0].base_data_structures else [],
            "input_source": batch_challenges[0].base_input_source,
            "output_source": batch_challenges[0].base_output_source,
            "task_list": json.loads(batch_challenges[0].base_task_list) if batch_challenges[0].base_task_list else [],
            "input_information": batch_challenges[0].base_input_information,
            "output_information": batch_challenges[0].base_output_information,
            "input_output_example": batch_challenges[0].base_input_output_example,
            "additional_functions": json.loads(batch_challenges[0].base_additional_functions) if batch_challenges[
                0].base_additional_functions else [],
            "additional_formulas": json.loads(batch_challenges[0].base_additional_formulas) if batch_challenges[
                0].base_additional_formulas else [],
            "static_elements": json.loads(batch_challenges[0].base_static_elements) if batch_challenges[
                0].base_static_elements else [],
        },
        "generated_questions": [
            {
                "id": c.id,
                "index": c.batch_index,
                "title": c.title,
                "programming_elements": json.loads(c.programming_elements) if c.programming_elements else [],
                "data_structures": json.loads(c.data_structures) if c.data_structures else [],
                "input_source": c.input_source,
                "output_source": c.output_source,
                "question_description": c.question_description,
                "task_list": json.loads(c.task_list) if c.task_list else [],
                "input_information": c.input_information,
                "output_information": c.output_information,
                "input_output_example": c.input_output_example,
                "additional_functions": json.loads(c.additional_functions) if c.additional_functions else [],
                "additional_formulas": json.loads(c.additional_formulas) if c.additional_formulas else [],
            }
            for c in batch_challenges
        ]
    }


# 新增：获取公开的 community 内容（按批次分组）
def get_public_challenges(db: Session, page: int = 1, per_page: int = 12):
    """获取所有公开的挑战，按批次分组，支持分页"""

    # 获取所有公开的挑战
    public_challenges = db.query(models.Challenge).filter(
        models.Challenge.visibility == 'public'
    ).order_by(models.Challenge.date_created.desc()).all()

    # 按 batch_id 分组
    groups = {}
    for challenge in public_challenges:
        if challenge.batch_id not in groups:
            groups[challenge.batch_id] = {
                "batch_id": challenge.batch_id,
                "timestamp": challenge.date_created.isoformat(),
                "created_by": challenge.created_by,
                "visibility": challenge.visibility,
                "base_question": {
                    "title": challenge.base_question_title,
                    "description": challenge.base_question_description,
                    "programming_elements": json.loads(
                        challenge.base_programming_elements) if challenge.base_programming_elements else [],
                    "data_structures": json.loads(
                        challenge.base_data_structures) if challenge.base_data_structures else [],
                    "input_source": challenge.base_input_source,
                    "output_source": challenge.base_output_source,
                    "task_list": json.loads(challenge.base_task_list) if challenge.base_task_list else [],
                    "input_information": challenge.base_input_information,
                    "output_information": challenge.base_output_information,
                    "input_output_example": challenge.base_input_output_example,
                    "additional_functions": json.loads(
                        challenge.base_additional_functions) if challenge.base_additional_functions else [],
                    "additional_formulas": json.loads(
                        challenge.base_additional_formulas) if challenge.base_additional_formulas else [],
                    "static_elements": json.loads(
                        challenge.base_static_elements) if challenge.base_static_elements else [],
                },
                "generated_questions": []
            }

        groups[challenge.batch_id]["generated_questions"].append({
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
            "additional_formulas": json.loads(challenge.additional_formulas) if challenge.additional_formulas else [],
        })

    # 转换为列表
    result = list(groups.values())

    # 分页
    total = len(result)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_results = result[start:end]

    return {
        "items": paginated_results,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


# 添加更新可见性的函数
def update_batch_visibility(db: Session, batch_id: str, visibility: str):
    """更新整个批次的可见性"""
    challenges = db.query(models.Challenge).filter(
        models.Challenge.batch_id == batch_id
    ).all()

    for challenge in challenges:
        challenge.visibility = visibility

    db.commit()
    return True