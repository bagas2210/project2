-- =================================================================
-- SKEMA DATABASE ABSENSI QR CODE (SUPABASE POSTGRESQL)
-- Salin dan jalankan seluruh query ini di menu SQL Editor di Supabase
-- =================================================================

-- 1. Buat Tabel Sesi Absensi
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    qr_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Buat Tabel Riwayat Kehadiran (Attendances)
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    device_uuid VARCHAR(100) NOT NULL,
    device_fingerprint VARCHAR(100) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(50),
    checked_in_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- CONSTRAINT ANTI-KECURANGAN (1 Device = 1 Absen per Sesi)
    CONSTRAINT unique_device_per_session UNIQUE (session_id, device_uuid),
    CONSTRAINT unique_fingerprint_per_session UNIQUE (session_id, device_fingerprint)
);

-- 3. Indeks Performa
CREATE INDEX IF NOT EXISTS idx_sessions_qr_token ON public.sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_attendances_session_id ON public.attendances(session_id);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan Keamanan (RLS Policies)

-- A. Sessions: Admin dapat mengelola sesinya sendiri
CREATE POLICY "Admin CRUD own sessions"
ON public.sessions
FOR ALL
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- B. Sessions: Publik dapat membaca data sesi yang aktif untuk validasi form
CREATE POLICY "Public can view active sessions by token"
ON public.sessions
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > now()));

-- C. Attendances: Admin dapat melihat data presensi sesi yang dibuatnya
CREATE POLICY "Admin can view attendances"
ON public.attendances
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.sessions
        WHERE sessions.id = attendances.session_id
        AND sessions.created_by = auth.uid()
    )
);

-- D. Attendances: Publik dapat mengecek apakah perangkatnya sudah pernah absen
CREATE POLICY "Public check existing attendance"
ON public.attendances
FOR SELECT
TO anon, authenticated
USING (true);

-- E. Attendances: Publik dapat mengirimkan presensi baru ke sesi yang aktif
CREATE POLICY "Public insert attendance to active session"
ON public.attendances
FOR INSERT
TO anon, authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions
        WHERE sessions.id = attendances.session_id
        AND sessions.is_active = TRUE
        AND (sessions.expires_at IS NULL OR sessions.expires_at > now())
    )
);

-- 6. Aktifkan Supabase Realtime untuk tabel 'attendances'
-- Supaya tabel admin otomatis memperbarui daftar kehadiran tanpa refresh
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendances;

-- =================================================================
-- 7. KREDENSIAL AKUN ADMIN DEFAULT (OTOMATIS DIBUAT)
-- Email: admin@absensi.com
-- Password: admin123456
-- =================================================================
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@absensi.com',
  crypt('admin123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
)
ON CONFLICT (id) DO NOTHING;

