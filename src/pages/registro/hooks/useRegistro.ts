import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Mutación oficial SIN pedir el "rol" para evitar el error de null del Backend
const REGISTER_MUTATION = gql`
  mutation RegisterNewCliente($input: RegisterClienteInput!) {
    registerNewCliente(input: $input) {
      id_cliente
      nombre_completo
      usuario {
        id_usuario
        username
        activo
      }
    }
  }
`;

export const useRegistro = () => {
    const [formData, setFormData] = useState({
        nombre_completo: '',
        telefono_principal: '',
        direccion: '',
        username: '',
        passwordHash: ''
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState(false);
    
    const navigate = useNavigate();
    const [registerMutation, { loading }] = useMutation(REGISTER_MUTATION);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const togglePassword = () => setShowPassword(!showPassword);

    const handleRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        
        try {
            // Ejecutamos la mutación con el input exacto
            await registerMutation({
                variables: { 
                    input: { 
                        username: formData.username,
                        password_hash: formData.passwordHash,
                        nombre_completo: formData.nombre_completo,
                        telefono_principal: formData.telefono_principal,
                        direccion: formData.direccion
                    } 
                }
            });
            
            // Si la mutación no lanza error, mostramos pantalla de éxito
            setSuccessMsg(true);
            
            // Redirigimos al usuario al login después de 3 segundos
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err: any) {
            console.error('Error al registrar:', err);
            
            let mensajeVisible = err.message || 'Ocurrió un error al crear tu cuenta.';
            
            // UX: Interceptamos el error de llave duplicada de PostgreSQL/MySQL
            if (mensajeVisible.includes('llave duplicada') || mensajeVisible.includes('unique constraint') || mensajeVisible.includes('UQ_')) {
                mensajeVisible = 'Ese nombre de usuario o teléfono ya está en uso. Por favor, elige otro distinto.';
            }
            
            setErrorMsg(mensajeVisible);
        }
    };

    return {
        formData, handleChange,
        showPassword, togglePassword,
        isLoading: loading,
        errorMsg, successMsg,
        handleRegistro
    };
};