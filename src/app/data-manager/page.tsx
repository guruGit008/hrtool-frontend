'use client';
import { useRouter } from "next/navigation";


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Building2, 
  CreditCard, 
  Receipt, 
  Calculator, 
  Gavel, 
  LineChart,
  ArrowRight,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { APIURL } from '@/constants/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Module {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  path: string;
  count: number;
  apiUrl: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
  }[];
}

const modules: Module[] = [
  {
    id: 'sales',
    name: 'Sales Management',
    icon: TrendingUp,
    color: 'bg-green-500',
    path: '/data-manager/sales',
    count: 0,
    apiUrl: APIURL +'/api/sales'
  },
  {
    id: 'purchase',
    name: 'Purchase Management',
    icon: ShoppingCart,
    color: 'bg-orange-500',
    path: '/data-manager/purchase',
    count: 0,
    apiUrl: APIURL +'/api/purchases'
  },
  {
    id: 'logistics',
    name: 'Logistics Documents',
    icon: FileText,
    color: 'bg-green-500',
    path: '/data-manager/logistics',
    count: 0,
    apiUrl: APIURL +'/api/logisticsdocuments'
  },
  {
    id: 'registration',
    name: 'Company Registration',
    icon: Building2,
    color: 'bg-purple-500',
    path: '/data-manager/registration',
    count: 0,
    apiUrl: APIURL +'/api/companyregistrations'
  },
  {
    id: 'bank',
    name: 'Bank Documents',
    icon: CreditCard,
    color: 'bg-yellow-500',
    path: '/data-manager/bank',
    count: 0,
    apiUrl: APIURL +'/api/bankdocuments'
  },
  {
    id: 'billing',
    name: 'Billing Management',
    icon: Receipt,
    color: 'bg-red-500',
    path: '/data-manager/billing',
    count: 0,
    apiUrl: APIURL +'/api/billings'
  },
  {
    id: 'ca',
    name: 'CA Documents',
    icon: Calculator,
    color: 'bg-indigo-500',
    path: '/data-manager/ca',
    count: 0,
    apiUrl: APIURL +'/api/cadocuments'
  },
  {
    id: 'tender',
    name: 'Tender Management',
    icon: Gavel,
    color: 'bg-orange-500',
    path: '/data-manager/tender',
    count: 0,
    apiUrl: APIURL +'/api/tenders'
  },
  {
    id: 'finance',
    name: 'Finance Reports',
    icon: LineChart,
    color: 'bg-teal-500',
    path: '/data-manager/finance',
    count: 0,
    apiUrl: APIURL +'/api/financereports'
  }
];

// Define a type for the expected data shape
type MonthlyDataItem = { [key: string]: string | number | undefined };

export default function DataManagerDashboard() {

  const router = useRouter();

  const [moduleCounts, setModuleCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Sales',
      data: [],
      borderColor: '#36a2eb',
      backgroundColor: 'rgba(54, 162, 235, 0.3)',
    }]
  });
  const [purchaseData, setPurchaseData] = useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Purchases',
      data: [],
      borderColor: '#ff6384',
      backgroundColor: 'rgba(255, 99, 132, 0.3)',
    }]
  });
  const [paymentStatusData, setPaymentStatusData] = useState<ChartData>({
    labels: ['Paid', 'Pending', 'Overdue', 'Partially Paid'],
    datasets: [{
      label: 'Payment Status',
      data: [0, 0, 0, 0],
      backgroundColor: [
        '#36a2eb',
        '#ffce56',
        '#ff6384',
        '#4bc0c0',
      ],
    }]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    if (!token || !roles.includes('DATAMANAGER')) {
      router.replace('/login');
    } else {
      setLoading(true);
      
    }
    // eslint-disable-next-line
  }, [router]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const counts: { [key: string]: number } = {};

      try {
        // Fetch module counts
        await Promise.all(
          modules.map(async (module) => {
            try {
              const response = await fetch(module.apiUrl);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              const data = await response.json();
              counts[module.id] = Array.isArray(data) ? data.length : 0;
            } catch (e) {
              console.error(`Error fetching count for ${module.name}:`, e);
              counts[module.id] = 0;
            }
          })
        );

        // Fetch sales data for charts
        const salesResponse = await fetch(APIURL + `/api/sales`);
        if (salesResponse.ok) {
          const sales = await salesResponse.json();
          const monthlySales = processMonthlyData(sales, 'date', 'amount');
          setSalesData({
            labels: monthlySales.labels,
            datasets: [{
              label: 'Sales',
              data: monthlySales.data,
              borderColor: '#36a2eb',
              backgroundColor: 'rgba(54, 162, 235, 0.3)',
            }]
          });
        }

        // Fetch purchase data for charts
        const purchasesResponse = await fetch(APIURL + `/api/purchases`);
        if (purchasesResponse.ok) {
          const purchases = await purchasesResponse.json();
          console.log('Purchases API response:', purchases);
          let monthlyPurchases: { labels: string[]; data: number[] } = { labels: [], data: [] };
          if (
            Array.isArray(purchases) &&
            purchases.length > 0 &&
            purchases.some(item => item.date && item.amount !== undefined)
          ) {
            monthlyPurchases = processMonthlyData(purchases, 'date', 'amount');
          } else if (Array.isArray(purchases) && purchases.length === 0) {
            // No error if empty, just show empty chart
            monthlyPurchases = { labels: salesData.labels, data: new Array(12).fill(0) };
          } else {
            setError('Purchase data format is invalid.');
          }
          setPurchaseData({
            labels: monthlyPurchases.labels,
            datasets: [{
              label: 'Purchases',
              data: monthlyPurchases.data,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
            }]
          });
        } else {
          setError(prev => (prev ? prev + ' | ' : '') + 'Failed to fetch purchase data.');
        }

        // Fetch payment status data
        const salesForPaymentStatus = await fetch(APIURL +'/api/sales').then(res => res.ok ? res.json() : []);
        const paymentStatusCounts = {
          'Paid': 0,
          'Pending': 0,
          'Overdue': 0,
          'Partially Paid': 0
        };

        salesForPaymentStatus.forEach((sale: { paymentStatus: string }) => {
          if (sale.paymentStatus in paymentStatusCounts) {
            paymentStatusCounts[sale.paymentStatus as keyof typeof paymentStatusCounts]++;
          }
        });

        setPaymentStatusData({
          labels: Object.keys(paymentStatusCounts),
          datasets: [{
            label: 'Payment Status',
            data: Object.values(paymentStatusCounts),
            backgroundColor: [
              '#36a2eb',
              '#ffce56',
              '#ff6384',
              '#4bc0c0',
            ],
          }]
        });

        setModuleCounts(counts);
      } catch (e: unknown) {
        setError(`Failed to fetch data: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to process monthly data
  const processMonthlyData = (data: MonthlyDataItem[], dateField: string, amountField: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    data.forEach((item: MonthlyDataItem) => {
      const dateValue = item[dateField];
      let date: Date | null = null;

      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        // JS months are 0-based, so subtract 1 from month
        date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2]);
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }

      if (date && date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyTotals[month] += Number(item[amountField]) || 0;
      }
    });

    return {
      labels: months,
      data: monthlyTotals
    };
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Sales Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-80">
            <Line
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Purchase Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Trend</h3>
          <div className="h-80">
            <Line
              data={purchaseData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
            {error && error.toLowerCase().includes('purchase') && (
              <div className="text-red-600 text-center mt-4">{error}</div>
            )}
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
          <div className="h-80">
            <Doughnut
              data={paymentStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Sales vs Purchases</h3>
          <div className="h-80">
            <Bar
              data={{
                labels: salesData.labels,
                datasets: [
                  {
                    label: 'Sales',
                    data: salesData.datasets[0].data,
                    backgroundColor: '#36a2eb',
                  },
                  {
                    label: 'Purchases',
                    data: purchaseData.datasets[0].data,
                    backgroundColor: '#ff6384',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-600">Loading module counts...</div>
        ) : error ? (
          <div className="col-span-full text-center py-8 text-red-600">{error}</div>
        ) : (
          modules.map((module) => (
            <Link
              key={module.id}
              href={module.path}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{moduleCounts[module.id] || 0}</p>
                </div>
                <div className={`p-3 rounded-lg ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600">
                <span className="text-sm font-medium">View Details</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}