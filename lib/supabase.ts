// Wrapper client untuk Supabase REST API
// Menggunakan service_role karena dipanggil dari sisi server (API routes)
// Bypass RLS karena auth kita tangani sendiri pakai JWT middleware
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

const REST_URL = `${SUPABASE_URL}/rest/v1`;

interface SupabaseQueryOptions {
  select?: string;
  filter?: Record<string, string>;
  order?: string;
  limit?: number;
  offset?: number;
  single?: boolean;
}

function buildUrl(table: string, options?: SupabaseQueryOptions): string {
  const url = new URL(`${REST_URL}/${table}`);

  if (options?.select) {
    url.searchParams.set("select", options.select);
  }

  if (options?.filter) {
    for (const [key, value] of Object.entries(options.filter)) {
      url.searchParams.set(key, value);
    }
  }

  if (options?.order) {
    url.searchParams.set("order", options.order);
  }

  if (options?.limit) {
    url.searchParams.set("limit", String(options.limit));
  }

  if (options?.offset) {
    url.searchParams.set("offset", String(options.offset));
  }

  return url.toString();
}

function getHeaders(options?: { single?: boolean; prefer?: string }): HeadersInit {
  const headers: HeadersInit = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  if (options?.single) {
    headers["Accept"] = "application/vnd.pgrst.object+json";
  }

  if (options?.prefer) {
    headers["Prefer"] = options.prefer;
  }

  return headers;
}

export const supabase = {
  async select<T>(table: string, options?: SupabaseQueryOptions): Promise<T[]> {
    const url = buildUrl(table, options);
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase select error: ${error}`);
    }

    return res.json();
  },

  async selectOne<T>(table: string, options?: SupabaseQueryOptions): Promise<T | null> {
    const url = buildUrl(table, { ...options, limit: 1 });
    const res = await fetch(url, {
      method: "GET",
      headers: getHeaders({ single: true }),
      cache: "no-store",
    });

    if (res.status === 406) return null;
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase selectOne error: ${error}`);
    }

    return res.json();
  },

  async insert<T>(table: string, data: Record<string, unknown> | Record<string, unknown>[], returnData = true): Promise<T[]> {
    const url = buildUrl(table);
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders({
        prefer: returnData ? "return=representation" : "return=minimal",
      }),
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase insert error: ${error}`);
    }

    if (!returnData) return [] as T[];
    return res.json();
  },

  async update<T>(table: string, filter: Record<string, string>, data: Record<string, unknown>): Promise<T[]> {
    const url = buildUrl(table, { filter });
    const res = await fetch(url, {
      method: "PATCH",
      headers: getHeaders({ prefer: "return=representation" }),
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase update error: ${error}`);
    }

    return res.json();
  },

  async delete(table: string, filter: Record<string, string>): Promise<void> {
    const url = buildUrl(table, { filter });
    const res = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase delete error: ${error}`);
    }
  },

  async rpc<T>(functionName: string, params?: Record<string, unknown>): Promise<T> {
    const url = `${REST_URL}/rpc/${functionName}`;
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(params || {}),
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Supabase rpc error: ${error}`);
    }

    return res.json();
  },
};
