-- =========================================================================
-- SETUP RLS POLICIES FOR TENANT DASHBOARD (MEMBER PORTAL)
-- Run this in your Supabase SQL Editor to grant proper access.
-- =========================================================================

-- Enable RLS on all necessary tables if not enabled already
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Table Policies
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 2. Rooms (Buildings) Table Policies
-- Allow tenants to read houses/buildings they are staying in
DROP POLICY IF EXISTS "Allow authenticated users to view buildings" ON public.rooms;
CREATE POLICY "Allow authenticated users to view buildings"
ON public.rooms
FOR SELECT
TO authenticated
USING (true);

-- 3. Room Units Table Policies
-- Allow tenants to read the room unit linked to their current_renter_id
DROP POLICY IF EXISTS "Allow tenants to view their linked room unit" ON public.room_units;
CREATE POLICY "Allow tenants to view their linked room unit"
ON public.room_units
FOR SELECT
TO authenticated
USING (current_renter_id = auth.uid());

-- 4. Contracts Table Policies
-- Allow tenants to read their active contracts (by renter_id or matching room account)
DROP POLICY IF EXISTS "Allow tenants to view their contracts" ON public.contracts;
CREATE POLICY "Allow tenants to view their contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  renter_id = auth.uid() OR 
  room_unit_id IN (
    SELECT id FROM public.room_units WHERE current_renter_id = auth.uid()
  )
);

-- 5. Invoices Table Policies
-- Allow tenants to read invoices belonging to their room unit
DROP POLICY IF EXISTS "Allow tenants to view their invoices" ON public.invoices;
CREATE POLICY "Allow tenants to view their invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (
  room_unit_id IN (
    SELECT id FROM public.room_units WHERE current_renter_id = auth.uid()
  )
);

-- 6. Services Table Policies
-- Allow authenticated users to view unit pricing/services metadata
DROP POLICY IF EXISTS "Allow authenticated to view services" ON public.services;
CREATE POLICY "Allow authenticated to view services"
ON public.services
FOR SELECT
TO authenticated
USING (true);

-- 7. Invoice Items Table Policies
-- Allow tenants to view invoice line items for their invoices
DROP POLICY IF EXISTS "Allow tenants to view their invoice items" ON public.invoice_items;
CREATE POLICY "Allow tenants to view their invoice items"
ON public.invoice_items
FOR SELECT
TO authenticated
USING (
  invoice_id IN (
    SELECT id FROM public.invoices 
    WHERE room_unit_id IN (
      SELECT id FROM public.room_units WHERE current_renter_id = auth.uid()
    )
  )
);

-- 8. Maintenance Tickets Table Policies
-- Allow tenants to insert and read their own maintenance tickets
DROP POLICY IF EXISTS "Allow tenants to insert maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Allow tenants to insert maintenance tickets"
ON public.maintenance_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = auth.uid()
);

DROP POLICY IF EXISTS "Allow tenants to view their own maintenance tickets" ON public.maintenance_tickets;
CREATE POLICY "Allow tenants to view their own maintenance tickets"
ON public.maintenance_tickets
FOR SELECT
TO authenticated
USING (
  tenant_id = auth.uid()
);

-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
