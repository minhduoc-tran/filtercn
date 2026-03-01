import { NextResponse } from "next/server";

const mockProducts = [
  {
    id: 1,
    name: "T-Shirt Basic",
    price: 15,
    status: "active",
    category: "shirts",
    is_published: true,
    created_at: "2024-01-01",
  },
  {
    id: 2,
    name: "Premium Hoodie",
    price: 45,
    status: "active",
    category: "shirts",
    is_published: true,
    created_at: "2024-02-15",
  },
  {
    id: 3,
    name: "Running Shoes X1",
    price: 120,
    status: "active",
    category: "shoes",
    is_published: true,
    created_at: "2024-03-10",
  },
  {
    id: 4,
    name: "Leather Wallet",
    price: 35,
    status: "draft",
    category: "accessories",
    is_published: false,
    created_at: "2024-04-05",
  },
  {
    id: 5,
    name: "Sunglasses V2",
    price: 85,
    status: "active",
    category: "accessories",
    is_published: true,
    created_at: "2024-05-20",
  },
  {
    id: 6,
    name: "Casual Sneakers",
    price: 65,
    status: "active",
    category: "shoes",
    is_published: true,
    created_at: "2024-06-12",
  },
  {
    id: 7,
    name: "Polo Shirt",
    price: 25,
    status: "draft",
    category: "shirts",
    is_published: false,
    created_at: "2024-07-01",
  },
  {
    id: 8,
    name: "Winter Jacket",
    price: 150,
    status: "active",
    category: "shirts",
    is_published: true,
    created_at: "2024-08-30",
  },
  {
    id: 9,
    name: "Sports Watch",
    price: 200,
    status: "active",
    category: "accessories",
    is_published: true,
    created_at: "2024-09-15",
  },
  {
    id: 10,
    name: "Formal Boots",
    price: 110,
    status: "draft",
    category: "shoes",
    is_published: false,
    created_at: "2024-10-05",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let filtered = [...mockProducts];

  // Global search from FilterBar
  const q = searchParams.get("q");
  if (q) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  }

  // Underscore-style simple parser
  for (const [key, value] of searchParams.entries()) {
    if (key === "q") continue;
    // Exact match: ?status=active
    if (key === "status") {
      filtered = filtered.filter((p) => p.status === value);
    } else if (key === "category") {
      filtered = filtered.filter((p) => p.category === value);
    }
    // Boolean match
    else if (key === "is_published") {
      filtered = filtered.filter((p) => p.is_published === (value === "true"));
    }
    // Partial Match: ?name__icontains=shirt
    else if (key === "name__icontains") {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(value.toLowerCase()));
    } else if (key === "name__not_icontains") {
      filtered = filtered.filter((p) => !p.name.toLowerCase().includes(value.toLowerCase()));
    } else if (key === "category__in") {
      const categories = value.split(",");
      filtered = filtered.filter((p) => categories.includes(p.category));
    }
    // Number thresholds: ?price__gte=50
    else if (key === "price__gte") {
      filtered = filtered.filter((p) => p.price >= Number(value));
    } else if (key === "price__lte") {
      filtered = filtered.filter((p) => p.price <= Number(value));
    }
    // Number exact: ?price=100
    else if (key === "price") {
      filtered = filtered.filter((p) => p.price === Number(value));
    }
    // Date ranges
    else if (key === "created_at__gte") {
      filtered = filtered.filter((p) => new Date(p.created_at) >= new Date(value));
    } else if (key === "created_at__lte") {
      filtered = filtered.filter((p) => new Date(p.created_at) <= new Date(value));
    }
    // Between / Range (underscore combines it as range=10,20)
    else if (key.endsWith("__range")) {
      const field = key.replace("__range", "") as keyof (typeof mockProducts)[0];
      const [minStr, maxStr] = value.split(",");

      if (field === "price" || field === "id") {
        filtered = filtered.filter(
          (p) => p[field] >= Number(minStr || 0) && p[field] <= Number(maxStr || Number.MAX_SAFE_INTEGER),
        );
      } else if (field === "created_at") {
        filtered = filtered.filter(
          (p) =>
            new Date(p[field] as string) >= new Date(minStr || "1970-01-01") &&
            new Date(p[field] as string) <= new Date(maxStr || "9999-12-31"),
        );
      }
    }
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  return NextResponse.json({
    total: mockProducts.length,
    count: filtered.length,
    results: filtered,
  });
}
