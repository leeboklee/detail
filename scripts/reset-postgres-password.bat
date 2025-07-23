@echo off
echo PostgreSQL 비밀번호 재설정 스크립트
echo.

echo 1. PostgreSQL 서비스 중지...
net stop postgresql-x64-17

echo 2. PostgreSQL 서비스 시작 (trust 모드)...
pg_ctl start -D "C:\Program Files\PostgreSQL\17\data" -o "-c password_encryption=md5"

echo 3. 비밀번호 변경...
psql -U postgres -c "ALTER USER postgres PASSWORD 'detailpage123';"

echo 4. PostgreSQL 서비스 재시작...
net stop postgresql-x64-17
net start postgresql-x64-17

echo 5. 연결 테스트...
psql -U postgres -d postgres -c "SELECT version();"

echo.
echo PostgreSQL 비밀번호가 'detailpage123'으로 변경되었습니다.
echo DATABASE_URL: postgresql://postgres:detailpage123@localhost:5432/detailpage_local
pause 