import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import './TopProductsTable.css';

const TopProductsTable = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiRequest('/api/topProduct');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
        } catch (e) {
            setError(e);
            console.error("Could not fetch products:", e);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        fetchProducts();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>Ошибка: {error.message}</p>;
    }

    return (
        <div className="TopProductsTable">
            <div className="TopProductsTable_header">
                <h3 className="TopProductsTable_title">10 лучших товаров месяца</h3>
            </div>

            <div className="TopProductsTable_wrapper">
                <table className="TopProductsTable_table">
                    <thead className="TopProductsTable_thead">
                    <tr>
                        <th className="TopProductsTable_th">№</th>
                        <th className="TopProductsTable_th">НАЗВАНИЕ ТОВАРА</th>
                        <th className="TopProductsTable_th">{isMobile ? 'КОЛ-ВО' : 'КОЛИЧЕСТВО'}</th>
                        {!isMobile && (
                            <>
                                <th className="TopProductsTable_th">ПРОДАЖИ</th>
                                <th className="TopProductsTable_th">ПРОСМОТРЫ</th>
                                <th className="TopProductsTable_th">ВЫРУЧКА</th>
                            </>
                        )}
                    </tr>
                    </thead>
                    <tbody className="TopProductsTable_tbody">
                    {products.map((product) => (
                        <tr key={product.id} className="TopProductsTable_row">
                            <td className="TopProductsTable_td">{product.id}</td>
                            <td className="TopProductsTable_td">{product.name}</td>
                            <td className="TopProductsTable_td">{product.quantity}</td>
                            {!isMobile && (
                                <>
                                    <td className="TopProductsTable_td">{product.total_quantity}</td>
                                    <td className="TopProductsTable_td">{product.views}</td>
                                    <td className="TopProductsTable_td">{product.total_revenue} руб</td>
                                </>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;
