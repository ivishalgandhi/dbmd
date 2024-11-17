---
database: ./population.sqlite
showQuery: false
---

# World Population Data Analysis

This markdown file demonstrates the SQL Preview extension using a sample world population database. The database contains information about countries and their major cities, including population data, geographical information, and economic indicators.

## Database Schema

The database consists of two main tables:
- `countries`: Contains country-level data including population, area, and GDP
- `cities`: Contains city-level data including population, coordinates, and capital city status

## Sample Queries

### Top 5 Most Populous Countries

```sql
SELECT 
    name,
    population,
    ROUND(CAST(gdp_usd AS FLOAT) / population, 2) as gdp_per_capita
FROM countries 
ORDER BY population DESC 
LIMIT 5;
```

### Population Density Analysis

```sql
SELECT 
    name,
    population,
    area_km2,
    ROUND(CAST(population AS FLOAT) / area_km2, 2) as density_per_km2
FROM countries 
ORDER BY density_per_km2 DESC;
```

### Cities vs Country Population

```sql
SELECT 
    c.name as country_name,
    ci.name as city_name,
    ci.population as city_population,
    c.population as country_population,
    ROUND(CAST(ci.population AS FLOAT) / c.population * 100, 2) as percentage
FROM cities ci
JOIN countries c ON ci.country_id = c.id
ORDER BY percentage DESC;
```

### Continental Population Distribution

```sql
SELECT 
    continent,
    COUNT(*) as num_countries,
    SUM(population) as total_population,
    ROUND(AVG(CAST(gdp_usd AS FLOAT) / population), 2) as avg_gdp_per_capita
FROM countries
GROUP BY continent
ORDER BY total_population DESC;
```

### Capital Cities by Population

```sql
SELECT 
    ci.name as capital_city,
    c.name as country,
    ci.population,
    ROUND(ci.latitude, 2) as lat,
    ROUND(ci.longitude, 2) as lng
FROM cities ci
JOIN countries c ON ci.country_id = c.id
WHERE ci.is_capital = 1
ORDER BY ci.population DESC;
```

## Using this Example

1. Open this markdown file in VS Code
2. Make sure the SQL Preview extension is installed
3. Click the "Preview SQL Query" button or use the command palette
4. See the query results rendered directly in the markdown preview

## Notes

- Population data is based on recent estimates
- GDP values are in USD
- Geographical coordinates are in decimal degrees
- Area is in square kilometers
