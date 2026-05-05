import os
import json
from openai import OpenAI
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com")


def normalize_static_elements(static_elements):
    """将显示名称转换为实际字段名"""
    mapping = {
        'Programming Elements #': 'programming_elements',
        'Data Structures #': 'data_structures',
        'Input Source #': 'input_source',
        'Output Source #': 'output_source',
        'Question Title': 'question_title',
        'Problem Description': 'question_description',
        'Task List': 'task_list',
        'Input Information': 'input_information',
        'Output Information': 'output_information',
        'Example Input-Output': 'input_output_example',
        'Additional Functions #': 'additional_functions',
        'Additional Formula #': 'additional_formulas',
        'Additional Diagram Illustration #': 'additional_diagrams',
    }

    result = []
    for elem in static_elements:
        if elem in mapping:
            result.append(mapping[elem])
        else:
            result.append(elem)
    return result



def generate_problem_solving_challenges(request_data: Any, number_of_questions: int) -> List[Dict[str, Any]]:
    """
    生成 Problem Solving Questions 基于用户提供的属性
    完全支持 static_elements，static_elements 中的字段值在生成过程中保持不变
    """
    task_count = len(getattr(request_data, 'task_list', []))
    function_count = len(getattr(request_data, 'additional_functions', []))
    formula_count = len(getattr(request_data, 'additional_formulas', []))
    static_elements = getattr(request_data, 'static_elements', [])

    # 准备字符串列表用于提示
    task_list_str = "\n".join([f"- {task}" for task in getattr(request_data, 'task_list', [])])
    function_list_str = "\n".join([f"- {func}" for func in getattr(request_data, 'additional_functions', [])]) or "None"
    formula_list_str = "\n".join(
        [f"- {formula}" for formula in getattr(request_data, 'additional_formulas', [])]) or "None"

    # 系统提示 - 重新设计

    system_prompt = f"""You are an expert problem-solving question creator for programming education.
Create comprehensive programming problems that maintain the same complexity level as the base question.

# CRITICAL IMPORTANT RULES - MUST FOLLOW EXACTLY:

## 1. STATIC ELEMENTS - MUST KEEP EXACTLY THE SAME WORDS:
The attributes which are selected in {static_elements} MUST be kept EXACTLY as in the base question:

**VERY IMPORTANT: For static elements, you MUST use the EXACT SAME WORDS as in the base question.**
- NO synonyms allowed
- NO paraphrasing allowed  
- NO similar expressions allowed
- Use the EXACT TERMINOLOGY from the base question

## 2. DYNAMIC ELEMENTS - MUST BE DIFFERENT BUT SIMILAR COMPLEXITY:
All other fields which are not selected in {static_elements} MUST be DIFFERENT from the base question,
but maintain the same:
- Complexity level (not too easy, not too hard)
- detail level
- Structure and format

## 3. COUNTS MUST MATCH EXACTLY:
- Task count: {task_count} task(s) - Use DIFFERENT task descriptions
- Function count: {function_count} function(s) - Use DIFFERENT function names if not static
- Formula count: {formula_count} formula(s) - Use DIFFERENT formulas if not static
- These counts MUST be maintained EXACTLY

## 4. THE AVAILABLE VALUE OF "Input Source":
- Standard Input
- Input from file
- Randomly Generated

## 5. THE AVAILABLE VALUE OF "Output Source":
- Standard Output
- Output from file

## 6. THE AVAILABLE VALUE OF “Programming Element”:
"Constants",
"Type Casting",
"Operators",
"Selection",
"Looping",
"Break/Continue",
"Recursion",
"Parameters",
"Return Values",
"Overloading",
"Class/Object",
"Constructor",
"Encapsulation",
"Inheritance",
"Polymorphism",
"Abstract Class",
"Interface",
"Exception Handling",
"I/O Flow",

## 7. THE AVAILABLE VALUE OF “Data Structure”: 
"Array",
"String",
"Stack",
"Queue",
"Tree",
"Graph",
"Set",
"Map",
"Linked Lists",

# GENERATION STRATEGY:
1. Ensure the overall solving time and difficulty match the base question

Return a JSON array of problems. Each problem should have the following structure:
[
    {{
        "title": "NEW problem title (different from base)",
        "programming_elements": ["MUST MATCH BASE EXACTLY if static, otherwise DIFFERENT"],
        "data_structures": ["MUST MATCH BASE EXACTLY if static, otherwise DIFFERENT"],
        "input_source": "MUST MATCH BASE EXACTLY if static, otherwise different type",
        "output_source": "MUST MATCH BASE EXACTLY if static, otherwise different type", 
        "question_description": "NEW description with different scenario",
        "task_list": ["NEW task 1", "NEW task 2", ...],  // {task_count} tasks, different content
        "input_information": "NEW input format description",
        "output_information": "NEW output format description",
        "input_output_example": "NEW example of input and output",
        "additional_functions": ["MUST MATCH BASE EXACTLY if static, otherwise different"],
        "additional_formulas": ["MUST MATCH BASE EXACTLY if static, otherwise different"],
        "additional_diagrams": [], // Leave empty as we can't generate images
        "static_elements": {static_elements}  // Keep this as provided
    }}
]
"""

    user_prompt = f"""
## YOUR TASK:
Create {number_of_questions} UNIQUE programming problem-solving questions based on the base question.

⚠️ **CRITICAL RULE**: For DYNAMIC fields (fields NOT in static list), you MUST choose values that are DIFFERENT from the base question. DO NOT copy the base values shown below.

---

## SECTION 1: STATIC ELEMENTS (Must be kept EXACTLY as in base)
The following fields are STATIC. You MUST copy these values VERBATIM from the base question:
{request_data.static_elements}

**If a field is listed above, use the EXACT SAME value shown below - no changes, no synonyms, no paraphrasing.**

---

## SECTION 2: DYNAMIC ELEMENTS (Must be DIFFERENT from base)
For all other fields NOT listed in {request_data.static_elements}, you MUST create COMPLETELY DIFFERENT values while maintaining similar complexity.

---

## SECTION 3: FIELD-BY-FIELD INSTRUCTIONS

### 1. Title
- **Base value**: "{getattr(request_data, 'question_title', 'N/A')}"
- **If STATIC**: Use the exact base value above
- **If DYNAMIC**: Create a different, descriptive title (completely different wording, not similar)

### 2. Programming Elements
- **Base value**: {request_data.programming_elements}
- **If STATIC**: Use the exact base value above
- **If DYNAMIC**: Choose DIFFERENT elements from: Constants, Type Casting, Operators, Selection, Looping, Break/Continue, Recursion, Parameters, Return Values, Overloading, Class/Object, Constructor, Encapsulation, Inheritance, Polymorphism, Abstract Class, Interface, Exception Handling, I/O Flow
- ⚠️ **DO NOT use**: {request_data.programming_elements if 'programming_elements' not in static_elements else 'N/A (this is static)'}

### 3. Data Structures
- **Base value**: {request_data.data_structures}
- **If STATIC**: Use the exact base value above
- **If DYNAMIC**: Choose DIFFERENT structures from: Array, String, Stack, Queue, Tree, Graph, Set, Map, Linked Lists
- ⚠️ **DO NOT use**: {request_data.data_structures if 'data_structures' not in static_elements else 'N/A (this is static)'}

### 4. Input Source
- **Base value**: {request_data.input_source}
- **If STATIC**: Use the exact base value above
- **If DYNAMIC**: Choose a DIFFERENT value from: Standard Input, Input from file, Randomly Generated
- ⚠️ **DO NOT use**: {request_data.input_source if 'input_source' not in static_elements else 'N/A (this is static)'}

### 5. Output Source
- **Base value**: {request_data.output_source}
- **If STATIC**: Use the exact base value above
- **If DYNAMIC**: Choose a DIFFERENT value from: Standard Output, Output from file
- ⚠️ **DO NOT use**: {request_data.output_source if 'output_source' not in static_elements else 'N/A (this is static)'}

### 6. Question Description
- **Base value (first 150 chars)**: {request_data.question_description[:150]}...
- **If STATIC**: Use the exact complete description
- **If DYNAMIC**: Create a COMPLETELY DIFFERENT scenario (different context, different problem statement, different characters/numbers)

### 7. Task List
- **Base value**: {task_list_str if task_list_str else "None"}
- **Count required**: EXACTLY {task_count} task(s)
- **If STATIC**: Use the exact tasks above
- **If DYNAMIC**: Create {task_count} COMPLETELY DIFFERENT tasks (different actions, different requirements, different sequence)

### 8. Additional Functions
- **Base value**: {function_list_str if function_list_str else "None"}
- **Count required**: EXACTLY {function_count} function(s)
- **If STATIC**: Use the exact functions above
- **If DYNAMIC**: Create {function_count} DIFFERENT functions (different names, different purposes)

### 9. Additional Formulas
- **Base value**: {formula_list_str if formula_list_str else "None"}
- **Count required**: EXACTLY {formula_count} formula(s)
- **If STATIC**: Use the exact formulas above
- **If DYNAMIC**: Create {formula_count} DIFFERENT mathematical formulas/expressions

### 10. Input Information
- **Base value**: {getattr(request_data, 'input_information', 'N/A')[:100]}...
- **If STATIC**: Use the exact input information above
- **If DYNAMIC**: Create a DIFFERENT input format description

### 11. Output Information
- **Base value**: {getattr(request_data, 'output_information', 'N/A')[:100]}...
- **If STATIC**: Use the exact output information above
- **If DYNAMIC**: Create a DIFFERENT output format description

### 12. Input Output Example
- **Base value**: {getattr(request_data, 'input_output_example', 'N/A')[:100]}...
- **If STATIC**: Use the exact example above
- **If DYNAMIC**: Create a DIFFERENT example (different input values, different output results)

### 13. Additional Diagrams
- Always set to: [] (empty array - we cannot generate images)

---

## SECTION 4: IMPORTANT CONSTRAINTS

### Count Requirements (MUST match exactly):
- Task list: EXACTLY {task_count} task(s) per question
- Additional functions: EXACTLY {function_count} function(s) per question
- Additional formulas: EXACTLY {formula_count} formula(s) per question

### Complexity Requirements:
- Maintain SAME difficulty level as base question
- Similar solving time and cognitive load
- Appropriate for same educational level

### Uniqueness Requirements:
- Each of the {number_of_questions} generated questions MUST be UNIQUE from each other
- Different titles, different descriptions, different examples
- No two questions should be identical or nearly identical

---

## SECTION 5: OUTPUT FORMAT

Return a JSON object with a key "questions" that contains an array of exactly {number_of_questions} problem objects.

Format:
{{
    "questions": [
        {{
            "title": "string",
            "programming_elements": ["string", "string", ...],
            "data_structures": ["string", "string", ...],
            "input_source": "string",
            "output_source": "string",
            "question_description": "string",
            "task_list": ["string", "string", ...],
            "input_information": "string",
            "output_information": "string",
            "input_output_example": "string",
            "additional_functions": ["string", "string", ...],
            "additional_formulas": ["string", "string", ...],
            "additional_diagrams": []
        }},
        ... // {number_of_questions - 1} more objects
    ]
}}

---

## SECTION 6: FINAL CHECKLIST Before Generating

For EACH generated question, verify:

✅ STATIC fields: EXACT match with base question (word-for-word)
✅ DYNAMIC fields: COMPLETELY DIFFERENT from base question
✅ Counts: EXACTLY {task_count} tasks, {function_count} functions, {formula_count} formulas
✅ All {number_of_questions} questions are UNIQUE from each other
✅ Complexity: Similar difficulty level to base

---

## CRITICAL REMINDER:

**STATIC fields ({request_data.static_elements})**: Copy VERBATIM from base values above

**DYNAMIC fields (all other fields)**: 
- DO NOT copy base values
- DO NOT use synonyms of base values  
- Create substantively different content
- If base uses "Standard Input", use "Input from file" or "Randomly Generated"
- If base uses ["Array", "String"], use ["Stack", "Queue"] or ["Tree", "Graph"]

Now generate {number_of_questions} unique problems following all rules above.
"""

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7  # 增加temperature以获得更多变化
        )

        content = response.choices[0].message.content
        print(f"Raw response from API: {content[:500]}...")  # 只打印前500字符

        try:
            challenges_data = json.loads(content)
            # 尝试提取数组
            if isinstance(challenges_data, dict):
                # 检查常见键名
                for key in ['problems', 'challenges', 'questions', 'results']:
                    if key in challenges_data and isinstance(challenges_data[key], list):
                        challenges_data = challenges_data[key]
                        break
                else:
                    # 如果不是预期的结构，尝试直接使用
                    if any(isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict) for v in
                           challenges_data.values()):
                        for v in challenges_data.values():
                            if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                                challenges_data = v
                                break
                    else:
                        # 创建默认
                        challenges_data = []
        except json.JSONDecodeError as e:
            print(f"JSON解析错误: {e}")
            challenges_data = []

        if not isinstance(challenges_data, list):
            print(f"Warning: Expected list but got {type(challenges_data)}")
            challenges_data = []

        # 补充不足数量或截断
        if len(challenges_data) < number_of_questions:
            print(f"Warning: Only got {len(challenges_data)} questions, need {number_of_questions}")
            for i in range(len(challenges_data), number_of_questions):
                challenges_data.append(create_different_problem_solving_question(
                    request_data, static_elements, i + 1))

        if len(challenges_data) > number_of_questions:
            challenges_data = challenges_data[:number_of_questions]

        # 后处理验证
        validated_challenges = []
        for idx, challenge in enumerate(challenges_data):
            validated = validate_and_fix_challenge(
                challenge, request_data, static_elements, idx)
            validated_challenges.append(validated)

        return validated_challenges

    except Exception as e:
        print(f"Error generating problem solving challenges: {e}")
        return [create_different_problem_solving_question(request_data, static_elements, i + 1)
                for i in range(number_of_questions)]


def validate_and_fix_challenge(challenge: Dict, request_data: Any,
                               static_elements: List[str], idx: int) -> Dict:
    """验证并修复单个挑战问题"""

    # 确保所有必需字段存在
    required_fields = [
        "title", "programming_elements", "data_structures", "input_source", "output_source",
        "question_description", "task_list", "input_information", "output_information",
        "input_output_example", "additional_functions", "additional_formulas",
        "additional_diagrams"
    ]

    for field in required_fields:
        if field not in challenge:
            if field in ["programming_elements", "data_structures", "task_list",
                         "additional_functions", "additional_formulas", "additional_diagrams"]:
                challenge[field] = []
            elif field in ["title", "question_description", "input_information",
                           "output_information", "input_output_example"]:
                # 生成一个不同的值，而不是默认
                challenge[field] = f"Unique {field} for problem {idx + 1}"
            else:
                challenge[field] = f"Default {field}"

    # 强制 static_elements 保持原值
    for field in static_elements:
        if hasattr(request_data, field):
            value = getattr(request_data, field)
            challenge[field] = value

    # 确保计数匹配（对于非static字段）
    task_count = len(getattr(request_data, 'task_list', []))
    function_count = len(getattr(request_data, 'additional_functions', []))
    formula_count = len(getattr(request_data, 'additional_formulas', []))

    # 修正task_list数量
    if "task_list" not in static_elements:
        if len(challenge["task_list"]) != task_count:
            if task_count == 0:
                challenge["task_list"] = []
            elif len(challenge["task_list"]) > task_count:
                challenge["task_list"] = challenge["task_list"][:task_count]
            else:
                # 添加不同的任务
                while len(challenge["task_list"]) < task_count:
                    new_task = f"Unique task {len(challenge['task_list']) + 1} for problem {idx + 1}"
                    challenge["task_list"].append(new_task)

    # 修正additional_functions数量
    if "additional_functions" not in static_elements:
        if function_count == 0:
            challenge["additional_functions"] = []
        elif len(challenge["additional_functions"]) != function_count:
            if len(challenge["additional_functions"]) > function_count:
                challenge["additional_functions"] = challenge["additional_functions"][:function_count]
            else:
                while len(challenge["additional_functions"]) < function_count:
                    new_func = f"func_{len(challenge['additional_functions']) + 1}_{idx}"
                    challenge["additional_functions"].append(new_func)

    # 修正additional_formulas数量
    if "additional_formulas" not in static_elements:
        if formula_count == 0:
            challenge["additional_formulas"] = []
        elif len(challenge["additional_formulas"]) != formula_count:
            if len(challenge["additional_formulas"]) > formula_count:
                challenge["additional_formulas"] = challenge["additional_formulas"][:formula_count]
            else:
                while len(challenge["additional_formulas"]) < formula_count:
                    new_formula = f"Formula_{len(challenge['additional_formulas']) + 1} for problem {idx + 1}"
                    challenge["additional_formulas"].append(new_formula)

    return challenge


def create_different_problem_solving_question(request_data: Any,
                                              static_elements: List[str],
                                              problem_num: int) -> Dict[str, Any]:
    """创建完全不同的Problem Solving Question"""

    base_title = getattr(request_data, 'question_title', 'Programming Problem')

    # 创建不同的标题
    different_titles = [
        f"Alternative Problem: {base_title} Variant {problem_num}",
        f"Similar Challenge: {base_title} Exercise {problem_num}",
        f"Programming Task: Modified {base_title}",
        f"Code Challenge: {base_title} Adaptation"
    ]

    # 不同的编程元素（如果不在static_elements中）
    programming_elements = getattr(request_data, 'programming_elements', ['Selection', 'Looping'])
    if "programming_elements" not in static_elements:
        different_elements = [
            ['Conditionals', 'Iteration', 'Functions'],
            ['Loops', 'Branching', 'Modular Programming'],
            ['Control Structures', 'Subroutines', 'Error Handling'],
            ['Iteration', 'Selection', 'Recursion']
        ]
        programming_elements = different_elements[(problem_num - 1) % len(different_elements)]

    # 不同的数据结构（如果不在static_elements中）
    data_structures = getattr(request_data, 'data_structures', ['Array'])
    if "data_structures" not in static_elements:
        different_structures = [
            ['List', 'Dictionary'],
            ['Stack', 'Queue'],
            ['Hash Table', 'Vector'],
            ['Linked List', 'Tree']
        ]
        data_structures = different_structures[(problem_num - 1) % len(different_structures)]

    question = {
        "title": different_titles[(problem_num - 1) % len(different_titles)],
        "programming_elements": programming_elements,
        "data_structures": data_structures,
        "input_source": getattr(request_data, 'input_source', 'standard')
        if "input_source" in static_elements else 'standard',
        "output_source": getattr(request_data, 'output_source', 'standard')
        if "output_source" in static_elements else 'standard',
        "question_description": f"This is a completely different problem scenario #{problem_num} "
                                f"with similar complexity to the base question. "
                                f"Students must apply similar programming concepts in a new context.",
        "task_list": [f"Different task {i + 1} for problem {problem_num}"
                      for i in range(len(getattr(request_data, 'task_list', [])))],
        "input_information": f"Different input format for problem {problem_num}",
        "output_information": f"Different output format for problem {problem_num}",
        "input_output_example": f"Input example {problem_num} -> Output example {problem_num}",
        "additional_functions": [f"different_func_{i + 1}"
                                 for i in range(len(getattr(request_data, 'additional_functions', [])))]
        if "additional_functions" not in static_elements
        else getattr(request_data, 'additional_functions', []),
        "additional_formulas": [f"different_formula_{i + 1}"
                                for i in range(len(getattr(request_data, 'additional_formulas', [])))]
        if "additional_formulas" not in static_elements
        else getattr(request_data, 'additional_formulas', []),
        "additional_diagrams": [],
    }

    # 强制 static_elements 保持原值
    for field in static_elements:
        if hasattr(request_data, field):
            question[field] = getattr(request_data, field)

    return question
