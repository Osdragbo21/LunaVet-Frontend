import { useState, useEffect } from 'react';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CREATE_VENTA = gql`
  mutation CreateVentaTienda($input: CreateVentaInput!) {
    createVenta(createInput: $input) {
      id_venta
      total
      estado_pedido
    }
  }
`;

const GET_PERFIL_CLIENTE = gql`
  query GetPerfilCliente {
    clientes {
      id_cliente
      usuario {
        id_usuario
      }
    }
  }
`;

// ==========================================
// INTERFACES PARA TYPESCRIPT
// ==========================================
export interface CartItem {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  imagen_url: string;
  stock_actual: number;
}

interface GetPerfilClienteResponse {
  clientes: {
    id_cliente: number;
    usuario: {
      id_usuario: number;
    } | null;
  }[];
}

interface CreateVentaResponse {
  createVenta: {
    id_venta: number;
    total: number;
    estado_pedido: string;
  };
}

export const useTienda = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('lunaVetTheme') === 'dark');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<number | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [isMascotasOpen, setIsMascotasOpen] = useState(false);
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);
  const [isPerfilOpen, setIsPerfilOpen] = useState(false); // <-- NUEVO ESTADO PARA EL PERFIL

  const apolloClient = useApolloClient();

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('lunaVetTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const addToCart = (producto: any) => {
    if (producto.stock_actual <= 0) return;
    setCart(prev => {
      const existe = prev.find(item => item.id_producto === producto.id_producto);
      if (existe) {
        if (existe.cantidad >= producto.stock_actual) return prev;
        return prev.map(item => item.id_producto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { 
        id_producto: producto.id_producto, nombre: producto.nombre, 
        precio_venta: producto.precio_venta, cantidad: 1, 
        stock_actual: producto.stock_actual, imagen_url: producto.imagen_url 
      }];
    });
    setIsCartOpen(true);
    setSuccessOrder(null);
    setLocalError(null); 
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id_producto !== id));

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id_producto === id) {
        const nueva = item.cantidad + delta;
        if (nueva > 0 && nueva <= item.stock_actual) return { ...item, cantidad: nueva };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const [createVenta, { loading: isCheckingOut, error: checkoutError }] = useMutation<CreateVentaResponse>(CREATE_VENTA, {
    refetchQueries: ['GetProductosTienda', 'GetMisPedidosWeb']
  });

  const checkout = async () => {
    if (cart.length === 0) return;
    setLocalError(null); 
    
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      if (!currentUser) {
        setLocalError("Tu sesión ha expirado. Por favor, cierra sesión y vuelve a ingresar.");
        return;
      }

      const { data: perfilData } = await apolloClient.query<GetPerfilClienteResponse>({ 
        query: GET_PERFIL_CLIENTE, 
        fetchPolicy: 'network-only' 
      });
      
      if (!perfilData || !perfilData.clientes) {
        setLocalError("Hubo un problema al cargar tu perfil.");
        return;
      }

      const miPerfil = perfilData.clientes.find(c => c.usuario?.id_usuario === currentUser.id_usuario);
      
      if (!miPerfil) {
        setLocalError("No encontramos un perfil de cliente vinculado a esta cuenta. Acude a la clínica para activarlo.");
        return;
      }

      const detalles_productos = cart.map(i => ({
        producto_id: i.id_producto,
        cantidad: i.cantidad,
        precio_unitario: i.precio_venta
      }));

      const { data } = await createVenta({
        variables: {
          input: {
            cliente_id: miPerfil.id_cliente, 
            empleado_id: 1,
            metodo_pago: 'Efectivo', 
            tipo_venta: 'Online',
            estado_pedido: 'Pendiente de pago',
            total: cartTotal,
            detalles_productos
          }
        }
      });

      if (data?.createVenta) {
        setSuccessOrder(data.createVenta.id_venta);
        setCart([]);
      }
    } catch (err: any) {
      console.error("Error en checkout:", err);
      setLocalError(err.message || "Ocurrió un error al procesar el pedido.");
    }
  };

  return {
    isDarkMode, toggleTheme,
    cart, isCartOpen, setIsCartOpen,
    addToCart, removeFromCart, updateQuantity,
    cartTotal, cartCount,
    checkout, isCheckingOut, 
    checkoutError: localError ? { message: localError } : checkoutError,
    successOrder, setSuccessOrder,
    isMascotasOpen, setIsMascotasOpen,
    isPedidosOpen, setIsPedidosOpen,
    isPerfilOpen, setIsPerfilOpen // <-- EXPORTAMOS EL NUEVO ESTADO
  };
};