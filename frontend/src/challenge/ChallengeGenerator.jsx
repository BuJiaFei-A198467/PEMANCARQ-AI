import React, {useState, useEffect, useRef} from "react"
import {useApi} from "../utils/api.js"
import {useUser} from "@clerk/clerk-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { exportToImage, exportToPDF } from "../utils/exportUtils.js";

export function ChallengeGenerator() {
    const [challenges, setChallenges] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [currentStep, setCurrentStep] = useState(0) // 0表示初始界面，1-4表示步骤
    const [numberOfQuestions, setNumberOfQuestions] = useState(1)
    const [quota, setQuota] = useState(null)
    const [animationClass, setAnimationClass] = useState("") // 控制动画效果
    const [visibility, setVisibility] = useState('private')  // 'private', 'shareable', 'public'
    const [showShareModal, setShowShareModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [currentBatchId, setCurrentBatchId] = useState(null);

    // 添加状态来跟踪每个挑战卡片的展开状态
    const [expandedCards, setExpandedCards] = useState({})
    // 添加PDF导出状态
    const [isExporting, setIsExporting] = useState(false)

    // Core attributes
    const [programmingElements, setProgrammingElements] = useState([])
    const [dataStructures, setDataStructures] = useState([])
    const [inputSource, setInputSource] = useState("standard")
    const [OutputSource, setOutputSource] = useState("standard")

    // Scenario attributes
    const [questionTitle, setQuestionTitle] = useState("")
    const [questionDescription, setQuestionDescription] = useState("")
    const [taskList, setTaskList] = useState([""])
    const [inputInformation, setInputInformation] = useState("")
    const [outputInformation, setOutputInformation] = useState("")
    const [inputOutputExample, setInputOutputExample] = useState("")

    // Optional attributes
    const [additionalFunctions, setAdditionalFunctions] = useState([])
    const [additionalFormulas, setAdditionalFormulas] = useState([])
    const [additionalDiagrams, setAdditionalDiagrams] = useState([])

    // Static elements selection
    const [staticElements, setStaticElements] = useState([])

    //控制教程弹窗
    const [showTutorial, setShowTutorial] = useState(false)

    const {makeRequest} = useApi()

const programmingElementsGroups = [
    {
        title: "VARIABLE",
        titleColor: "#1E40AF",   // 蓝色
        color: "#E0F2FE",
        items: [
            "Constants",
            "Type Casting",
            "Operators",
        ]
    },
    {
        title: "CONTROL FLOW",
        titleColor: "#1E40AF",   // 蓝色
        color: "#E0F2FE",
        items: [
            "Selection",
            "Looping",
            "Break/Continue",
            "Recursion",
        ]
    },
    {
        title: "FUNCTION",
        titleColor: "#1E40AF",   // 蓝色
        color: "#E0F2FE",
        items: [
            "Parameters",
            "Return Values",
            "Overloading",


        ]
    },
    {
        title: "OBJECT-ORIENTED",
        titleColor: "#1E40AF",   // 蓝色
        color: "#E0F2FE",
        items: [
            "Class/Object",
            "Constructor",
            "Encapsulation",
            "Inheritance",
            "Polymorphism",
            "Abstract Class",
            "Interface",
        ]
    },
    {
        title: "OTHERS",
        titleColor: "#1E40AF",   // 蓝色
        color: "#E0F2FE",
        items: [
            "Exception Handling",
            "I/O Flow",
        ]
    }
];


    const dataStructuresOptions = [
        "Array",
        "String",
        "Stack",
        "Queue",
        "Tree",
        "Graph",
        "Set",
        "Map",
        "Linked Lists",
    ]

    // Static elements options
    const staticElementsOptions = [
        "Programming Elements #",
        "Data Structures #",
        "Input Source #",
        "Output Source #",
        "Question Title",
        "Problem Description",
        "Task List",
        "Input Information",
        "Output Information",
        "Example Input-Output",
        "Additional Functions #",
        "Additional Formula #",
        "Additional Diagram Illustration #",
    ]


// 流程图组件 (function to set flowchart)
    const Flowchart = () => {
        const steps = [
            { number: 1, label: "Core Elements", type: "construction" },
            { number: 2, label: "Scenario Elements", type: "construction" },
            { number: 3, label: "Optional Elements", type: "construction" },
            { number: 4, label: "Preview", type: "construction" },
            { number: 5, label: "Static Elements", type: "setting" },
            { number: 6, label: "Number of Variants", type: "setting" }
        ];

        return (
            <div style={{
                marginBottom: '40px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                height: '200px',
            }}>
                {/* 阶段标签 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '60px',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        left: '23%',
                        top: '0',
                        backgroundColor: '#2272C3',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        zIndex: 2
                    }}>
                        Ⅰ: Building Base Question
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '7%',
                        top: '0',
                        backgroundColor: '#10B981',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        zIndex: 2
                    }}>
                        Ⅱ: Setting Generation Rules
                    </div>
                </div>

                {/* 流程图主体 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative'
                }}>
                    {/* 连线 */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '4%',
                        right: '4%',
                        height: '3px',
                        backgroundColor: '#ddd',
                        zIndex: 1
                    }}></div>

                    {/* 阶段分隔线 */}
                    <div style={{
                        position: 'absolute',
                        top: '-50',
                        left: '67%',
                        height: '190%',
                        width: '5px',
                        backgroundColor: '#999',
                        zIndex: 1
                    }}></div>

                    {/* 步骤圆圈 */}
                    {steps.map((step, index) => (
                        <div key={step.number} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {/* 步骤圆圈 */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: currentStep === step.number ?
                                    (step.type === 'construction' ? '#2272C3' : '#10B981') :
                                    '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: currentStep === step.number ? 'white' : '#666',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                border: currentStep === step.number ?
                                    `3px solid ${step.type === 'construction' ? '#1e5ea8' : '#0da46e'}` :
                                    '3px solid #ccc',
                                boxShadow: currentStep === step.number ? '0 0 10px rgba(0,0,0,0.2)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {step.number}
                            </div>

                            {/* 步骤标签 */}
                            <div style={{
                                marginTop: '10px',
                                fontSize: '14px',
                                fontWeight: currentStep === step.number ? 'bold' : 'normal',
                                color: currentStep === step.number ?
                                    (step.type === 'construction' ? '#2272C3' : '#10B981') :
                                    '#666',
                                textAlign: 'center',
                                maxWidth: '170px',
                                lineHeight: '1.2'
                            }}>
                                {step.label}
                            </div>

                        </div>
                    ))}
                </div>


            </div>
        );
    };



    // 获取配额信息 (check remaining quote for user)
    useEffect(() => {
        document.body.style.backgroundColor = "#2D3748"
        fetchQuota()
    }, [])

    const fetchQuota = async () => {
        try {
            const data = await makeRequest("quota")
            setQuota(data)
        } catch (err) {
            console.error("Failed to fetch quota:", err)
            // 设置默认配额
            setQuota({
                quota_remaining: 0,
                last_reset_data: new Date().toISOString()
            })
        }
    }

    const generateChallenges = async () => {
    setIsLoading(true)
    setError(null)

    try {

        // 添加字段名映射
        const fieldNameMapping = {
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
        };

        // 转换 staticElements 为实际字段名
        const mappedStaticElements = [...new Set(
        staticElements.map(elem => fieldNameMapping[elem] || elem)
        )];

        const requestData = {
            programming_elements: programmingElements,
            data_structures: dataStructures,
            input_source: inputSource,
            output_source: OutputSource,
            question_title: questionTitle,
            question_description: questionDescription,
            task_list: taskList.filter(task => task.trim() !== ""),
            input_information: inputInformation,
            output_information: outputInformation,
            input_output_example: inputOutputExample,
            additional_functions: additionalFunctions.filter(func => func.trim() !== ""),
            additional_formulas: additionalFormulas.filter(formula => formula.trim() !== ""),
            additional_diagrams: additionalDiagrams,
            number_of_questions: numberOfQuestions,
            static_elements: mappedStaticElements,  // ← 使用映射后的字段名
            // 注意：这里先不发送 visibility，等用户选择分享方式时再决定
            visibility: 'private', // 默认 private
        }

        const data = await makeRequest("generate-problem-solving-challenges", {
            method: "POST",
            body: JSON.stringify(requestData)
        })

        // 存储当前批次ID（用于后续操作）
        if (data && data.length > 0 && data[0].batchId) {
            setCurrentBatchId(data[0].batchId);
        }

        const initialExpandedState = {}
        data.forEach((challenge, index) => {
            initialExpandedState[index] = false
        })
        setExpandedCards(initialExpandedState)

        setChallenges(data)
        await fetchQuota()

        setAnimationClass("slide-out-left")
        setTimeout(() => {
            setCurrentStep(7)
            setAnimationClass("slide-in-right")
        }, 500)

    } catch (err) {
        console.error("Error generating challenges:", err)
        setError(err.message || "Failed to generate challenges.")
        if (err.message.includes("quota") || err.message.includes("Quota")) {
            await fetchQuota()
        }
    } finally {
        setIsLoading(false)
    }
}


// 保存到历史记录
const saveToHistory = () => {
    // 结果已经在生成时保存，直接返回
    goBackToStep0();
};


    // 切换卡片展开状态的函数
    const toggleCard = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }))
    }


    // 添加 goBackToStep0 函数
    const goBackToStep0 = () => {
        setAnimationClass("slide-out-right")
        setTimeout(() => {
            setCurrentStep(0)
            setAnimationClass("slide-in-left")
        }, 500)
    }

    const handleProgrammingElementChange = (element) => {
        if (programmingElements.includes(element)) {
            setProgrammingElements(programmingElements.filter(e => e !== element))
        } else {
            setProgrammingElements([...programmingElements, element])
        }
    }

    const handleDataStructureChange = (structure) => {
        if (dataStructures.includes(structure)) {
            setDataStructures(dataStructures.filter(s => s !== structure))
        } else {
            setDataStructures([...dataStructures, structure])
        }
    }

    const handleStaticElementChange = (element) => {
        if (staticElements.includes(element)) {
            setStaticElements(staticElements.filter(e => e !== element))
        } else {
            setStaticElements([...staticElements, element])
        }
    }

    const addTask = () => {
        setTaskList([...taskList, ""])
    }

    const updateTask = (index, value) => {
        const newTasks = [...taskList]
        newTasks[index] = value
        setTaskList(newTasks)
    }

    const removeTask = (index) => {
        if (taskList.length > 1) {
            const newTasks = taskList.filter((_, i) => i !== index)
            setTaskList(newTasks)
        }
    }

    const addAdditionalFunction = () => {
        setAdditionalFunctions([...additionalFunctions, ""])
    }

    const updateAdditionalFunction = (index, value) => {
        const newFunctions = [...additionalFunctions]
        newFunctions[index] = value
        setAdditionalFunctions(newFunctions)
    }

    const removeAdditionalFunction = (index) => {
        const newFunctions = additionalFunctions.filter((_, i) => i !== index)
        setAdditionalFunctions(newFunctions)
    }

    const addAdditionalFormula = () => {
        setAdditionalFormulas([...additionalFormulas, ""])
    }

    const updateAdditionalFormula = (index, value) => {
        const newFormulas = [...additionalFormulas]
        newFormulas[index] = value
        setAdditionalFormulas(newFormulas)
    }

    const removeAdditionalFormula = (index) => {
        const newFormulas = additionalFormulas.filter((_, i) => i !== index)
        setAdditionalFormulas(newFormulas)
    }

    const handleDiagramUpload = (event) => {
        const files = Array.from(event.target.files)
        // 在实际应用中，这里需要上传图片到服务器并获取URL
        // 目前我们只存储文件对象
        setAdditionalDiagrams([...additionalDiagrams, ...files])
    }

    const removeDiagram = (index) => {
        const newDiagrams = additionalDiagrams.filter((_, i) => i !== index)
        setAdditionalDiagrams(newDiagrams)
    }

    const startGeneration = () => {
        setAnimationClass("slide-out-left")
        setTimeout(() => {
            setCurrentStep(1)
            setAnimationClass("slide-in-right")
        }, 500)
    }

    const nextStep = () => {
        setAnimationClass("slide-out-left")
        setTimeout(() => {
            setCurrentStep(currentStep + 1)
            setAnimationClass("slide-in-right")
        }, 500)
    }

    const prevStep = () => {
        setAnimationClass("slide-out-right")
        setTimeout(() => {
            setCurrentStep(currentStep - 1)
            setAnimationClass("slide-in-left")
        }, 500)
    }

    const isCoreStepValid = () => {
        return programmingElements.length > 0 &&
            dataStructures.length > 0 &&
            inputSource &&
            OutputSource
    }

    const isScenarioStepValid = () => {
        return questionTitle.trim() !== "" &&
            questionDescription.trim() !== "" &&
            taskList.some(task => task.trim() !== "") &&
            inputInformation.trim() !== "" &&
            outputInformation.trim() !== ""
    }

    const getNextResetTime = () => {
        if (!quota?.last_reset_data) return null
        const resetDate = new Date(quota.last_reset_data)
        resetDate.setHours(resetDate.getHours() + 24)
        return resetDate
    }

    useEffect(() => {
    const forcedElements = [
        "Programming Elements #",
        "Data Structures #",
        "Input Source #",
        "Output Source #"
    ];
    setStaticElements(prev => {
        const newElements = [...prev];
        let changed = false;
        forcedElements.forEach(elem => {
            if (!newElements.includes(elem)) {
                newElements.push(elem);
                changed = true;
            }
        });
        return changed ? newElements : prev;
    });
}, []);

    // 检查是否有足够的配额
    const hasEnoughQuota = quota && quota.quota_remaining >= numberOfQuestions
    const {user} = useUser()
    const name = user?.username || user?.fullName || user?.primaryEmailAddress?.emailAddress;
    const cleanName = name?.replace(/\.+$/, "").trim();

    // 检查可选属性是否为空
    const isAdditionalFunctionsEmpty = additionalFunctions.length === 0 || additionalFunctions.every(func => func.trim() === "")
    const isAdditionalFormulasEmpty = additionalFormulas.length === 0 || additionalFormulas.every(formula => formula.trim() === "")
    const isAdditionalDiagramsEmpty = additionalDiagrams.length === 0

    return (
        <div className="challenge-container">
            {/* 初始界面 */}
            {currentStep === 0 && (
                <div className={`initial-screen ${animationClass}`}>
                    <h2>Welcome, {cleanName}</h2>

                    <div className="quota-display">
                        <p>Quota remaining today: {quota?.quota_remaining ?? 0}</p>
                        <p>Next refresh time: {getNextResetTime()?.toLocaleString()}</p>
                    </div>

                    <button
                        onClick={startGeneration}
                        className="next-button"
                    >
                        Start to generate
                    </button>

                    <p
                        style={{
                            marginTop: "400px",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontSize: "21px",
                            fontFamily: "'Pacifico', cursive",
                            width: "fit-content",
                            marginLeft: "auto",
                            marginRight: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onClick={() => setShowTutorial(true)}
                    >
                        Need a Tutorial?
                        <span className="material-icons" style={{fontSize: "24px"}}>menu_book</span>
                    </p>
                </div>
            )}

            {/* 教程弹窗 */}
            {showTutorial && (
                <div
                    onClick={() => setShowTutorial(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 20
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "white",
                            padding: "10px",
                            borderRadius: "10px",
                            width: "1200px",
                            textAlign: "center",
                            fontSize: "28px",
                            fontFamily: "'Pacifico', cursive",
                        }}
                    >
                        <h3>Tutorial</h3>
                        <div style={{marginTop: "20px"}}>
                            <img
                                src="/Tutorial.png"
                                alt="Tutorial Guide"
                                style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd"
                                }}
                            />
                        </div>

                        <button
                            onClick={() => setShowTutorial(false)}
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#2272C3",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "24px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <span className="material-icons" style={{fontSize: "32px"}}>arrow_back</span>
                            Back
                        </button>
                    </div>
                </div>
            )}





            {/* =================================Step 1-5: 显示流程图 ============================== */}
            {(currentStep >= 1 && currentStep <= 6) && <Flowchart />}




            {/* =================================Step 1: Core Attributes============================== */}
            {currentStep === 1 && (
                <div className={`step-container ${animationClass}`}>
                    <h3>Step 1: Core Element</h3>

                    <div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
                            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                                <strong>Note:</strong> The following elements can directly determine the complexity of a problem-solving question.
                            </p>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">apps</span>
                            Programming Element
                        </h4>
                        <div className="checkbox-group">
<div
    style={{
        display: "flex",
        flexDirection: "column", // 分组竖向排列
        gap: "20px",             // 分组之间间距
        alignItems: "flex-start"
    }}
>
    {programmingElementsGroups.map((group, gIndex) => (
        <div
            key={gIndex}
            style={{
                backgroundColor: group.color,
                padding: "12px 16px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column", // 分组内部竖向排列（标题 + checkbox 容器）
                gap: "8px",
                width: "100%"            // 占满整行
            }}
        >
            {/* 分组标题 */}
            <div style={{
                fontWeight: "bold",
                marginBottom: "8px",
                textAlign: "left",
                color: group.titleColor
            }}>
                {group.title}
            </div>

            {/* 分组选项 */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",   // ⭐ 横向排列并换行
                gap: "12px"         // checkbox 间距
            }}>
                {group.items.map((element, index) => (
                    <label key={index} className="checkbox-label" style={{ whiteSpace: "nowrap" }}>
                        <input
                            type="checkbox"
                            checked={programmingElements.includes(element)}
                            onChange={() => handleProgrammingElementChange(element)}
                        />
                        <span className="checkbox-text">{element}</span>
                    </label>
                ))}
            </div>
        </div>
    ))}
</div>


</div>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">storage</span>
                            Data Structure
                        </h4>
                        <div className="checkbox-group">
                            {dataStructuresOptions.map((structure, index) => (
                                <label key={index} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={dataStructures.includes(structure)}
                                        onChange={() => handleDataStructureChange(structure)}
                                    />
                                    <span className="checkbox-text">{structure}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">input</span>
                            Input Source
                        </h4>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    value="standard"
                                    checked={inputSource === "standard"}
                                    onChange={(e) => setInputSource(e.target.value)}
                                />
                                <span className="checkbox-text">Standard Input</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    value="file"
                                    checked={inputSource === "file"}
                                    onChange={(e) => setInputSource(e.target.value)}
                                />
                                <span className="checkbox-text">Input from File</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    value="random"
                                    checked={inputSource === "random"}
                                    onChange={(e) => setInputSource(e.target.value)}
                                />
                                <span className="checkbox-text">Randomly Generated</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">send</span>
                            Output Source
                        </h4>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    value="standard"
                                    checked={OutputSource === "standard"}
                                    onChange={(e) => setOutputSource(e.target.value)}
                                />
                                <span className="checkbox-text">Standard Output</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    value="file"
                                    checked={OutputSource === "file"}
                                    onChange={(e) => setOutputSource(e.target.value)}
                                />
                                <span className="checkbox-text">Output to File</span>
                            </label>
                        </div>
                    </div>

                    {/* 添加导航按钮容器 */}
                    <div className="step-navigation">
                        <button onClick={prevStep} className="next-button">
                            Previous
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!isCoreStepValid()}
                            className="next-button"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* =================================Step 2: Scenario Attributes============================== */}
            {/* Step 2: Scenario Attributes */}
            {currentStep === 2 && (
                <div className={`step-container ${animationClass}`}>
                    <h3>Step 2: Scenario Element</h3>

                    <div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
                            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                                <strong>Note:</strong> The following elements have no direct impact to complexity of a problem-solving question.                            </p>
                    </div>

                    <div className="form-section">

                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">star</span>
                            Question Title
                        </h4>
                        <input
                            type="text"
                            value={questionTitle}
                            onChange={(e) => setQuestionTitle(e.target.value)}
                            placeholder="Enter question title"
                            className="text-input"
                        />
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">description</span>
                            Question Description
                        </h4>
                        <textarea
                            value={questionDescription}
                            onChange={(e) => setQuestionDescription(e.target.value)}
                            placeholder="Enter detailed problem description"
                            className="text-area"
                            rows={4}
                        />
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">checklist</span>
                            Task List
                        </h4>
                        {taskList.map((task, index) => (
                            <div key={index} className="task-item">
                                <input
                                    type="text"
                                    value={task}
                                    onChange={(e) => updateTask(index, e.target.value)}
                                    placeholder={`Task ${index + 1}`}
                                    className="text-input"
                                />
                                {taskList.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTask(index)}
                                        className="remove-button"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addTask} className="add-button">
                            Add Task
                        </button>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">folder_open</span>
                            Input Information
                        </h4>
                        {inputSource === "random" ? (
                            <input
                                type="text"
                                value="Randomly Generated"
                                disabled
                                className="text-input disabled"
                            />
                        ) : (
                            <textarea
                                value={inputInformation}
                                onChange={(e) => setInputInformation(e.target.value)}
                                placeholder={
                                    inputSource === "standard"
                                        ? "Describe the input format for standard input"
                                        : "Describe the file content format for input file"
                                }
                                className="text-area"
                                rows={3}
                            />
                        )}
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">analytics</span>
                            Output Information
                        </h4>
                        <textarea
                            value={outputInformation}
                            onChange={(e) => setOutputInformation(e.target.value)}
                            placeholder={
                                OutputSource === "standard"
                                    ? "Describe the output format for standard output"
                                    : "Describe the file content format for output file"
                            }
                            className="text-area"
                            rows={3}
                        />
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">import_export</span>
                            Input-Output Example
                        </h4>
                        <textarea
                            value={inputOutputExample}
                            onChange={(e) => setInputOutputExample(e.target.value)}
                            placeholder={
                                "The example input and output"
                            }
                            className="text-area"
                            rows={3}
                        />
                    </div>

                    <div className="step-navigation">
                        <button onClick={prevStep} className="next-button">
                            Previous
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={!isScenarioStepValid()}
                            className="next-button"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* =================================Step 3:Optional Attributes============================== */}
            {/* Step 3: Optional Attributes */}
            {currentStep === 3 && (
                <div className={`step-container ${animationClass}`}>
                    <h3>Step 3: Optional Element</h3>

                    <div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
                            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                                <strong>Note:</strong> The following elements are not compulsory for building a problem-solving question (but affect complexity)
                            </p>
                    </div>

                    <div className="form-section">

                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">extension</span>
                            Additional Function
                        </h4>
                        {additionalFunctions.map((func, index) => (
                            <div key={index} className="optional-item">
                                <input
                                    type="text"
                                    value={func}
                                    onChange={(e) => updateAdditionalFunction(index, e.target.value)}
                                    placeholder="Function signature and description"
                                    className="text-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAdditionalFunction(index)}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addAdditionalFunction} className="add-button">
                            Add Function
                        </button>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">functions</span>
                            Additional Formula
                        </h4>
                        {additionalFormulas.map((formula, index) => (
                            <div key={index} className="optional-item">
                                <input
                                    type="text"
                                    value={formula}
                                    onChange={(e) => updateAdditionalFormula(index, e.target.value)}
                                    placeholder="Mathematical formula or equation"
                                    className="text-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeAdditionalFormula(index)}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addAdditionalFormula} className="add-button">
                            Add Formula
                        </button>
                    </div>

                    <div className="form-section">
                        <h4 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span className="material-icons">scatter_plot</span>
                            Additional Diagram Illustration (under development)
                        </h4>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleDiagramUpload}
                            className="file-input"
                            multiple
                        />
                        {additionalDiagrams.length > 0 && (
                            <div className="diagram-preview">
                                <h5>Uploaded Diagrams:</h5>
                                {additionalDiagrams.map((diagram, index) => (
                                    <div key={index} className="diagram-item">
                                        <span>{diagram.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeDiagram(index)}
                                            className="remove-button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="step-navigation">
                        <button onClick={prevStep} className="next-button">
                            Previous
                        </button>
                        <button onClick={nextStep} className="next-button">
                            Next
                        </button>
                    </div>
                </div>
            )}



{/* =================================Step 4: Preview============================== */}
{currentStep === 4 && (
    <div className={`step-container ${animationClass}`}>
        <h3>Step 4: Preview Base Question</h3>

        <div className="preview-note">
            Review all settings before proceeding to nexr phase.
        </div>

        {/* ================= CORE ================= */}
        <div className="preview-section">
            <h4>Core Elements</h4>

            <div className="preview-grid">
                <div className="preview-item">
                   <span className="preview-label">
                        <span className="material-icons icon-small">functions</span>
                         <span>Programming Elements</span>
                            </span>
                    <span className="preview-value">
                       {programmingElements.length > 0 ? (
        <div className="tag-container">
            {programmingElements.map((item, index) => (
                <span key={index} className="tag-item">
                    {item}
                </span>
            ))}
        </div>
    ) : (
        "None"
    )}
                    </span>
                </div>

                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">storage</span>
                         <span>Data Structure</span>
                        </span>
                    <span className="preview-value">
                        {dataStructures.length > 0 ? (
        <div className="tag-container">
            {dataStructures.map((item, index) => (
                <span key={index} className="tag-item">
                    {item}
                </span>
            ))}
        </div>
    ) : (
        "None"
    )}
                    </span>
                </div>

                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">input</span>
                         <span>Input Source</span>
                        </span>
                    <span className="suggest-badge">
                        {inputSource || "None"}
                    </span>
                </div>

                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">send</span>
                         <span>Output Source</span>
                        </span>
                    <span className="suggest-badge">
                        {OutputSource || "None"}
                    </span>
                </div>
            </div>
        </div>

        {/* ================= SCENARIO ================= */}
        <div className="preview-section">
            <h4>Scenario Elements</h4>

            <div className="preview-grid">
                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">star</span>
                         <span>Question Title</span>
                        </span>
                    <span className="preview-value2">
                        {questionTitle || "None"}
                    </span>
                </div>

                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">description</span>
                         <span>Question Description</span>
                        </span>
                    <span className="preview-value2">
                        {questionDescription || "None"}
                    </span>
                </div>

                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">checklist</span>
                         <span>Task List</span>
                        </span>
                    <span className="preview-value2">
                        <ul className="preview-list">
                            {taskList.filter(t => t.trim() !== "").map((t, i) => (
                                <li key={i}>{t}</li>
                            ))}
                        </ul>
                    </span>
                </div>

                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">folder_open</span>
                         <span>Input Information</span>
                        </span>
                    <span className="preview-value2">
                        {inputInformation || "None"}
                    </span>
                </div>

                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">analytics</span>
                         <span>Output Information</span>
                        </span>
                    <span className="preview-value2">
                        {outputInformation || "None"}
                    </span>
                </div>

                <div className="preview-item full">
                    <span className="preview-label">
                        <span className="material-icons icon-small">import_export</span>
                         <span>Input-Output Example</span>
                        </span>
                    <span className="preview-value2">
                        {inputOutputExample || "None"}
                    </span>
                </div>
            </div>
        </div>

        {/* ================= OPTIONAL ================= */}
        <div className="preview-section">
            <h4>Optional Elements</h4>

            <div className="preview-grid">
                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">extension</span>
                         <span>Additional Function</span>
                        </span>
                    <span className="preview-value2">
                        {additionalFunctions.join(", ") || "None"}
                    </span>
                </div>

                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">functions</span>
                         <span>Additional Formula</span>
                        </span>
                    <span className="preview-value2">
                        {additionalFormulas.join(", ") || "None"}
                    </span>
                </div>

                <div className="preview-item">
                    <span className="preview-label">
                        <span className="material-icons icon-small">scatter_plot</span>
                         <span>Diagram Illustration</span>
                        </span>
                    <span className="preview-value2">
                        {additionalDiagrams.length || 0} file(s)
                    </span>
                </div>
            </div>
        </div>

        {/* ================= BUTTON ================= */}
        <div className="step-navigation">
            <button onClick={prevStep} className="next-button">
                Back
            </button>

            <button onClick={nextStep} className="next-button">
                Next
            </button>
        </div>
    </div>
)}







            {/* =================================Step 5: Static Elem ents Selection============================== */}
            {currentStep === 5 && (


    <div className={`step-container ${animationClass}`}>
        <h3>Step 5: Determine static and non-static element</h3>

        <div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                <strong>Note:</strong> The selected elements will be considered as static element which remain completely same between base
                question and generated question. Some elements are highlighted because they are suggested
                to select to make sure the same complexity between base question and generated question.
            </p>
        </div>





        <div className="form-section">
            <div className="checkbox-group-vertical">
                {staticElementsOptions.map((element, index) => {
                    // 检查是否应该禁用
                    let isDisabled = false;
                    let disabledReason = "";
                    let isForcedChecked = false;

                    // 获取元素的基础名称（去除 # 符号）
                    const baseElementName = element.replace(' #', '');

                    // 定义强制静态的核心元素
                    const forcedStaticElements = [
                        "Programming Elements",
                        "Data Structures",
                        "Input Source",
                        "Output Source"
                    ];

                    // 检查是否是强制静态元素
                    if (forcedStaticElements.includes(baseElementName)) {
                        isDisabled = true;
                        isForcedChecked = true;
                        disabledReason = " (Required - ensures consistent complexity)";
                    }

                    // 检查是否包含 # 符号（建议元素）
                    const isCoreElement = element.includes('#') && !isForcedChecked;

                    // 检查其他禁用条件
                    if (element === "Additional Functions" && isAdditionalFunctionsEmpty) {
                        isDisabled = true;
                        disabledReason = " (No additional functions added in Step 3)";
                    }
                    if (element === "Additional Formula" && isAdditionalFormulasEmpty) {
                        isDisabled = true;
                        disabledReason = " (No additional formulas added in Step 3)";
                    }
                    if (element === "Additional Diagram Illustration" && isAdditionalDiagramsEmpty) {
                        isDisabled = true;
                        disabledReason = " (No diagrams added in Step 3)";
                    }



                    return (
                        <label
                            key={index}
                            className={`checkbox-label ${isDisabled ? 'disabled' : ''}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '12px',
                                padding: '10px',
                                backgroundColor: isForcedChecked ? '#E8F5E9' : (isCoreElement ? '#E6F7FF' : (isDisabled ? '#f5f5f5' : 'transparent')),
                                borderRadius: '8px',
                                border: isForcedChecked ? '1px solid #4CAF50' : (isCoreElement ? '1px solid #B3E0FF' : (isDisabled ? '1px solid #e0e0e0' : '1px solid #ddd')),
                                boxShadow: isForcedChecked ? '0 2px 4px rgba(76, 175, 80, 0.2)' : (isCoreElement ? '0 2px 4px rgba(34, 114, 195, 0.1)' : 'none'),
                                position: 'relative',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.8 : 1,
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={isForcedChecked || staticElements.includes(element)}
                                onChange={() => {
                                    // 强制静态元素不允许修改
                                    if (!isForcedChecked) {
                                        handleStaticElementChange(element);
                                    }
                                }}
                                disabled={isDisabled || isForcedChecked}
                                style={{
                                    marginRight: '12px',
                                    transform: 'scale(1.2)',
                                    cursor: (isDisabled || isForcedChecked) ? 'not-allowed' : 'pointer'
                                }}
                            />
                            <span
                                className={`checkbox-text ${isDisabled ? 'disabled' : ''}`}
                                style={{
                                    color: isForcedChecked ? '#2E7D32' : (isDisabled ? '#999' : '#333'),
                                    fontSize: '18px',
                                    fontFamily: "'Segoe UI', sans-serif",
                                    cursor: (isDisabled || isForcedChecked) ? 'not-allowed' : 'default',
                                    fontWeight: (isForcedChecked || isCoreElement) ? '600' : 'normal',
                                    flex: 1,
                                }}
                            >
                                {baseElementName}
                            </span>

                            {isForcedChecked && (
                                <span
                                    className="suggest-badge"
                                    style={{
                                        backgroundColor: '#4CAF50',
                                        color: 'white'
                                    }}>
                                    Required
                                </span>
                            )}

                            {isCoreElement && !isForcedChecked && (
                                <span
                                    className="suggest-badge"
                                    style={{
                                        backgroundColor: '#2272C3',
                                        color: 'white'
                                    }}>
                                    Suggest
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>
        </div>

        <div className="step-navigation">
            <button onClick={prevStep} className="next-button">
                Previous
            </button>
            <button onClick={nextStep} className="next-button">
                Next
            </button>
        </div>
    </div>
)}



            {/* =================================Step 6: Number of Questions============================== */}
            {/* Generation Panel */}
            {currentStep === 6 && (
                <div className={`step-container ${animationClass}`}>

                    <h3>Step 6: How many questions you need?</h3>

                     <div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
                            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                                <strong>Note:</strong> You are allowed to generate up to 10 questions one time and the number cannot exceed the remaining quota.
                            </p>
                    </div>

                    <div className="form-section">

                        <input
                            id="numberOfQuestions"
                            type="number"
                            min="1"
                            max="10"
                            value={numberOfQuestions}
                            onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
                            className="number-input"
                        />
                        {quota && (
                            <p className="quota-info">
                                You have {quota.quota_remaining} generation(s) remaining.
                                {!hasEnoughQuota && (
                                    <span
                                        className="quota-error"> Not enough quota for {numberOfQuestions} question(s).</span>
                                )}
                            </p>
                        )}
                    </div>

                    <div className="step-navigation">
                        <button onClick={prevStep} className="next-button">
                            Previous
                        </button>
                        <button
                            onClick={generateChallenges}
                            disabled={isLoading || !hasEnoughQuota}
                            className="generate-button"
                        >
                            {isLoading ? "Generating..." : `Generate ${numberOfQuestions} Question(s)`}
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

            {/* =================================Step 7:Display Result============================== */}
            {/* 显示被生成的问题 */}

{/* Step 7: 显示生成结果 */}
{currentStep === 7 && (
    <div className={`step-container ${animationClass}`}>
        <h3>Generated Questions</h3>

<div style={{marginTop: '0px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px'}}>
                            <p style={{margin: 0, color: '#2272C3', fontSize: '16px'}}>
                                <strong>Note:</strong> The result will be saved in "History" automatically, go to "History" Page to manage your result!
                            </p>
                    </div>

        <div className="step-navigation">
            {/* Save in History 按钮 */}
            <button onClick={saveToHistory} className="next-button">
                Finish
                <span className="material-icons">save</span>
            </button>
        </div>

                    {challenges.length > 0 && (
                        <div className="generated-challenges">
                            {challenges.map((challenge, index) => (
                                <div className="challenge-card" key={index}>
                                    {/* Header */}
                                    <div
                                        className="challenge-header"
                                        onClick={() => toggleCard(index)}
                                        style={{cursor: 'pointer'}}
                                    >
                                        <h4>{`Q${index + 1}: ${challenge.title}`}</h4>
                                        <span className="chevron">
                                            {expandedCards[index] ? '▲' : '▼'}
                                        </span>
                                    </div>

                                    {/* Content - 根据展开状态显示或隐藏 */}
                                    {expandedCards[index] && (
                                        <div className="challenge-content">
                                            {/* Description */}
                                            <div className="challenge-section">
                                                <h5>Description</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.question_description}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Programming Elements */}
                                            <div className="challenge-section">
                                                <h5>Programming Elements</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.programming_elements?.join(", ")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Data Structures */}
                                            <div className="challenge-section">
                                                <h5>Data Structures</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.data_structures?.join(", ")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Input Source */}
                                            <div className="challenge-section">
                                                <h5>Input Source</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.input_source}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Output Source */}
                                            <div className="challenge-section">
                                                <h5>Output Source</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.output_source}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Input Info */}
                                            <div className="challenge-section">
                                                <h5>Input Info</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.input_information}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Output Info */}
                                            <div className="challenge-section">
                                                <h5>Output Info</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.output_information}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Input Output Example */}
                                            <div className="challenge-section">
                                                <h5>Input Output Example</h5>
                                                <div className="challenge-attribute">
                                                    <span className="attribute-value">
                                                        {challenge.input_output_example}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Tasks */}
                                            {challenge.task_list?.length > 0 && (
                                                <div className="challenge-section">
                                                    <h5>Tasks</h5>
                                                    <div className="challenge-attribute">
                                                        <span className="attribute-value">
                                                            <ul>
                                                                {challenge.task_list.map((task, i) => (
                                                                    <li key={i}>{task}</li>
                                                                ))}
                                                            </ul>
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Functions */}
                                            {challenge.additional_functions?.length > 0 && (
                                                <div className="challenge-section">
                                                    <h5>Functions</h5>
                                                    <div className="challenge-attribute">
                                                        <span className="attribute-value">
                                                            {challenge.additional_functions.join(", ")}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Formulas */}
                                            {challenge.additional_formulas?.length > 0 && (
                                                <div className="challenge-section">
                                                    <h5>Formulas</h5>
                                                    <div className="challenge-attribute">
                                                        <span className="attribute-value">
                                                            {challenge.additional_formulas.join(", ")}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}

        </div>
    )
}
