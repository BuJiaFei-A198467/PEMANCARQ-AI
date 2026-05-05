import { useAuth } from "@clerk/clerk-react"


// 从环境变量读取 API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"


export const useApi = () => {
    const { getToken } = useAuth()

    const makeRequest = async (endpoint, options = {}) => {
        try {
            const token = await getToken()
            const defaultOptions = {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }

            console.log(`API Request: ${endpoint}`, options)

            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                ...defaultOptions,
                ...options,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)

                // 处理特定的错误状态码
                if (response.status === 429) {
                    const detail = errorData?.detail || "Daily quota exceeded"
                    throw new Error(detail)
                }
                if (response.status === 401) {
                    throw new Error("Authentication failed. Please sign in again.")
                }
                if (response.status === 400) {
                    const detail = errorData?.detail || "Bad request"
                    throw new Error(detail)
                }
                if (response.status === 500) {
                    throw new Error("Server error. Please try again later.")
                }

                throw new Error(errorData?.detail || errorData?.message || "An error occurred")
            }

            const data = await response.json()
            console.log(`API Response: ${endpoint}`, data)
            return data

        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error)

            // 如果是网络错误，提供更友好的消息
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error("Network error. Please check your connection and try again.")
            }

            // 重新抛出其他错误
            throw error
        }
    }

    return { makeRequest, getToken} // 添加 getToken
}
