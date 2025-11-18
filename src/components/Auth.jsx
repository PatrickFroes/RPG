import React, { useState } from 'react';
import { Container } from "./Containers";
import { Button } from "./Inputs";

const API_URL = 'http://localhost:3001/api';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      // Salvar dados do usuário no localStorage
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);

      // Chamar callback de login
      onLogin(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Container className="w-full max-w-md">


        <div className="text-center mb-6">
                  <div
          className="w-80 h-62 mx-auto mb-6 bg-cover bg-center bg-no-repeat rounded-lg"
          style={{ backgroundImage: "url(/logo.png)" }}
        ></div>
          <p className="text-gray-400">
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              👤 Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-3 py-2 focus:border-cyan-300 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              🔒 Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#123240] text-white border border-gray-500 rounded px-3 py-2 focus:border-cyan-300 focus:outline-none"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded text-center text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="play"
            className="w-full"
            disabled={loading}
          >
            {loading ? '⏳ Aguarde...' : isLogin ? '🚀 Entrar' : '✨ Registrar'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
              disabled={loading}
            >
              {isLogin ? 'Não tem conta? Registre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
