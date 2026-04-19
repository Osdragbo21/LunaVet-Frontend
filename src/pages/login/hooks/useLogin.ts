import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@apollo/client/react';
// IMPORTACIÓN CORREGIDA A LA REGLA ESTRICTA DE APOLLO
import { gql } from '@apollo/client';

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
          id_rol
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
  id_rol: number;
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
                
                // 2. Semáforo de Redirección basado en el Rol (RBAC Seguro)
                const rolId = Number(data.login.usuario.rol.id_rol);
                
                if (rolId === 1) {
                    navigate('/dashboard'); // Si es Admin
                } else if (rolId === 2) {
                    navigate('/panel-clinico'); // Si es Empleado/Veterinario
                } else {
                    navigate('/tienda'); // Si es Cliente (3 o cualquier otro)
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