import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage/ProductsPage.jsx';
import ArticlesPage from "./pages/ArticlePage/ArticlesPage.jsx";
import AdministrationPage from './pages/Administration/AdministrationPage.jsx';
import SalesPage from './pages/SalesPage/SalesPage.jsx';
import PromotionPage from './pages/PromotionPage/PromotionPage.jsx';
import './App.css';

const ROLE_ACCESS = {
	Администрирование: ['dashboard', 'products', 'sales', 'promotion', 'content', 'administration'],
	Продвижение: ['dashboard', 'promotion'],
	Продажи: ['dashboard', 'sales'],
	Наполнение: ['dashboard', 'content'],
}

const parseRoles = raw =>
	String(raw || '')
		.split(',')
		.map(x => x.trim().toLowerCase())
		.filter(Boolean)

const ADMIN_TITLES = {
    login: 'Вход',
    dashboard: 'Обзор',
    products: 'Товары',
    sales: 'Заказы',
    promotion: 'Продвижение',
    content: 'Публикации',
    administration: 'Команда',
};

const AdminPageMeta = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        const route = pathname.split('/').filter(Boolean).at(-1) || 'dashboard';
        document.title = `${ADMIN_TITLES[route] || 'Управление сайтом'} - Сад Тишины`;
    }, [pathname]);

    return null;
};

const RequireAccess = ({ allow, children }) => {
	const { user, loading } = useAuth()
	if (loading) return children
	const roles = parseRoles(user?.role)
	const allowedSet = new Set()
	if (roles.length === 0) {
		ROLE_ACCESS.Администрирование.forEach(a => allowedSet.add(a))
	} else {
		for (const r of roles) {
			if (r.includes('админ')) ROLE_ACCESS.Администрирование.forEach(a => allowedSet.add(a))
			if (r.includes('продвиж')) ROLE_ACCESS.Продвижение.forEach(a => allowedSet.add(a))
			if (r.includes('продаж')) ROLE_ACCESS.Продажи.forEach(a => allowedSet.add(a))
			if (r.includes('наполн')) ROLE_ACCESS.Наполнение.forEach(a => allowedSet.add(a))
		}
	}
	const allowed = Array.from(allowedSet)
	if (!allowed.includes(allow)) return <Navigate to='/dashboard' replace />
	return children
}
const AuthEventHandler = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const handleLogout = async () => {
            await logout();
            navigate('/login', { replace: true });
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [navigate, logout]);

    return null;
};

function AppRoutes() {
    return (
        <>
            <AdminPageMeta />
            <AuthEventHandler />
            <Routes>
                
                <Route path="/login" element={<LoginPage />} />
                
                
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route
                        path="products"
                        element={
                            <RequireAccess allow="products">
                                <ProductsPage />
                            </RequireAccess>
                        }
                    />
					<Route
						path="sales"
						element={
							<RequireAccess allow="sales">
								<SalesPage />
							</RequireAccess>
						}
					/>
                    <Route
                        path="content"
                        element={
                            <RequireAccess allow="content">
                                <ArticlesPage />
                            </RequireAccess>
                        }
                    />
                    <Route
                        path="administration"
                        element={
                            <RequireAccess allow="administration">
                                <AdministrationPage />
                            </RequireAccess>
                        }
                    />
                    <Route
                        path="promotion"
                        element={
                            <RequireAccess allow="promotion">
                                <PromotionPage />
                            </RequireAccess>
                        }
                    />
                </Route>
                
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router basename="/admin">
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
