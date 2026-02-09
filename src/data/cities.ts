/**
 * U.S. City Data for Great Depression Visualization
 * 
 * Top 50 U.S. cities by 1930 population with coordinates and economic data.
 */

export interface CityData {
    id: string;
    name: string;
    state: string;
    coordinates: [number, number]; // [lng, lat]
    population1920: number;
    population1930: number;
    industries: string[];
    economicIndex: number; // 0-100, relative prosperity in 1929
}

// Major U.S. cities ranked by 1930 census population
export const cities: CityData[] = [
    // Tier 1: Mega cities (>1M)
    {
        id: 'nyc',
        name: 'New York',
        state: 'NY',
        coordinates: [-74.006, 40.7128],
        population1920: 5620048,
        population1930: 6930446,
        industries: ['Finance', 'Manufacturing', 'Shipping'],
        economicIndex: 100
    },
    {
        id: 'chicago',
        name: 'Chicago',
        state: 'IL',
        coordinates: [-87.6298, 41.8781],
        population1920: 2701705,
        population1930: 3376438,
        industries: ['Meatpacking', 'Rail', 'Steel'],
        economicIndex: 95
    },
    {
        id: 'philadelphia',
        name: 'Philadelphia',
        state: 'PA',
        coordinates: [-75.1652, 39.9526],
        population1920: 1823779,
        population1930: 1950961,
        industries: ['Manufacturing', 'Textiles', 'Shipping'],
        economicIndex: 85
    },
    {
        id: 'detroit',
        name: 'Detroit',
        state: 'MI',
        coordinates: [-83.0458, 42.3314],
        population1920: 993078,
        population1930: 1568662,
        industries: ['Automobiles', 'Manufacturing'],
        economicIndex: 98
    },

    // Tier 2: Major cities (500K-1M)
    {
        id: 'losangeles',
        name: 'Los Angeles',
        state: 'CA',
        coordinates: [-118.2437, 34.0522],
        population1920: 576673,
        population1930: 1238048,
        industries: ['Film', 'Oil', 'Agriculture'],
        economicIndex: 90
    },
    {
        id: 'cleveland',
        name: 'Cleveland',
        state: 'OH',
        coordinates: [-81.6944, 41.4993],
        population1920: 796841,
        population1930: 900429,
        industries: ['Steel', 'Manufacturing', 'Oil'],
        economicIndex: 88
    },
    {
        id: 'stlouis',
        name: 'St. Louis',
        state: 'MO',
        coordinates: [-90.1994, 38.627],
        population1920: 772897,
        population1930: 821960,
        industries: ['Manufacturing', 'Rail', 'Brewing'],
        economicIndex: 82
    },
    {
        id: 'baltimore',
        name: 'Baltimore',
        state: 'MD',
        coordinates: [-76.6122, 39.2904],
        population1920: 733826,
        population1930: 804874,
        industries: ['Shipping', 'Steel', 'Manufacturing'],
        economicIndex: 80
    },
    {
        id: 'boston',
        name: 'Boston',
        state: 'MA',
        coordinates: [-71.0589, 42.3601],
        population1920: 748060,
        population1930: 781188,
        industries: ['Finance', 'Shipping', 'Textiles'],
        economicIndex: 85
    },
    {
        id: 'pittsburgh',
        name: 'Pittsburgh',
        state: 'PA',
        coordinates: [-79.9959, 40.4406],
        population1920: 588343,
        population1930: 669817,
        industries: ['Steel', 'Coal', 'Manufacturing'],
        economicIndex: 90
    },

    // Tier 3: Large cities (300K-500K)
    {
        id: 'sanfrancisco',
        name: 'San Francisco',
        state: 'CA',
        coordinates: [-122.4194, 37.7749],
        population1920: 506676,
        population1930: 634394,
        industries: ['Shipping', 'Finance', 'Manufacturing'],
        economicIndex: 88
    },
    {
        id: 'milwaukee',
        name: 'Milwaukee',
        state: 'WI',
        coordinates: [-87.9065, 43.0389],
        population1920: 457147,
        population1930: 578249,
        industries: ['Brewing', 'Manufacturing', 'Machinery'],
        economicIndex: 78
    },
    {
        id: 'buffalo',
        name: 'Buffalo',
        state: 'NY',
        coordinates: [-78.8784, 42.8864],
        population1920: 506775,
        population1930: 573076,
        industries: ['Steel', 'Grain', 'Manufacturing'],
        economicIndex: 82
    },
    {
        id: 'washington',
        name: 'Washington',
        state: 'DC',
        coordinates: [-77.0369, 38.9072],
        population1920: 437571,
        population1930: 486869,
        industries: ['Government', 'Services'],
        economicIndex: 75
    },
    {
        id: 'minneapolis',
        name: 'Minneapolis',
        state: 'MN',
        coordinates: [-93.265, 44.9778],
        population1920: 380582,
        population1930: 464356,
        industries: ['Flour Milling', 'Lumber', 'Rail'],
        economicIndex: 80
    },
    {
        id: 'neworleans',
        name: 'New Orleans',
        state: 'LA',
        coordinates: [-90.0715, 29.9511],
        population1920: 387219,
        population1930: 458762,
        industries: ['Shipping', 'Oil', 'Trade'],
        economicIndex: 75
    },
    {
        id: 'cincinnati',
        name: 'Cincinnati',
        state: 'OH',
        coordinates: [-84.512, 39.1031],
        population1920: 401247,
        population1930: 451160,
        industries: ['Manufacturing', 'Meatpacking', 'Machinery'],
        economicIndex: 78
    },
    {
        id: 'newark',
        name: 'Newark',
        state: 'NJ',
        coordinates: [-74.1724, 40.7357],
        population1920: 414524,
        population1930: 442337,
        industries: ['Manufacturing', 'Insurance', 'Leather'],
        economicIndex: 82
    },
    {
        id: 'kansascity',
        name: 'Kansas City',
        state: 'MO',
        coordinates: [-94.5786, 39.0997],
        population1920: 324410,
        population1930: 399746,
        industries: ['Meatpacking', 'Rail', 'Grain'],
        economicIndex: 76
    },
    {
        id: 'seattle',
        name: 'Seattle',
        state: 'WA',
        coordinates: [-122.3321, 47.6062],
        population1920: 315312,
        population1930: 365583,
        industries: ['Lumber', 'Shipping', 'Fishing'],
        economicIndex: 78
    },

    // Tier 4: Medium cities (200K-300K)
    {
        id: 'indianapolis',
        name: 'Indianapolis',
        state: 'IN',
        coordinates: [-86.1581, 39.7684],
        population1920: 314194,
        population1930: 364161,
        industries: ['Manufacturing', 'Pharmaceuticals', 'Auto Parts'],
        economicIndex: 75
    },
    {
        id: 'rochester',
        name: 'Rochester',
        state: 'NY',
        coordinates: [-77.6109, 43.1566],
        population1920: 295750,
        population1930: 328132,
        industries: ['Optics', 'Manufacturing', 'Clothing'],
        economicIndex: 80
    },
    {
        id: 'portland',
        name: 'Portland',
        state: 'OR',
        coordinates: [-122.6765, 45.5152],
        population1920: 258288,
        population1930: 301815,
        industries: ['Lumber', 'Shipping', 'Agriculture'],
        economicIndex: 72
    },
    {
        id: 'denver',
        name: 'Denver',
        state: 'CO',
        coordinates: [-104.9903, 39.7392],
        population1920: 256491,
        population1930: 287861,
        industries: ['Mining', 'Rail', 'Livestock'],
        economicIndex: 70
    },
    {
        id: 'toledo',
        name: 'Toledo',
        state: 'OH',
        coordinates: [-83.5379, 41.6528],
        population1920: 243169,
        population1930: 290718,
        industries: ['Glass', 'Auto Parts', 'Oil'],
        economicIndex: 78
    },
    {
        id: 'columbus',
        name: 'Columbus',
        state: 'OH',
        coordinates: [-82.9988, 39.9612],
        population1920: 237031,
        population1930: 290564,
        industries: ['Manufacturing', 'Mining Machinery', 'Services'],
        economicIndex: 74
    },
    {
        id: 'louisville',
        name: 'Louisville',
        state: 'KY',
        coordinates: [-85.7585, 38.2527],
        population1920: 234891,
        population1930: 307745,
        industries: ['Tobacco', 'Whiskey', 'Manufacturing'],
        economicIndex: 72
    },
    {
        id: 'saintpaul',
        name: 'St. Paul',
        state: 'MN',
        coordinates: [-93.09, 44.9537],
        population1920: 234698,
        population1930: 271606,
        industries: ['Rail', 'Manufacturing', 'Publishing'],
        economicIndex: 76
    },
    {
        id: 'oakland',
        name: 'Oakland',
        state: 'CA',
        coordinates: [-122.2711, 37.8044],
        population1920: 216261,
        population1930: 284063,
        industries: ['Shipping', 'Manufacturing', 'Canning'],
        economicIndex: 80
    },
    {
        id: 'atlanta',
        name: 'Atlanta',
        state: 'GA',
        coordinates: [-84.388, 33.749],
        population1920: 200616,
        population1930: 270366,
        industries: ['Rail', 'Textiles', 'Trade'],
        economicIndex: 68
    },

    // Tier 5: Notable cities (100K-200K)
    {
        id: 'birmingham',
        name: 'Birmingham',
        state: 'AL',
        coordinates: [-86.8025, 33.5207],
        population1920: 178806,
        population1930: 259678,
        industries: ['Steel', 'Coal', 'Iron'],
        economicIndex: 75
    },
    {
        id: 'memphis',
        name: 'Memphis',
        state: 'TN',
        coordinates: [-90.049, 35.1495],
        population1920: 162351,
        population1930: 253143,
        industries: ['Cotton', 'Lumber', 'Trade'],
        economicIndex: 65
    },
    {
        id: 'dallas',
        name: 'Dallas',
        state: 'TX',
        coordinates: [-96.797, 32.7767],
        population1920: 158976,
        population1930: 260475,
        industries: ['Oil', 'Cotton', 'Banking'],
        economicIndex: 72
    },
    {
        id: 'houston',
        name: 'Houston',
        state: 'TX',
        coordinates: [-95.3698, 29.7604],
        population1920: 138276,
        population1930: 292352,
        industries: ['Oil', 'Shipping', 'Cotton'],
        economicIndex: 78
    },
    {
        id: 'miami',
        name: 'Miami',
        state: 'FL',
        coordinates: [-80.1918, 25.7617],
        population1920: 29571,
        population1930: 110637,
        industries: ['Tourism', 'Real Estate', 'Agriculture'],
        economicIndex: 60 // Already crashed in 1926 bust
    },
    {
        id: 'omaha',
        name: 'Omaha',
        state: 'NE',
        coordinates: [-95.9345, 41.2565],
        population1920: 191601,
        population1930: 214006,
        industries: ['Meatpacking', 'Rail', 'Grain'],
        economicIndex: 70
    },
    {
        id: 'syracuse',
        name: 'Syracuse',
        state: 'NY',
        coordinates: [-76.1474, 43.0481],
        population1920: 171717,
        population1930: 209326,
        industries: ['Manufacturing', 'Salt', 'Machinery'],
        economicIndex: 72
    },
    {
        id: 'providence',
        name: 'Providence',
        state: 'RI',
        coordinates: [-71.4128, 41.824],
        population1920: 237595,
        population1930: 252981,
        industries: ['Textiles', 'Jewelry', 'Manufacturing'],
        economicIndex: 70
    },
    {
        id: 'richmond',
        name: 'Richmond',
        state: 'VA',
        coordinates: [-77.436, 37.5407],
        population1920: 171667,
        population1930: 182929,
        industries: ['Tobacco', 'Manufacturing', 'Finance'],
        economicIndex: 68
    },
    {
        id: 'akron',
        name: 'Akron',
        state: 'OH',
        coordinates: [-81.519, 41.0814],
        population1920: 208435,
        population1930: 255040,
        industries: ['Rubber', 'Tires', 'Manufacturing'],
        economicIndex: 85
    }
];

// Trade route connections for light trails
export interface TradeRoute {
    from: string; // city id
    to: string;   // city id
    intensity: number; // 0-100
}

export const tradeRoutes: TradeRoute[] = [
    // Major East-West corridors
    { from: 'nyc', to: 'chicago', intensity: 100 },
    { from: 'chicago', to: 'losangeles', intensity: 80 },
    { from: 'chicago', to: 'sanfrancisco', intensity: 75 },

    // Northeast industrial
    { from: 'nyc', to: 'philadelphia', intensity: 90 },
    { from: 'nyc', to: 'boston', intensity: 85 },
    { from: 'philadelphia', to: 'pittsburgh', intensity: 80 },
    { from: 'pittsburgh', to: 'cleveland', intensity: 85 },
    { from: 'cleveland', to: 'detroit', intensity: 90 },
    { from: 'detroit', to: 'chicago', intensity: 95 },
    { from: 'buffalo', to: 'cleveland', intensity: 70 },

    // Midwest network
    { from: 'chicago', to: 'stlouis', intensity: 85 },
    { from: 'chicago', to: 'milwaukee', intensity: 75 },
    { from: 'chicago', to: 'minneapolis', intensity: 70 },
    { from: 'stlouis', to: 'kansascity', intensity: 75 },
    { from: 'minneapolis', to: 'saintpaul', intensity: 60 },

    // West Coast
    { from: 'losangeles', to: 'sanfrancisco', intensity: 85 },
    { from: 'sanfrancisco', to: 'oakland', intensity: 70 },
    { from: 'sanfrancisco', to: 'portland', intensity: 60 },
    { from: 'portland', to: 'seattle', intensity: 65 },

    // Southern routes
    { from: 'neworleans', to: 'houston', intensity: 70 },
    { from: 'dallas', to: 'houston', intensity: 65 },
    { from: 'atlanta', to: 'birmingham', intensity: 60 },
    { from: 'neworleans', to: 'atlanta', intensity: 55 },

    // Cross-country
    { from: 'kansascity', to: 'denver', intensity: 60 },
    { from: 'denver', to: 'losangeles', intensity: 55 },
    { from: 'omaha', to: 'denver', intensity: 50 },
];

// Helper functions
export function getCityById(id: string): CityData | undefined {
    return cities.find(c => c.id === id);
}

export function getCitiesByTier(minPop: number, maxPop?: number): CityData[] {
    return cities.filter(c => {
        const pop = c.population1930;
        return pop >= minPop && (maxPop === undefined || pop <= maxPop);
    });
}

export function getRoutesByCityId(cityId: string): TradeRoute[] {
    return tradeRoutes.filter(r => r.from === cityId || r.to === cityId);
}
