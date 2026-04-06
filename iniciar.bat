@echo off
echo ===================================================
echo Iniciando o Sistema de Controle Financeiro...
echo ===================================================

echo [ 1 / 2 ] - Iniciando o Back-end e o Banco de Dados Portatil...
start cmd /k "cd backend && node server.js"

echo [ 2 / 2 ] - Iniciando a Interface do Usuario (Front-end)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo O sistema estara disponivel em instantes!
echo Uma janela do navegador pode abrir automaticamente.
echo (Em caso de duvida, acesse: http://localhost:5173/)
echo ===================================================
pause
