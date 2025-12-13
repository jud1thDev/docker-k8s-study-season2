import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import cloudClubLogo from '/logo.png'
import { Layout } from './components/layout'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// API 함수들
const getCurrentCount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/count`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('API 호출에 실패했습니다.')
  }
  return response.json()
}

const fetchCount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/increment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('API 호출에 실패했습니다.')
  }
  return response.json()
}

const resetCount = async () => {
  const response = await fetch(`${API_BASE_URL}/api/reset`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('API 호출에 실패했습니다.')
  }
  return response.json()
}

function App() {
  // useState로 count 상태 관리 (리렌더링 보장)
  const [count, setCount] = useState(0)

  // 초기 로드 시 현재 카운터 값 조회
  const { data: countData, error: countError } = useQuery({
    queryKey: ['currentCount'],
    queryFn: getCurrentCount,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  // 조회 성공 시 count 상태 업데이트, 실패 시 0으로 설정
  useEffect(() => {
    if (countData) {
      setCount(countData.count)
    } else if (countError) {
      // API 호출 실패 시 0으로 설정
      setCount(0)
    }
  }, [countData, countError])

  // Increment mutation
  const incrementMutation = useMutation({
    mutationFn: fetchCount,
    onSuccess: (data) => {
      setCount(data.count) // mutation 성공 시 상태 업데이트
    },
  })

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: resetCount,
    onSuccess: () => {
      setCount(0) // reset 성공 시 상태 업데이트
    },
  })

  const isLoading = incrementMutation.isPending || resetMutation.isPending
  const error = incrementMutation.error || resetMutation.error

  return (
    <Layout>
      <div>
        <a href="https://www.cloudclub.kr/" target="_blank">
          <img src={cloudClubLogo} className="logo" alt="cc logo" />
        </a>
      </div>
      <h1>도커 쿠버네티스 스터디 시즌 2 입니다.</h1>
      <div className="card">
        <div className="button-group">
          <button 
            onClick={() => incrementMutation.mutate()} 
            disabled={isLoading}
            className="count-button"
          >
            {isLoading ? '로딩 중...' : `count is ${count}`}
          </button>
          <button 
            onClick={() => resetMutation.mutate()} 
            disabled={isLoading}
            className="reset-button"
          >
            reset
          </button>
        </div>
        {error && <p className="error-message">{error.message}</p>}
        <p>
          Count 버튼을 눌러서 백엔드 리소스와 소통을 하세요!
        </p>
      </div>
      <p className="read-the-docs">
        Click on the logos to know Cloud Club
      </p>
    </Layout>
  )
}

export default App
