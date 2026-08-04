---
title: code example
date: 2026-08-04
description: Some code to see how it renders
---

# dotnet prime

Just checking this works.

```csharp
static bool IsPrime(int number)
{
    if (number <= 1) return false;
    if (number == 2) return true;
    if (number % 2 == 0) return false;

    int boundary = (int)Math.Floor(Math.Sqrt(number));

    for (int i = 3; i <= boundary; i += 2)
    {
        if (number % i == 0) return false;
    }

    return true;
}
```

```typescript
function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  const boundary = Math.floor(Math.sqrt(num));

  for (let i = 3; i <= boundary; i += 2) {
    if (num % i === 0) return false;
  }

  return true;
}
```

```js
function isPrime(num) {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  const boundary = Math.floor(Math.sqrt(num));

  for (let i = 3; i <= boundary; i += 2) {
    if (num % i === 0) return false;
  }

  return true;
}
```

```sql
WITH number_range AS (
    -- Generate all integers from 2 up to our limit (e.g., 100)
    SELECT n
    FROM generate_series(2, 100) AS n
)
SELECT n AS prime_number
FROM number_range nr
WHERE NOT EXISTS (
    -- Check if any number smaller than 'n' can divide 'n' perfectly
    SELECT 1
    FROM generate_series(2, floor(sqrt(nr.n))::integer) AS divisor
    WHERE nr.n % divisor = 0
)
ORDER BY n;
```
