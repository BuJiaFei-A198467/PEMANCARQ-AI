// utils/exportUtils.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * 将显示标签转换为字段名（小写+下划线）
 * 例如 "Programming Elements" -> "programming_elements"
 * 同时支持去除特殊符号
 */
const labelToFieldName = (label) => {
    return label
        .toLowerCase()
        .replace(/[#*]/g, '')     // 移除 # 和 *
        .replace(/\s+/g, '_')     // 空格转下划线
        .trim();
};

/**
 * 格式化挑战数据为导出所需格式
 * 统一处理 Generator 和 History 的不同数据结构
 */
const normalizeChallengesForExport = (data) => {
    // 如果是数组，说明来自 Generator (challenges state)
    if (Array.isArray(data)) {
        return {
            challenges: data,
            title: "Generated Problem-solving Questions"
        };
    }

    // 如果是对象，说明来自 History (selectedGroup)
    if (data && data.generated_questions) {
        return {
            challenges: data.generated_questions.map(q => ({
                ...q,
                title: q.title,
                question_description: q.question_description,
                programming_elements: q.programming_elements,
                data_structures: q.data_structures,
                input_source: q.input_source,
                output_source: q.output_source,
                input_information: q.input_information,
                output_information: q.output_information,
                input_output_example: q.input_output_example,
                task_list: q.task_list,
                additional_functions: q.additional_functions,
                additional_formulas: q.additional_formulas,
                additional_diagrams: q.additional_diagrams,
            })),
            title: "Problem-solving Questions from History"
        };
    }

    return { challenges: [], title: "" };
};

/**
 * 解析 Input/Output Example 文本，提取 Input 和 Output 部分
 * 假设格式为：
 * <Sample Input>
 * ... input content ...
 * <Sample Output>
 * ... output content ...
 */
const parseInputOutputExample = (text) => {
    if (!text || text === "None") return null;
    
    const inputMatch = text.match(/<Sample Input>\s*([\s\S]*?)(?=<Sample Output>|$)/);
    const outputMatch = text.match(/<Sample Output>\s*([\s\S]*?)$/);
    
    return {
        input: inputMatch ? inputMatch[1].trim() : "",
        output: outputMatch ? outputMatch[1].trim() : ""
    };
};

/**
 * 导出为图片
 * @param {Array|Object} data - 挑战数据（数组或History的group对象）
 * @param {Array} staticElements - 静态元素列表（可选，Generator中使用）
 */
export const exportToImage = async (data, staticElements = []) => {
    try {
        const { challenges } = normalizeChallengesForExport(data);

        if (challenges.length === 0) {
            alert("No questions to export");
            return;
        }

        // 计算总宽度
        const columnWidth = 280;
        const columnGap = 15;
        const totalWidth = challenges.length * (columnWidth + columnGap) + 40;

        // 创建容器元素
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: ${totalWidth}px;
            background: white;
            padding: 20px;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 99999;
        `;

        // 核心元素（红色边框）
        const coreElements = [
            "Programming Elements *",
            "Data Structures *",
            "Input Source *",
            "Output Source *",
            "Additional Functions *",
            "Additional Formula *",
            "Additional Diagram Illustration *",
        ];

        // 标准化静态元素列表（用于快速匹配）
        const staticFieldSet = new Set(staticElements.map(se => labelToFieldName(se)));

        const coreElementColor = "#E53E3E";
        const staticElementColor = "#2272C3";

        // 添加静态元素和核心元素图例到顶部
        if (staticElements.length > 0 || coreElements.length > 0) {
            // 静态元素图例
            if (staticElements.length > 0) {
                const legend = document.createElement('div');
                legend.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 12px;
                    font-size: 12px;
                    margin-bottom: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    width: 100%;
                    box-sizing: border-box;
                `;

                const legendTitle = document.createElement('div');
                legendTitle.textContent = 'Static Elements (Highlighted in Blue)';
                legendTitle.style.cssText = `
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: ${staticElementColor};
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                `;

                const legendIcon = document.createElement('span');
                legendTitle.prepend(legendIcon);
                legend.appendChild(legendTitle);

                const legendItemsContainer = document.createElement('div');
                legendItemsContainer.style.cssText = `
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                `;

                staticElements.forEach(element => {
                    const legendItem = document.createElement('div');
                    legendItem.style.cssText = `
                        display: flex;
                        align-items: center;
                        background: #E6F7FF;
                        border: 1px solid #B3E0FF;
                        border-radius: 4px;
                        padding: 4px 8px;
                        font-size: 11px;
                    `;

                    const colorBox = document.createElement('div');
                    colorBox.style.cssText = `
                        width: 10px;
                        height: 10px;
                        background-color: ${staticElementColor};
                        border-radius: 2px;
                        margin-right: 6px;
                    `;

                    const label = document.createElement('span');
                    // 显示时去除符号，转为更适合阅读的形式
                    let displayName = element.replace(/[#*]/g, '').trim();
                    // 如果是字段名（包含下划线），转为空格分隔的大写单词
                    if (displayName.includes('_')) {
                        displayName = displayName.split('_').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                    }
                    label.textContent = displayName;
                    label.style.cssText = `
                        color: ${staticElementColor};
                        font-weight: 600;
                    `;

                    legendItem.appendChild(colorBox);
                    legendItem.appendChild(label);
                    legendItemsContainer.appendChild(legendItem);
                });

                legend.appendChild(legendItemsContainer);
                container.appendChild(legend);
            }

            // 核心元素图例
            const coreLegend = document.createElement('div');
            coreLegend.style.cssText = `
                background: #fff5f5;
                border: 1px solid #fed7d7;
                border-radius: 8px;
                padding: 12px;
                font-size: 12px;
                margin-bottom: 10px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                width: 100%;
                box-sizing: border-box;
            `;

            const coreLegendTitle = document.createElement('div');
            coreLegendTitle.textContent = 'Core Elements (Highlighted in Red Border)';
            coreLegendTitle.style.cssText = `
                font-weight: bold;
                margin-bottom: 10px;
                color: ${coreElementColor};
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
            `;

            const coreLegendIcon = document.createElement('span');
            coreLegendTitle.prepend(coreLegendIcon);
            coreLegend.appendChild(coreLegendTitle);

            const coreLegendItemsContainer = document.createElement('div');
            coreLegendItemsContainer.style.cssText = `
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            `;

            coreElements.forEach(element => {
                const coreItem = document.createElement('div');
                coreItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    background: transparent;
                    border: 1px solid #feb2b2;
                    border-radius: 4px;
                    padding: 4px 8px;
                    font-size: 11px;
                `;

                const colorBox = document.createElement('div');
                colorBox.style.cssText = `
                    width: 10px;
                    height: 10px;
                    background-color: ${coreElementColor};
                    border-radius: 2px;
                    margin-right: 6px;
                `;

                const label = document.createElement('span');
                label.textContent = element.replace(' *', '');
                label.style.cssText = `
                    color: ${coreElementColor};
                    font-weight: 600;
                `;

                coreItem.appendChild(colorBox);
                coreItem.appendChild(label);
                coreLegendItemsContainer.appendChild(coreItem);
            });

            coreLegend.appendChild(coreLegendItemsContainer);
            container.appendChild(coreLegend);
        }

        // 创建列容器
        const columnsContainer = document.createElement('div');
        columnsContainer.style.cssText = `
            display: flex;
            flex-direction: row;
            gap: ${columnGap}px;
            width: 100%;
            overflow-x: auto;
        `;

        // 为每个挑战创建列
        challenges.forEach((challenge, challengeIndex) => {
            const column = document.createElement('div');
            column.style.cssText = `
                width: ${columnWidth}px;
                min-width: ${columnWidth}px;
                border: 2px solid #2272C3;
                border-radius: 10px;
                padding: 15px;
                background: #f8f9fa;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;

            // 添加标题
            const title = document.createElement('h3');
            title.textContent = `Q${challengeIndex + 1}: ${challenge.title || 'Untitled'}`;
            title.style.cssText = `
                margin: 0 0 10px 0;
                color: #2272C3;
                font-size: 18px;
                text-align: center;
                padding-bottom: 8px;
                border-bottom: 2px solid #2272C3;
            `;
            column.appendChild(title);

            // 定义13个元素的顺序和映射
            const elementOrder = [
                { key: "programming_elements", label: "Programming Elements", isArray: true },
                { key: "data_structures", label: "Data Structures", isArray: true },
                { key: "input_source", label: "Input Source", isArray: false },
                { key: "output_source", label: "Output Source", isArray: false },
                { key: "title", label: "Question Title", isArray: false },
                { key: "question_description", label: "Problem Description", isArray: false },
                { key: "task_list", label: "Task List", isArray: true },
                { key: "input_information", label: "Input Information", isArray: false },
                { key: "output_information", label: "Output Information", isArray: false },
                { key: "input_output_example", label: "Example Input-Output", isArray: false },
                { key: "additional_functions", label: "Additional Functions", isArray: true },
                { key: "additional_formulas", label: "Additional Formula", isArray: true },
                { key: "additional_diagrams", label: "Additional Diagram Illustration", isArray: true }
            ];

            // 添加元素
            elementOrder.forEach(element => {
                const elementDiv = document.createElement('div');

                // 判断是否为核心元素（左侧边框红色）和静态元素（标签名称蓝色）
                const isCore = coreElements.includes(element.label + " *");
                const fieldName = labelToFieldName(element.label);
                const isStatic = staticFieldSet.has(fieldName);

                const borderLeftColor = isCore ? coreElementColor : '#ddd';
                const labelColor = isStatic ? staticElementColor : '#333';

                elementDiv.style.cssText = `
                    padding: 8px;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    border-left: 4px solid ${borderLeftColor};
                    background-color: transparent;
                `;

                // 标签
                const label = document.createElement('strong');
                label.textContent = element.label;
                label.style.cssText = `
                    display: block;
                    margin-bottom: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    color: ${labelColor};
                `;

                // 值
                const value = document.createElement('div');
                let valueText = '';

                if (element.isArray && Array.isArray(challenge[element.key])) {
                    valueText = challenge[element.key].join(', ');
                } else {
                    valueText = challenge[element.key] || 'N/A';
                }

                value.textContent = valueText;
                value.style.cssText = `
                    color: #555;
                    line-height: 1.4;
                    max-height: 60px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                `;

                elementDiv.appendChild(label);
                elementDiv.appendChild(value);
                column.appendChild(elementDiv);
            });

            columnsContainer.appendChild(column);
        });

        container.appendChild(columnsContainer);
        document.body.appendChild(container);

        // 使用html2canvas转换为图片
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: container.offsetWidth,
            height: container.offsetHeight
        });

        // 创建下载链接
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `generated-questions-${new Date().toISOString().split('T')[0]}.png`;
        link.click();

        // 清理
        document.body.removeChild(container);

    } catch (error) {
        console.error('Error exporting to image:', error);
        alert('Failed to export image. Please try again.');
    }
};

/**
 * 导出为PDF
 * @param {Array|Object} data - 挑战数据
 * @param {Array} staticElements - 静态元素列表（可选）
 */
export const exportToPDF = async (data, staticElements = []) => {
    try {
        const { challenges } = normalizeChallengesForExport(data);

        if (challenges.length === 0) {
            alert("No questions to export");
            return;
        }

        const pdf = new jsPDF('p', 'mm', 'a4');

        const sanitizeText = (text) => {
            if (!text) return "";
            return text
                .replace(/≤/g, '<=')
                .replace(/≥/g, '>=')
                .replace(/≠/g, '!=');
        };

        pdf.setFontSize(20);
        pdf.setTextColor(40, 53, 147);
        pdf.text("Generated Problem-solving Questions", 105, 20, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Time: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        pdf.text(`Number: ${challenges.length}`, 105, 36, { align: 'center' });

        let yPosition = 50;

        const checkNewPage = (neededHeight) => {
            if (yPosition + neededHeight > 270) {
                pdf.addPage();
                yPosition = 20;
                return true;
            }
            return false;
        };

        const addTextWithPagination = (text, fontSize = 12, x = 20, lineHeightMultiplier = 1.2) => {
            if (!text || text.trim() === '') return 0;
            const sanitizedText = sanitizeText(text);
            const lineHeight = fontSize * 0.353 * lineHeightMultiplier;
            const maxWidth = 170;
            const lines = pdf.splitTextToSize(sanitizedText, maxWidth);
            const neededHeight = lines.length * lineHeight;
            checkNewPage(neededHeight);
            pdf.setFontSize(fontSize);
            pdf.text(lines, x, yPosition);
            yPosition += neededHeight + 2;
            return lines.length;
        };

        const addAttributeTitle = (title) => {
            checkNewPage(10);
            pdf.setFontSize(12);
            pdf.setTextColor(40, 53, 147);
            pdf.setFont(undefined, 'bold');
            pdf.text(sanitizeText(title), 20, yPosition);
            yPosition += 6;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'normal');
        };

        const addAttributeContent = (content, fontSize = 11, indent = 0) => {
            if (!content || content === "None") return;
            const xPosition = 20 + indent;
            addTextWithPagination(content, fontSize, xPosition);
        };

        const addFourByTwoTable = (tableData) => {
            const cellWidth = 85;
            const cellHeight = 12;
            const startX = 20;
            let currentY = yPosition;

            const entries = [
                ["Programming Elements", tableData.programming_elements || "None"],
                ["Data Structures", tableData.data_structures || "None"],
                ["Input Source", tableData.input_source || "None"],
                ["Output Source", tableData.output_source || "None"],
            ];

            checkNewPage(entries.length * cellHeight + 10);

            pdf.setFontSize(12);
            pdf.setFont(undefined, "normal");

            entries.forEach(([label, value]) => {
                pdf.rect(startX, currentY, cellWidth, cellHeight);
                pdf.rect(startX + cellWidth, currentY, cellWidth, cellHeight);

                pdf.text(label, startX + 2, currentY + 7);

                const v = Array.isArray(value) ? value.join(", ") : value;
                const sanitized = sanitizeText(v);
                pdf.text(sanitized, startX + cellWidth + 2, currentY + 7);

                currentY += cellHeight;
            });

            yPosition = currentY + 10;
        };

        // 添加 Input/Output 表格函数
        const addInputOutputTable = (ioExample) => {
            if (!ioExample || ioExample === "None") return;
            
            const parsed = parseInputOutputExample(ioExample);
            if (!parsed || (!parsed.input && !parsed.output)) {
                // 如果解析失败，使用原来的方式显示
                addAttributeTitle("Input/Output Example");
                addAttributeContent(ioExample, 12);
                return;
            }
            
            // 计算需要的空间
            const maxWidth = 85; // 每列宽度
            const fontSize = 10;
            const lineHeight = fontSize * 0.353 * 1.2;
            const cellPadding = 4;
            const headerHeight = 8;
            
            // 分割文本为行
            const inputLines = parsed.input ? parsed.input.split('\n') : [''];
            const outputLines = parsed.output ? parsed.output.split('\n') : [''];
            
            // 计算最大行数
            const maxLines = Math.max(inputLines.length, outputLines.length);
            
            // 添加标题
            addAttributeTitle("Input/Output Example");
            
            // 检查是否需要新页
            const neededHeight = headerHeight + (maxLines * lineHeight) + (cellPadding * 2) + 10;
            checkNewPage(neededHeight);
            
            const startX = 20;
            const startY = yPosition;
            const tableWidth = 170; // 总宽度
            
            // 绘制表格边框
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.1);
            
            // 绘制表头
            pdf.setFillColor(240, 244, 255);
            pdf.rect(startX, startY, tableWidth, headerHeight, 'F');
            pdf.rect(startX, startY, tableWidth, headerHeight);
            
            // 绘制分隔线
            pdf.line(startX + maxWidth, startY, startX + maxWidth, startY + headerHeight);
            
            // 表头文字
            pdf.setFontSize(11);
            pdf.setFont(undefined, 'bold');
            pdf.setTextColor(40, 53, 147);
            pdf.text("Input", startX + 5, startY + 6);
            pdf.text("Output", startX + maxWidth + 5, startY + 6);
            
            // 计算数据区域高度
            const dataHeight = maxLines * lineHeight + cellPadding * 2;
            const dataStartY = startY + headerHeight;
            
            // 绘制数据区域边框
            pdf.rect(startX, dataStartY, tableWidth, dataHeight);
            pdf.line(startX + maxWidth, dataStartY, startX + maxWidth, dataStartY + dataHeight);
            
            // 填充数据
            pdf.setFontSize(fontSize);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
            
            // 填充 Input 数据
            inputLines.forEach((line, index) => {
                if (index < maxLines) {
                    const yPos = dataStartY + cellPadding + (index * lineHeight) + (lineHeight * 0.7);
                    const wrappedLines = pdf.splitTextToSize(line.trim() || ' ', maxWidth - 10);
                    // 只显示第一行，如果太长则截断
                    const displayText = wrappedLines[0] || ' ';
                    pdf.text(displayText, startX + 5, yPos);
                }
            });
            
            // 填充 Output 数据
            outputLines.forEach((line, index) => {
                if (index < maxLines) {
                    const yPos = dataStartY + cellPadding + (index * lineHeight) + (lineHeight * 0.7);
                    const wrappedLines = pdf.splitTextToSize(line.trim() || ' ', maxWidth - 10);
                    const displayText = wrappedLines[0] || ' ';
                    pdf.text(displayText, startX + maxWidth + 5, yPos);
                }
            });
            
            yPosition = dataStartY + dataHeight + 10;
        };

        for (let i = 0; i < challenges.length; i++) {
            const challenge = challenges[i];

            pdf.setFontSize(16);
            pdf.setTextColor(40, 53, 147);
            pdf.setFont(undefined, 'bold');
            checkNewPage(15);
            pdf.text(sanitizeText(`Question ${i + 1}: ${challenge.title}`), 20, yPosition);
            yPosition += 12;
            pdf.setFont(undefined, 'normal');

            // 插入四行两列表格
            addFourByTwoTable({
                programming_elements: challenge.programming_elements?.join(", "),
                data_structures: challenge.data_structures?.join(", "),
                input_source: challenge.input_source,
                output_source: challenge.output_source
            });

            // Description
            if (challenge.question_description && challenge.question_description !== "None") {
                addAttributeTitle("Description");
                addAttributeContent(challenge.question_description, 12);
                yPosition += 5;
            }

            // Tasks - 移到 Description 后面
            const addListItems = (items, title) => {
                if (!items || items.length === 0) return;
                addAttributeTitle(title);
                items.forEach((item, index) => {
                    addAttributeContent(`${index + 1}. ${sanitizeText(item)}`, 11, 10);
                });
                yPosition += 3;
            };

            addListItems(challenge.task_list, "Tasks");

            // Input Information
            if (challenge.input_information && challenge.input_information !== "None") {
                addAttributeTitle("Input Information");
                addAttributeContent(challenge.input_information, 12);
                yPosition += 5;
            }

            // Output Information
            if (challenge.output_information && challenge.output_information !== "None") {
                addAttributeTitle("Output Information");
                addAttributeContent(challenge.output_information, 12);
                yPosition += 5;
            }

            // Input/Output Example - 使用表格格式
            if (challenge.input_output_example && challenge.input_output_example !== "None") {
                addInputOutputTable(challenge.input_output_example);
            }

            // Additional Functions
            addListItems(challenge.additional_functions, "Additional Functions");

            // Additional Formulas
            addListItems(challenge.additional_formulas, "Additional Formulas");

            if (i < challenges.length - 1) {
                checkNewPage(15);
                pdf.setDrawColor(200, 200, 200);
                pdf.line(20, yPosition, 190, yPosition);
                yPosition += 15;
            }
        }

        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(128, 128, 128);
            pdf.text(`Page ${i} of ${totalPages}`, 105, 287, { align: 'center' });
        }

        pdf.save(`Programming-Questions-${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (err) {
        console.error("Error exporting PDF:", err);
        alert("Failed to export PDF. Please try again.");
    }
};
