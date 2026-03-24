import { useState } from "react";

export const useLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const togglePassword = () => setShowPassword(!showPassword);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulación de petición al API
        setTimeout(() => {
            setIsLoading(false);
            console.log('Autenticando usuario:', username);
        }, 1500);
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        showPassword,
        togglePassword,
        isLoading,
        handleLogin
    };
};


