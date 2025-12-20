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
    return Math.min(limit, 50000);
  }
  return null;
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
const STATUSES = ['Active', 'Pending', 'Completed', 'Cancelled', 'Processing'];

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
    };
  });

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

export function generateMockData(queryType: QueryType, sql: string): MockDataResult {
  const requestedCount = extractRowCount(sql);
  const rowCount = requestedCount || Math.floor(Math.random() * 900) + 100;

  switch (queryType) {
    case 'employees':
    case 'users':
      return generateUserData(rowCount);
    default:
      return generateGenericData(rowCount);
  }
}

export async function generateMockDataAsync(queryType: QueryType, sql: string): Promise<MockDataResult> {
  return generateMockData(queryType, sql);
}

export function preloadSampleData(): void {
}

