'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface Order {
  id: number;
  retailcrm_id: number;
  first_name: string;
  last_name: string;
  total_sum: number;
  status: string;
  city: string;
  created_at: string;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        const data = await response.json();
        setOrders(data);

        const totalOrders = data.length;
        const totalRevenue = data.reduce((sum: number, order: Order) => sum + (order.total_sum || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        setStats({
          totalOrders,
          totalRevenue,
          avgOrderValue,
        });
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const ordersByDate = orders.reduce((acc: Record<string, number>, order: Order) => {
    const date = new Date(order.created_at).toLocaleDateString('ru-RU');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const dateChartData = Object.entries(ordersByDate)
    .map(([date, count]) => ({ date, orders: count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const ordersByCity = orders.reduce((acc: Record<string, number>, order: Order) => {
    const city = order.city || 'Неизвестно';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const cityChartData = Object.entries(ordersByCity)
    .map(([city, count]) => ({ name: city, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const ordersByStatus = orders.reduce((acc: Record<string, number>, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusChartData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const revenuByCity = orders.reduce((acc: Record<string, number>, order: Order) => {
    const city = order.city || 'Неизвестно';
    acc[city] = (acc[city] || 0) + (order.total_sum || 0);
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenuByCity)
    .map(([city, revenue]) => ({ city, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Загружаю заказы...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Дашборд заказов</h1>
        <p className="text-gray-600 mb-8">Анализ заказов из RetailCRM</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Всего заказов</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Всего выручка</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalRevenue.toLocaleString()} ₽</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Средний заказ</p>
            <p className="text-3xl font-bold text-purple-600">{stats.avgOrderValue.toFixed(0).toLocaleString()} ₽</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Заказы по датам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dateChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Заказы по городам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cityChartData}
                layout="vertical"
                margin={{ left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Распределение по статусам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Выручка по городам</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString()} ₽`} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Последние заказы</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Клиент</th>
                  <th className="text-left py-3 px-4">Город</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-right py-3 px-4">Сумма</th>
                  <th className="text-left py-3 px-4">Дата</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {order.first_name} {order.last_name}
                    </td>
                    <td className="py-3 px-4">{order.city || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {order.total_sum.toLocaleString()} ₽
                    </td>
                    <td className="py-3 px-4">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
