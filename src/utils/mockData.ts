import type { ColumnDefinition } from '../types';

type QueryType =
  | 'users'
  | 'employees'
  | 'orders'
  | 'products'
  | 'analytics'
  | 'transactions'
  | 'generic';

interface MockDataResult {
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
}

interface SampleDataFile {
  metadata: {
    totalRecords: number;
    generatedAt: string;
    description: string;
  };
  columns: ColumnDefinition[];
  rows: Record<string, unknown>[];
}

let cachedSampleData: SampleDataFile | null = null;
let loadingPromise: Promise<SampleDataFile> | null = null;

async function loadSampleData(): Promise<SampleDataFile> {
  if (cachedSampleData) {
    return cachedSampleData;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = fetch('/data/sampleData.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      return response.json();
    })
    .then((data: SampleDataFile) => {
      cachedSampleData = data;
      return data;
    })
    .catch((error) => {
      console.warn('Could not load sample data, falling back to generated data:', error);
      loadingPromise = null;
      throw error;
    });

  return loadingPromise;
}

function getSampleDataSync(): SampleDataFile | null {
  return cachedSampleData;
}

export function preloadSampleData(): void {
  loadSampleData().catch(() => {
  });
}

export function detectQueryType(sql: string): QueryType {
  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('employee') || lowerSql.includes('staff') || lowerSql.includes('worker')) {
    return 'employees';
  }
  if (lowerSql.includes('user') || lowerSql.includes('customer')) {
    return 'users';
  }
  if (lowerSql.includes('order') || lowerSql.includes('purchase')) {
    return 'orders';
  }
  if (lowerSql.includes('product') || lowerSql.includes('inventory')) {
    return 'products';
  }
  if (lowerSql.includes('analytics') || lowerSql.includes('metric') || lowerSql.includes('stat')) {
    return 'analytics';
  }
  if (lowerSql.includes('transaction') || lowerSql.includes('payment')) {
    return 'transactions';
  }

  return 'generic';
}

function extractRowCount(sql: string): number | null {
  const limitMatch = sql.match(/limit\s+(\d+)/i);
  if (limitMatch) {
    const limit = parseInt(limitMatch[1], 10);
    return Math.min(limit, 50000); // Cap at 50000
  }
  return null;
}

export function generateMockData(queryType: QueryType, sql: string): MockDataResult {
  const requestedCount = extractRowCount(sql);
  
  const sampleData = getSampleDataSync();
  if (sampleData && (queryType === 'employees' || queryType === 'users' || queryType === 'generic')) {
    const rowCount = requestedCount || sampleData.rows.length;
    const rows = sampleData.rows.slice(0, rowCount);
    return {
      columns: sampleData.columns,
      rows,
    };
  }

  const rowCount = requestedCount || Math.floor(Math.random() * 900) + 100;

  switch (queryType) {
    case 'employees':
    case 'users':
      return generateUserData(rowCount);
    case 'orders':
      return generateOrderData(rowCount);
    case 'products':
      return generateProductData(rowCount);
    case 'analytics':
      return generateAnalyticsData(rowCount);
    case 'transactions':
      return generateTransactionData(rowCount);
    default:
      return generateGenericData(rowCount);
  }
}

export async function generateMockDataAsync(queryType: QueryType, sql: string): Promise<MockDataResult> {
  const requestedCount = extractRowCount(sql);

  if (queryType === 'employees' || queryType === 'users' || queryType === 'generic') {
    try {
      const sampleData = await loadSampleData();
      const rowCount = requestedCount || sampleData.rows.length;
      const rows = sampleData.rows.slice(0, rowCount);
      return {
        columns: sampleData.columns,
        rows,
      };
    } catch {
    }
  }

  return generateMockData(queryType, sql);
}

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'James',
  'Mia', 'Alexander', 'Charlotte', 'Michael', 'Amelia', 'Benjamin', 'Harper', 'Elijah', 'Evelyn', 'Daniel',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
];

const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.io', 'startup.co'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'];
const COUNTRIES = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia'];
const PRODUCTS = ['Widget Pro', 'Gadget X', 'Ultra Tool', 'Smart Device', 'Power Pack', 'Connector Plus', 'Data Hub', 'Cloud Service'];
const CATEGORIES = ['Electronics', 'Software', 'Hardware', 'Services', 'Accessories', 'Subscriptions'];
const STATUSES = ['Active', 'Pending', 'Completed', 'Cancelled', 'Processing'];
const PAYMENT_METHODS = ['Credit Card', 'PayPal', 'Bank Transfer', 'Crypto', 'Wire'];

const random = {
  pick: <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)],
  int: (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min,
  float: (min: number, max: number, decimals = 2): number =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals)),
  date: (daysBack: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString().split('T')[0];
  },
  boolean: (): boolean => Math.random() > 0.5,
};

function generateUserData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'id', label: 'ID', type: 'number', width: 80, visible: true },
    { key: 'first_name', label: 'First Name', type: 'string', width: 120, visible: true },
    { key: 'last_name', label: 'Last Name', type: 'string', width: 120, visible: true },
    { key: 'email', label: 'Email', type: 'string', width: 200, visible: true },
    { key: 'city', label: 'City', type: 'string', width: 130, visible: true },
    { key: 'country', label: 'Country', type: 'string', width: 100, visible: true },
    { key: 'signup_date', label: 'Signup Date', type: 'date', width: 120, visible: true },
    { key: 'is_active', label: 'Active', type: 'boolean', width: 80, visible: true },
    { key: 'orders_count', label: 'Orders', type: 'number', width: 80, visible: true },
  ];

  const rows = Array.from({ length: count }, (_, i) => {
    const firstName = random.pick(FIRST_NAMES);
    const lastName = random.pick(LAST_NAMES);
    return {
      id: i + 1,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${random.pick(DOMAINS)}`,
      city: random.pick(CITIES),
      country: random.pick(COUNTRIES),
      signup_date: random.date(365),
      is_active: random.boolean(),
      orders_count: random.int(0, 50),
    };
  });

  return { columns, rows };
}

function generateOrderData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'order_id', label: 'Order ID', type: 'string', width: 120, visible: true },
    { key: 'customer_name', label: 'Customer', type: 'string', width: 150, visible: true },
    { key: 'product', label: 'Product', type: 'string', width: 140, visible: true },
    { key: 'quantity', label: 'Qty', type: 'number', width: 60, visible: true },
    { key: 'unit_price', label: 'Unit Price', type: 'number', width: 100, visible: true },
    { key: 'total', label: 'Total', type: 'number', width: 100, visible: true },
    { key: 'status', label: 'Status', type: 'string', width: 100, visible: true },
    { key: 'order_date', label: 'Order Date', type: 'date', width: 120, visible: true },
  ];

  const rows = Array.from({ length: count }, (_, i) => {
    const quantity = random.int(1, 10);
    const unitPrice = random.float(10, 500);
    return {
      order_id: `ORD-${String(i + 1).padStart(6, '0')}`,
      customer_name: `${random.pick(FIRST_NAMES)} ${random.pick(LAST_NAMES)}`,
      product: random.pick(PRODUCTS),
      quantity,
      unit_price: unitPrice,
      total: parseFloat((quantity * unitPrice).toFixed(2)),
      status: random.pick(STATUSES),
      order_date: random.date(90),
    };
  });

  return { columns, rows };
}

function generateProductData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'sku', label: 'SKU', type: 'string', width: 100, visible: true },
    { key: 'name', label: 'Product Name', type: 'string', width: 160, visible: true },
    { key: 'category', label: 'Category', type: 'string', width: 120, visible: true },
    { key: 'price', label: 'Price', type: 'number', width: 90, visible: true },
    { key: 'stock', label: 'Stock', type: 'number', width: 80, visible: true },
    { key: 'reorder_level', label: 'Reorder At', type: 'number', width: 100, visible: true },
    { key: 'last_updated', label: 'Last Updated', type: 'date', width: 120, visible: true },
  ];

  const rows = Array.from({ length: count }, (_, i) => ({
    sku: `SKU-${String(i + 1).padStart(5, '0')}`,
    name: `${random.pick(['Premium', 'Basic', 'Pro', 'Enterprise', 'Starter'])} ${random.pick(PRODUCTS)}`,
    category: random.pick(CATEGORIES),
    price: random.float(9.99, 999.99),
    stock: random.int(0, 1000),
    reorder_level: random.int(10, 100),
    last_updated: random.date(30),
  }));

  return { columns, rows };
}

function generateAnalyticsData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'date', label: 'Date', type: 'date', width: 110, visible: true },
    { key: 'page_views', label: 'Page Views', type: 'number', width: 110, visible: true },
    { key: 'unique_visitors', label: 'Unique Visitors', type: 'number', width: 130, visible: true },
    { key: 'bounce_rate', label: 'Bounce Rate %', type: 'number', width: 120, visible: true },
    { key: 'avg_session', label: 'Avg Session (s)', type: 'number', width: 130, visible: true },
    { key: 'conversions', label: 'Conversions', type: 'number', width: 110, visible: true },
    { key: 'revenue', label: 'Revenue', type: 'number', width: 110, visible: true },
  ];

  const rows = Array.from({ length: count }, () => {
    const pageViews = random.int(1000, 50000);
    return {
      date: random.date(count),
      page_views: pageViews,
      unique_visitors: Math.floor(pageViews * random.float(0.4, 0.7)),
      bounce_rate: random.float(20, 70, 1),
      avg_session: random.int(30, 600),
      conversions: random.int(10, 500),
      revenue: random.float(100, 10000),
    };
  });

  return { columns, rows };
}

function generateTransactionData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'tx_id', label: 'Transaction ID', type: 'string', width: 150, visible: true },
    { key: 'timestamp', label: 'Timestamp', type: 'date', width: 160, visible: true },
    { key: 'amount', label: 'Amount', type: 'number', width: 100, visible: true },
    { key: 'currency', label: 'Currency', type: 'string', width: 80, visible: true },
    { key: 'payment_method', label: 'Payment Method', type: 'string', width: 130, visible: true },
    { key: 'status', label: 'Status', type: 'string', width: 100, visible: true },
    { key: 'customer_id', label: 'Customer ID', type: 'number', width: 110, visible: true },
  ];

  const rows = Array.from({ length: count }, (_, i) => ({
    tx_id: `TXN-${Date.now() - random.int(0, 1000000)}-${String(i).padStart(4, '0')}`,
    timestamp: new Date(Date.now() - random.int(0, 7776000000)).toISOString(),
    amount: random.float(10, 5000),
    currency: random.pick(['USD', 'EUR', 'GBP', 'JPY', 'CAD']),
    payment_method: random.pick(PAYMENT_METHODS),
    status: random.pick(['Success', 'Pending', 'Failed', 'Refunded']),
    customer_id: random.int(1000, 99999),
  }));

  return { columns, rows };
}

function generateGenericData(count: number): MockDataResult {
  const columns: ColumnDefinition[] = [
    { key: 'id', label: 'ID', type: 'number', width: 80, visible: true },
    { key: 'name', label: 'Name', type: 'string', width: 150, visible: true },
    { key: 'value', label: 'Value', type: 'number', width: 100, visible: true },
    { key: 'status', label: 'Status', type: 'string', width: 100, visible: true },
    { key: 'created_at', label: 'Created At', type: 'date', width: 120, visible: true },
    { key: 'is_enabled', label: 'Enabled', type: 'boolean', width: 80, visible: true },
  ];

  const rows = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: random.float(0, 1000),
    status: random.pick(STATUSES),
    created_at: random.date(180),
    is_enabled: random.boolean(),
  }));

  return { columns, rows };
}
