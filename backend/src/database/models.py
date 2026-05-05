from sqlalchemy import Column, Integer, String, DateTime, create_engine, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

engine = create_engine('sqlite:///database.db', echo=True)
Base = declarative_base()

class Challenge(Base):
    __tablename__ = 'challenges'

    id = Column(Integer, primary_key=True)

    # ========== 批次信息 ==========
    batch_id = Column(String, nullable=False)  # 同一批次生成的问题共享相同ID
    batch_index = Column(Integer, nullable=False)  # 批次内的问题序号（1,2,3...）

    # ========== Base Question（原始问题） ==========
    base_question_title = Column(Text, nullable=False)
    base_question_description = Column(Text, nullable=False)
    base_programming_elements = Column(Text, nullable=False)  # JSON string
    base_data_structures = Column(Text, nullable=False)  # JSON string
    base_input_source = Column(String, nullable=False)
    base_output_source = Column(String, nullable=False)
    base_task_list = Column(Text, nullable=False)  # JSON string
    base_input_information = Column(Text, nullable=False)
    base_output_information = Column(Text, nullable=False)
    base_input_output_example = Column(Text, nullable=True)
    base_additional_functions = Column(Text, nullable=True)  # JSON string
    base_additional_formulas = Column(Text, nullable=True)  # JSON string
    base_static_elements = Column(Text, nullable=True)  # JSON string

    # ========== Generated Question（生成的问题） ==========
    title = Column(String, nullable=False)
    programming_elements = Column(Text, nullable=False)  # JSON string
    data_structures = Column(Text, nullable=False)  # JSON string
    input_source = Column(String, nullable=False)
    output_source = Column(String, nullable=False)
    question_description = Column(Text, nullable=False)
    task_list = Column(Text, nullable=False)  # JSON string
    input_information = Column(Text, nullable=False)
    output_information = Column(Text, nullable=False)
    input_output_example = Column(Text, nullable=True)
    additional_functions = Column(Text, nullable=True)  # JSON string
    additional_formulas = Column(Text, nullable=True)  # JSON string
    additional_diagrams = Column(Text, nullable=True)  # JSON string

    # ========== 元数据 ==========
    difficulty = Column(String, nullable=False)
    created_by = Column(String, nullable=False)
    date_created = Column(DateTime, default=datetime.now)

    # ========== 分享功能 ==========
    share_key = Column(String, nullable=False, unique=True, index=True)

    # === 新增：可见性设置 ===
    # visibility: 'private' (仅自己), 'shareable' (有分享码), 'public' (社区公开)
    visibility = Column(String, default='private', nullable=False)


class ChallengeQuota(Base):
    __tablename__ = 'challenge_quotas'

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    quota_remaining = Column(Integer, nullable=False, default=100)
    last_reset_date = Column(DateTime, default=datetime.now)


Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()