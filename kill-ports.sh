#!/bin/bash

echo "🛑 Encerrando processos nas portas especificadas..."

# Portas do frontend (Vite)
for port in 5173 5174 5175 5176 5177; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "  🔥 Encerrando processo na porta $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  else
    echo "  ✅ Porta $port livre"
  fi
done

# Portas do backend (JSON Server)
for port in 3000 3001 3002; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    echo "  🔥 Encerrando processo na porta $port (PID: $pid)"
    kill -9 $pid 2>/dev/null
  else
    echo "  ✅ Porta $port livre"
  fi
done

# Encerrar por nome do processo
echo "🛑 Encerrando servidores de desenvolvimento por nome..."
pkill -f "json-server" 2>/dev/null && echo "  🔥 JSON Server encerrado" || echo "  ✅ JSON Server não estava rodando"
pkill -f "vite.*dev" 2>/dev/null && echo "  🔥 Vite dev server encerrado" || echo "  ✅ Vite dev server não estava rodando"

echo "✅ Limpeza de processos concluída!"