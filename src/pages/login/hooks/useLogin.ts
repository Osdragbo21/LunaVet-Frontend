import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Mutación estructurada exactamente como la pide el Backend
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(loginInput: $input) {
      access_token
      usuario {
        id_usuario
        username
        activo
        rol {
          nombre
        }
      }
    }
  }
`;

// ==========================================
// INTERFACES PARA TYPESCRIPT
// ==========================================
interface Rol {
  nombre: string;
}

interface UsuarioLogin {
  id_usuario: number;
  username: string;
  activo: boolean;
  rol: Rol;
}

interface LoginResponse {
  login: {
    access_token: string;
    usuario: UsuarioLogin;
  }
}

export const useLogin = () => {
    const [username, setUsername] = useState('');
    // Regresamos a "password" para no romper el componente visual (FormLogin.tsx)
    const [password, setPassword] = useState(''); 
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    const navigate = useNavigate();
    const [loginMutation, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION);

    const togglePassword = () => setShowPassword(!showPassword);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        
        try {
            // AQUÍ ESTÁ LA CLAVE: El frontend usa 'password', el backend recibe 'password_hash'
            const { data } = await loginMutation({
                variables: { 
                    input: { 
                        username: username, 
                        password_hash: password 
                    } 
                }
            });
            
            if (data?.login) {
                // 1. Guardamos el token y el usuario en el navegador
                localStorage.setItem('token', data.login.access_token);
                localStorage.setItem('user', JSON.stringify(data.login.usuario));
                
                const rolNombre = data.login.usuario.rol.nombre;
                
                // 2. Semáforo de Redirección basado en el Rol
                if (rolNombre === 'Cliente') {
                    navigate('/tienda'); 
                } else {
                    navigate('/dashboard'); 
                }
            }
        } catch (err: any) {
            console.error('Error al iniciar sesión:', err);
            setErrorMsg(err.message || 'Usuario o contraseña incorrectos');
        }
    };

    return {
        username, setUsername,
        password, setPassword, // Exportamos con el nombre original
        showPassword, togglePassword,
        isLoading: loading,
        errorMsg,
        handleLogin
    };
};