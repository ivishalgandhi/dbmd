-- Create countries table
CREATE TABLE countries (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    continent TEXT NOT NULL,
    area_km2 INTEGER,
    population INTEGER,
    gdp_usd BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table
CREATE TABLE cities (
    id INTEGER PRIMARY KEY,
    country_id INTEGER,
    name TEXT NOT NULL,
    population INTEGER,
    latitude REAL,
    longitude REAL,
    is_capital BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- Insert sample country data
INSERT INTO countries (name, continent, area_km2, population, gdp_usd) VALUES
('China', 'Asia', 9596961, 1439323776, 14722731697894),
('India', 'Asia', 3287263, 1380004385, 2622984100000),
('United States', 'North America', 9833517, 331002651, 20936600000000),
('Indonesia', 'Asia', 1904569, 273523615, 1058424592573),
('Pakistan', 'Asia', 881913, 220892340, 278222356134),
('Brazil', 'South America', 8515770, 212559417, 1444733258972),
('Nigeria', 'Africa', 923768, 206139589, 432293776262),
('Bangladesh', 'Asia', 147570, 164689383, 324239177915),
('Russia', 'Europe', 17098246, 145912025, 1483497784868),
('Japan', 'Asia', 377975, 126476461, 5064872876716);

-- Insert sample city data
INSERT INTO cities (country_id, name, population, latitude, longitude, is_capital) VALUES
(1, 'Shanghai', 27796000, 31.2304, 121.4737, 0),
(1, 'Beijing', 20896000, 39.9042, 116.4074, 1),
(2, 'Mumbai', 20411000, 19.0760, 72.8777, 0),
(2, 'New Delhi', 30291000, 28.6139, 77.2090, 1),
(3, 'New York', 18819000, 40.7128, -74.0060, 0),
(3, 'Washington DC', 5322000, 38.9072, -77.0369, 1),
(4, 'Jakarta', 10770487, -6.2088, 106.8456, 1),
(5, 'Karachi', 16093786, 24.8607, 67.0011, 0),
(5, 'Islamabad', 1095064, 33.6844, 73.0479, 1),
(6, 'São Paulo', 22429800, -23.5505, -46.6333, 0),
(6, 'Brasília', 3055149, -15.7975, -47.8919, 1),
(7, 'Lagos', 14862111, 6.5244, 3.3792, 0),
(7, 'Abuja', 3464123, 9.0765, 7.3986, 1),
(8, 'Dhaka', 21741090, 23.8103, 90.4125, 1),
(9, 'Moscow', 12506468, 55.7558, 37.6173, 1),
(10, 'Tokyo', 37393129, 35.6762, 139.6503, 1);
