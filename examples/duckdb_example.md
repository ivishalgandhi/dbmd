---
database: ./population.duckdb
dbType: duckdb
showQuery: false
---

# DuckDB Population Data Analysis

This example demonstrates using DuckDB with the SQL Preview extension. DuckDB is a high-performance analytical database system, perfect for data analysis and complex queries.

## Sample Queries

### Population Statistics with Window Functions

```sql
WITH PopulationRanks AS (
    SELECT 
        name,
        population,
        continent,
        RANK() OVER (PARTITION BY continent ORDER BY population DESC) as rank_in_continent,
        ROUND(population * 100.0 / SUM(population) OVER (PARTITION BY continent), 2) as pct_of_continent
    FROM countries
)
SELECT *
FROM PopulationRanks
WHERE rank_in_continent <= 2
ORDER BY continent, rank_in_continent;
```

### Advanced GDP Analysis

```sql
SELECT 
    continent,
    COUNT(*) as countries,
    ROUND(AVG(gdp_usd::FLOAT / population)) as avg_gdp_per_capita,
    ROUND(STDDEV(gdp_usd::FLOAT / population), 2) as gdp_per_capita_stddev,
    MIN(gdp_usd::FLOAT / population) as min_gdp_per_capita,
    MAX(gdp_usd::FLOAT / population) as max_gdp_per_capita
FROM countries
GROUP BY continent
HAVING COUNT(*) > 1
ORDER BY avg_gdp_per_capita DESC;
```

### City Population Distribution

```sql
WITH CityStats AS (
    SELECT 
        c.continent,
        COUNT(*) as city_count,
        ROUND(AVG(ci.population), 0) as avg_city_pop,
        ROUND(STDDEV(ci.population), 0) as city_pop_stddev
    FROM cities ci
    JOIN countries c ON ci.country_id = c.id
    GROUP BY c.continent
)
SELECT 
    *,
    ROUND(city_pop_stddev / avg_city_pop * 100, 2) as coefficient_of_variation
FROM CityStats
ORDER BY avg_city_pop DESC;
```

### Geographic Analysis

```sql
SELECT 
    c.name as country,
    ci.name as city,
    ci.population,
    CASE 
        WHEN ci.latitude > 0 THEN 'Northern'
        ELSE 'Southern'
    END as hemisphere,
    ROUND(ABS(ci.latitude), 2) as distance_from_equator
FROM cities ci
JOIN countries c ON ci.country_id = c.id
ORDER BY ABS(ci.latitude) DESC
LIMIT 10;
```

### Population Density Clusters

```sql
WITH DensityGroups AS (
    SELECT 
        name,
        population,
        area_km2,
        ROUND(population::FLOAT / area_km2, 2) as density,
        NTILE(4) OVER (ORDER BY population::FLOAT / area_km2) as density_quartile
    FROM countries
)
SELECT 
    CASE density_quartile
        WHEN 1 THEN 'Low Density'
        WHEN 2 THEN 'Medium-Low Density'
        WHEN 3 THEN 'Medium-High Density'
        WHEN 4 THEN 'High Density'
    END as density_category,
    COUNT(*) as countries,
    ROUND(AVG(density), 2) as avg_density,
    MIN(name) as example_country
FROM DensityGroups
GROUP BY density_quartile
ORDER BY density_quartile;
```

## DuckDB Features Demonstrated

- Window Functions (RANK, NTILE)
- Statistical Functions (STDDEV, AVG)
- CASE Expressions
- Common Table Expressions (WITH clauses)
- Type Casting
- Aggregate Functions
- Conditional Grouping

## Notes

- DuckDB is particularly well-suited for analytical queries
- The queries demonstrate various SQL analytics features
- All population and geographic data is for demonstration
- Results include statistical analysis and data grouping
