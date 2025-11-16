---
database: ./Chinook.db
dbType: sqlite
showQuery: false
---

# Chinook Music Store Database - SQLite Example

The Chinook database represents a digital music store with complete data about artists, albums, tracks, customers, and sales. It's the industry-standard sample database used for demonstrating SQL capabilities.

## Database Schema Overview

- **Artists** & **Albums** - Music catalog
- **Tracks** & **Genres** - Individual songs with metadata
- **Customers** & **Employees** - People data
- **Invoices** & **InvoiceLines** - Sales transactions
- **Playlists** - Music collections

## Sample Queries

### Top 10 Best-Selling Tracks

```sql
SELECT 
    t.Name AS Track,
    ar.Name AS Artist,
    al.Title AS Album,
    COUNT(il.InvoiceLineId) AS TimesSold,
    ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS TotalRevenue
FROM Track t
JOIN Album al ON t.AlbumId = al.AlbumId
JOIN Artist ar ON al.ArtistId = ar.ArtistId
JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY t.TrackId
ORDER BY TimesSold DESC
LIMIT 10;
```

### Sales by Country

```sql
SELECT 
    BillingCountry AS Country,
    COUNT(DISTINCT CustomerId) AS Customers,
    COUNT(InvoiceId) AS Orders,
    ROUND(SUM(Total), 2) AS TotalSales,
    ROUND(AVG(Total), 2) AS AvgOrderValue
FROM Invoice
GROUP BY BillingCountry
ORDER BY TotalSales DESC
LIMIT 10;
```

### Most Popular Genres

```sql
SELECT 
    g.Name AS Genre,
    COUNT(DISTINCT t.TrackId) AS Tracks,
    COUNT(DISTINCT al.AlbumId) AS Albums,
    COUNT(il.InvoiceLineId) AS Purchases,
    ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS Revenue
FROM Genre g
JOIN Track t ON g.GenreId = t.GenreId
JOIN Album al ON t.AlbumId = al.AlbumId
LEFT JOIN InvoiceLine il ON t.TrackId = il.TrackId
GROUP BY g.GenreId
ORDER BY Revenue DESC;
```

### Customer Lifetime Value

```sql
SELECT 
    c.FirstName || ' ' || c.LastName AS Customer,
    c.Country,
    c.Email,
    COUNT(i.InvoiceId) AS Orders,
    ROUND(SUM(i.Total), 2) AS TotalSpent,
    ROUND(AVG(i.Total), 2) AS AvgOrderValue,
    DATE(MIN(i.InvoiceDate)) AS FirstPurchase,
    DATE(MAX(i.InvoiceDate)) AS LastPurchase
FROM Customer c
JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY c.CustomerId
ORDER BY TotalSpent DESC
LIMIT 15;
```

### Employee Sales Performance

```sql
SELECT 
    e.FirstName || ' ' || e.LastName AS Employee,
    e.Title,
    COUNT(DISTINCT c.CustomerId) AS CustomersManaged,
    COUNT(i.InvoiceId) AS TotalSales,
    ROUND(SUM(i.Total), 2) AS Revenue,
    ROUND(AVG(i.Total), 2) AS AvgSaleAmount
FROM Employee e
LEFT JOIN Customer c ON e.EmployeeId = c.SupportRepId
LEFT JOIN Invoice i ON c.CustomerId = i.CustomerId
WHERE c.CustomerId IS NOT NULL
GROUP BY e.EmployeeId
ORDER BY Revenue DESC;
```

### Album Analysis with Track Count

```sql
SELECT 
    ar.Name AS Artist,
    al.Title AS Album,
    COUNT(t.TrackId) AS TrackCount,
    ROUND(SUM(t.Milliseconds) / 60000.0, 2) AS TotalMinutes,
    COUNT(DISTINCT g.Name) AS GenreCount,
    GROUP_CONCAT(DISTINCT g.Name) AS Genres
FROM Artist ar
JOIN Album al ON ar.ArtistId = al.ArtistId
JOIN Track t ON al.AlbumId = t.AlbumId
JOIN Genre g ON t.GenreId = g.GenreId
GROUP BY al.AlbumId
HAVING TrackCount > 10
ORDER BY TrackCount DESC
LIMIT 15;
```

## SQL Features Demonstrated

- **Aggregations**: COUNT, SUM, AVG, MIN, MAX
- **Joins**: INNER JOIN, LEFT JOIN across multiple tables
- **Grouping**: GROUP BY with HAVING clauses
- **String Functions**: Concatenation with ||
- **Date Functions**: DATE()
- **Mathematical Operations**: ROUND(), calculations
- **Advanced Functions**: GROUP_CONCAT()
- **Subqueries**: Nested SELECT statements
- **Sorting**: ORDER BY with multiple columns
- **Filtering**: WHERE and HAVING clauses

## About the Chinook Database

The Chinook database is based on the Chinook Digital Media Store sample database, representing a real-world business scenario. It's widely used in:
- SQL tutorials and training
- Database performance testing
- ORM and tool demonstrations
- Learning complex query patterns

**Schema Design**: Normalized database with proper foreign keys and indexes
**Size**: ~1MB with realistic data volumes
**Source**: [Chinook Database on GitHub](https://github.com/lerocha/chinook-database)

## Try It Yourself

1. Open this file in VS Code
2. Press `Cmd+Shift+V` / `Ctrl+Shift+V` for native preview
3. All SQL queries will execute and display results as tables
4. Modify queries and save to see updated results

Experiment with different queries to explore:
- Customer purchasing patterns
- Artist and album popularity
- Sales trends by region
- Employee performance metrics
- Music catalog statistics
