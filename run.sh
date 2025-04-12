#!/bin/bash

# 오류 발생 시 스크립트 중단
set -e

# 서비스 상태 확인 함수
check_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    echo "$service 시작 대기 중..."
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port; then
            echo "$service가 성공적으로 시작되었습니다."
            return 0
        fi
        echo "시도 $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo "$service 시작 실패"
    return 1
}

# MongoDB 실행
echo "MongoDB 시작..."
if ! mongod --version > /dev/null 2>&1; then
    echo "MongoDB가 설치되어 있지 않습니다. 설치 후 다시 시도하세요."
    exit 1
fi

# MongoDB 데이터 디렉토리 생성
MONGODB_DATA_DIR="$HOME/data/db"
mkdir -p "$MONGODB_DATA_DIR"

# MongoDB 서비스 시작
if ! brew services list | grep -q "mongodb-community.*started"; then
    echo "MongoDB 서비스 시작 중..."
    brew services start mongodb-community
    sleep 5  # MongoDB가 시작될 때까지 대기
fi

# 백엔드 실행
echo "백엔드 서버 시작..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "백엔드 의존성 설치 중..."
    npm install
fi
npm run dev &
cd ..

# AI 서비스 실행
echo "AI 서비스 시작..."
cd ai-service
if [ ! -d "venv" ]; then
    echo "Python 가상환경 생성 중..."
    python3 -m venv venv
fi
source venv/bin/activate
if [ ! -f "venv/bin/pip" ]; then
    echo "pip 업그레이드 중..."
    python -m pip install --upgrade pip
fi
echo "AI 서비스 의존성 설치 중..."
pip install -r requirements.txt
python main.py &
cd ..

# 프론트엔드 실행
echo "프론트엔드 시작..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "프론트엔드 의존성 설치 중..."
    npm install
fi
npm start

# 서비스 상태 확인
check_service "백엔드" 3001
check_service "AI 서비스" 3002

echo "모든 서비스가 실행되었습니다!"
echo "프론트엔드 접속: http://localhost:3000"
echo "백엔드 API: http://localhost:3001"
echo "AI 서비스: http://localhost:3002" 