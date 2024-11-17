-- Create and initialize tables for population data

-- Countries table
CREATE TABLE countries (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    continent VARCHAR NOT NULL,
    population BIGINT NOT NULL,
    area_km2 FLOAT NOT NULL,
    gdp_usd BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE cities (
    id INTEGER PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id),
    name VARCHAR NOT NULL,
    population INTEGER NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    is_capital BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample country data
INSERT INTO countries (id, name, continent, population, area_km2, gdp_usd) VALUES
(1, 'China', 'Asia', 1402112000, 9596961, 17734062645371),
(2, 'India', 'Asia', 1380004385, 3287263, 3176295000000),
(3, 'United States', 'North America', 331002651, 9833517, 22996100000000),
(4, 'Indonesia', 'Asia', 273523615, 1904569, 1186092991764),
(5, 'Pakistan', 'Asia', 220892340, 881913, 278222000000),
(6, 'Brazil', 'South America', 212559417, 8515770, 1444733258972),
(7, 'Nigeria', 'Africa', 206139589, 923768, 432293776262),
(8, 'Bangladesh', 'Asia', 164689383, 147570, 324239177786),
(9, 'Russia', 'Europe', 145912025, 17098246, 1483497784868),
(10, 'Mexico', 'North America', 128932753, 1964375, 1076163316172),
(11, 'Japan', 'Asia', 125836021, 377975, 4937422907017),
(12, 'Germany', 'Europe', 83783942, 357022, 3846413928654),
(13, 'France', 'Europe', 65273511, 551695, 2715518274227),
(14, 'United Kingdom', 'Europe', 67886011, 242495, 2827113184872),
(15, 'Singapore', 'Asia', 5850342, 728, 372062527489);

-- Insert sample city data
INSERT INTO cities (id, country_id, name, population, latitude, longitude, is_capital) VALUES
(1, 1, 'Shanghai', 27796000, 31.2304, 121.4737, false),
(2, 1, 'Beijing', 20896000, 39.9042, 116.4074, true),
(3, 2, 'Delhi', 30291000, 28.6139, 77.2090, true),
(4, 2, 'Mumbai', 20411000, 19.0760, 72.8777, false),
(5, 3, 'New York', 18819000, 40.7128, -74.0060, false),
(6, 3, 'Washington DC', 5322000, 38.9072, -77.0369, true),
(7, 4, 'Jakarta', 10770487, -6.2088, 106.8456, true),
(8, 5, 'Karachi', 16093786, 24.8607, 67.0011, false),
(9, 5, 'Islamabad', 1095064, 33.6844, 73.0479, true),
(10, 6, 'São Paulo', 22429800, -23.5505, -46.6333, false),
(11, 6, 'Brasília', 4645000, -15.7975, -47.8919, true),
(12, 7, 'Lagos', 14862111, 6.5244, 3.3792, false),
(13, 7, 'Abuja', 3464123, 9.0765, 7.3986, true),
(14, 8, 'Dhaka', 21006000, 23.8103, 90.4125, true),
(15, 9, 'Moscow', 12506468, 55.7558, 37.6173, true),
(16, 10, 'Mexico City', 9209944, 19.4326, -99.1332, true),
(17, 11, 'Tokyo', 37393129, 35.6762, 139.6503, true),
(18, 12, 'Berlin', 3669495, 52.5200, 13.4050, true),
(19, 13, 'Paris', 2148271, 48.8566, 2.3522, true),
(20, 14, 'London', 9002488, 51.5074, -0.1278, true),
(21, 15, 'Singapore', 5850342, 1.3521, 103.8198, true);

-- Create some useful views
CREATE VIEW population_density AS
SELECT 
    name,
    population,
    area_km2,
    ROUND(population::FLOAT / area_km2, 2) as density_per_km2
FROM countries
ORDER BY density_per_km2 DESC;

CREATE VIEW capital_cities AS
SELECT 
    ci.name as city,
    c.name as country,
    c.continent,
    ci.population,
    ci.latitude,
    ci.longitude
FROM cities ci
JOIN countries c ON ci.country_id = c.id
WHERE ci.is_capital = true;

CREATE VIEW continental_stats AS
SELECT 
    continent,
    COUNT(*) as num_countries,
    SUM(population) as total_population,
    ROUND(AVG(gdp_usd::FLOAT / population), 2) as avg_gdp_per_capita
FROM countries
GROUP BY continent
ORDER BY total_population DESC;
