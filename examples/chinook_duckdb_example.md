---
database: ./Chinook.duckdb
dbType: duckdb
showQuery: false
---

# Chinook Music Store Database - DuckDB Example

The Chinook database represents a digital music store with complete data about artists, albums, tracks, customers, and sales. This version demonstrates DuckDB's advanced analytical capabilities.

## Database Schema Overview

- **Artists** & **Albums** - Music catalog
- **Tracks** & **Genres** - Individual songs with metadata
- **Customers** & **Employees** - People data
- **Invoices** & **InvoiceLine** - Sales transactions
- **Playlists** - Music collections

## Sample Queries

### Top Artists by Album Count

```sql
SELECT 
    ANY_VALUE(ar.Name) AS Artist,
    COUNT(al.AlbumId) AS Albums,
    COUNT(DISTINCT g.GenreId) AS UniqueGenres
FROM Artist ar
JOIN Album al ON ar.ArtistId = al.ArtistId
JOIN Track t ON al.AlbumId = t.AlbumId
JOIN Genre g ON t.GenreId = g.GenreId
GROUP BY ar.ArtistId
ORDER BY Albums DESC
LIMIT 10;
```

### Sales Analysis with Window Functions

```sql
SELECT 
    BillingCountry AS Country,
    ROUND(SUM(Total), 2) AS TotalSales,
    COUNT(*) AS Orders,
    ROUND(AVG(Total), 2) AS AvgOrder,
    ROUND(SUM(Total) * 100.0 / SUM(SUM(Total)) OVER (), 2) AS PctOfTotal,
    RANK() OVER (ORDER BY SUM(Total) DESC) AS SalesRank
FROM Invoice
GROUP BY BillingCountry
ORDER BY TotalSales DESC
LIMIT 10;
```

### Customer Segmentation using NTILE

```sql
WITH CustomerValue AS (
    SELECT 
        c.CustomerId,
        ANY_VALUE(c.FirstName || ' ' || c.LastName) AS Customer,
        ANY_VALUE(c.Country) AS Country,
        ROUND(SUM(i.Total), 2) AS TotalSpent,
        COUNT(i.InvoiceId) AS OrderCount
    FROM Customer c
    JOIN Invoice i ON c.CustomerId = i.CustomerId
    GROUP BY c.CustomerId
)
SELECT 
    Customer,
    Country,
    TotalSpent,
    OrderCount,
    NTILE(4) OVER (ORDER BY TotalSpent) AS ValueQuartile,
    CASE NTILE(4) OVER (ORDER BY TotalSpent)
        WHEN 4 THEN 'Premium'
        WHEN 3 THEN 'Gold'
        WHEN 2 THEN 'Silver'
        ELSE 'Bronze'
    END AS Segment
FROM CustomerValue
ORDER BY TotalSpent DESC
LIMIT 20;
```

### Track Popularity with Revenue Analysis

```sql
SELECT 
    ANY_VALUE(t.Name) AS Track,
    ANY_VALUE(ar.Name) AS Artist,
    ANY_VALUE(g.Name) AS Genre,
    COUNT(il.InvoiceLineId) AS TimesPurchased,
    ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue,
    ROUND(AVG(il.UnitPrice), 2) AS AvgPrice,
    ROUND(t.Milliseconds / 60000.0, 2) AS Minutes
FROM Track t
JOIN Album al ON t.AlbumId = al.AlbumId
JOIN Artist ar ON al.ArtistId = ar.ArtistId
JOIN Genre g ON t.GenreId = g.GenreId
JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY t.TrackId, t.Milliseconds
ORDER BY TimesPurchased DESC
LIMIT 15;
```

### Monthly Sales Trends

```sql
SELECT 
    EXTRACT(YEAR FROM InvoiceDate) AS Year,
    EXTRACT(MONTH FROM InvoiceDate) AS Month,
    COUNT(*) AS Orders,
    ROUND(SUM(Total), 2) AS Revenue,
    ROUND(AVG(Total), 2) AS AvgOrderValue,
    LAG(ROUND(SUM(Total), 2)) OVER (ORDER BY EXTRACT(YEAR FROM InvoiceDate), EXTRACT(MONTH FROM InvoiceDate)) AS PrevMonthRevenue,
    ROUND((SUM(Total) - LAG(SUM(Total)) OVER (ORDER BY EXTRACT(YEAR FROM InvoiceDate), EXTRACT(MONTH FROM InvoiceDate))) * 100.0 / 
          NULLIF(LAG(SUM(Total)) OVER (ORDER BY EXTRACT(YEAR FROM InvoiceDate), EXTRACT(MONTH FROM InvoiceDate)), 0), 2) AS GrowthPct
FROM Invoice
GROUP BY EXTRACT(YEAR FROM InvoiceDate), EXTRACT(MONTH FROM InvoiceDate)
ORDER BY Year, Month;
```

### Genre Performance with Statistical Analysis

```sql
SELECT 
    ANY_VALUE(g.Name) AS Genre,
    COUNT(DISTINCT t.TrackId) AS Tracks,
    COUNT(DISTINCT al.AlbumId) AS Albums,
    COUNT(il.InvoiceLineId) AS Purchases,
    ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue,
    ROUND(AVG(il.UnitPrice * il.Quantity), 2) AS AvgSaleValue,
    ROUND(STDDEV(il.UnitPrice * il.Quantity), 2) AS StdDev,
    ROUND(MIN(il.UnitPrice * il.Quantity), 2) AS MinSale,
    ROUND(MAX(il.UnitPrice * il.Quantity), 2) AS MaxSale
FROM Genre g
JOIN Track t ON g.GenreId = t.GenreId
JOIN Album al ON t.AlbumId = al.AlbumId
LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY g.GenreId
HAVING COUNT(il.InvoiceLineId) > 0
ORDER BY Revenue DESC;
```

## DuckDB Features Demonstrated

- **Window Functions**: RANK(), NTILE(), LAG(), SUM() OVER()
- **Statistical Functions**: STDDEV(), AVG(), MIN(), MAX()
- **Date Functions**: EXTRACT(YEAR/MONTH)
- **Aggregations**: COUNT(), SUM(), AVG() with DISTINCT
- **CTEs**: WITH clauses for complex queries
- **ANY_VALUE()**: DuckDB's aggregate for non-grouped columns
- **NULLIF()**: Handle division by zero
- **CASE Expressions**: Conditional logic
- **Percentage Calculations**: Comparing to totals
- **Growth Analysis**: Period-over-period comparisons

## DuckDB vs SQLite

DuckDB excels at:
- ✅ Analytical queries (OLAP workloads)
- ✅ Complex aggregations and window functions
- ✅ Statistical analysis (STDDEV, MEDIAN, etc.)
- ✅ Columnar storage for fast aggregations
- ✅ Advanced SQL features (CTEs, window functions)
- ✅ Larger datasets and parallel processing

Perfect for:
- Business intelligence and reporting
- Data analysis and exploration
- Time-series analysis
- Statistical computations

## About the Chinook Database

The Chinook database is based on the Chinook Digital Media Store sample database, representing a real-world business scenario.

**Schema Design**: Normalized database with proper foreign keys and indexes
**Size**: ~1MB with realistic data volumes
**Source**: [Chinook Database on GitHub](https://github.com/lerocha/chinook-database)

## Try It Yourself

1. Open this file in VS Code
2. Press `Cmd+Shift+V` / `Ctrl+Shift+V` for native preview
3. All SQL queries will execute and display results as tables
4. Modify queries and save to see updated results

Experiment with DuckDB's advanced features:
- Window functions for ranking and analysis
- Statistical functions for data science
- CTEs for complex multi-step queries
- Time-series analysis with date functions
