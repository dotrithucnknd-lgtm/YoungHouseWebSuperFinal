import { supabase } from './supabaseClient';

// ==================== INTERFACES ====================

export interface RoomUnit {
  id: string;
  room_id: string;
  name: string;
  status: 'available' | 'rented' | 'maintenance';
  current_renter_id?: string;
  account_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  room_unit_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  deposit_amount: number;
  rent_amount: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  contract_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  owner_id: string;
  name: string;
  unit_price: number;
  unit: string;
  type: 'fixed' | 'variable';
  created_at: string;
}

export interface Invoice {
  id: string;
  room_unit_id: string;
  contract_id: string;
  month: number;
  year: number;
  total_amount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  service_id: string;
  old_index?: number | null;
  new_index?: number | null;
  usage?: number | null;
  unit_price: number;
  amount: number;
}

export interface MaintenanceRequest {
  id: string;
  room_unit_id: string;
  renter_id: string;
  title: string;
  description: string;
  image_urls: string[];
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TenantProfile {
  id: string;
  profile_id: string;
  id_card_number?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  university_id?: string;
  student_id?: string;
  hometown?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// Extended interfaces with relations
export interface RoomUnitWithDetails extends RoomUnit {
  rooms?: {
    id: string;
    title: string;
    address: string;
    banner?: string;
    price?: number;
    area?: number;
  };
  current_renter?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  contracts?: Contract[];
}

export interface ContractWithDetails extends Contract {
  room_units?: {
    id: string;
    name: string;
    rooms?: {
      id: string;
      title: string;
      address: string;
    };
  };
  renter?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

export interface InvoiceWithDetails extends Invoice {
  room_units?: {
    id: string;
    name: string;
    rooms?: {
      id: string;
      title: string;
    };
  };
  contracts?: {
    id: string;
    rent_amount?: number;
    renter?: {
      id: string;
      name: string;
      phone: string;
    };
  };
  invoice_items?: (InvoiceItem & {
    services?: Service;
  })[];
}

export interface MaintenanceRequestWithDetails extends MaintenanceRequest {
  room_units?: {
    id: string;
    name: string;
    rooms?: {
      id: string;
      title: string;
    };
  };
  renter?: {
    id: string;
    name: string;
    phone: string;
  };
  assigned_to?: string | null;
  assigned?: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  notes?: string | null;
  cost?: number;
  completed_at?: string | null;
}

// ==================== ROOM UNITS ====================

// Fetch all room units for a property (room)
export async function fetchRoomUnits(roomId: string): Promise<RoomUnitWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('room_units')
      .select(`
        *,
        rooms:room_id (
          id,
          title,
          address,
          banner
        ),
        current_renter:current_renter_id (
          id,
          name,
          phone
        )
      `)
      .eq('room_id', roomId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching room units:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchRoomUnits:', error);
    return [];
  }
}

// Fetch all room units for owner
export async function fetchOwnerRoomUnits(ownerId: string): Promise<RoomUnitWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('room_units')
      .select(`
        *,
        rooms!inner (
          id,
          title,
          address,
          banner,
          owner_id
        ),
        current_renter:current_renter_id (
          id,
          name,
          phone
        )
      `)
      .eq('rooms.owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching owner room units:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchOwnerRoomUnits:', error);
    return [];
  }
}

// Fetch all room units for admin, manager, operator
export async function fetchAllRoomUnits(): Promise<RoomUnitWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('room_units')
      .select(`
        *,
        rooms!inner (
          id,
          title,
          address,
          banner,
          owner_id
        ),
        current_renter:current_renter_id (
          id,
          name,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all room units:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAllRoomUnits:', error);
    return [];
  }
}

// Create a new room unit
export async function createRoomUnit(roomUnit: Omit<RoomUnit, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: RoomUnit | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('room_units')
      .insert(roomUnit)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createRoomUnit:', error);
    return { data: null, error: 'Có lỗi xảy ra khi tạo phòng' };
  }
}

// Update room unit
export async function updateRoomUnit(id: string, updates: Partial<RoomUnit>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('room_units')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateRoomUnit:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật phòng' };
  }
}

// Delete room unit
export async function deleteRoomUnit(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('room_units')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteRoomUnit:', error);
    return { error: 'Có lỗi xảy ra khi xóa phòng' };
  }
}

// ==================== CONTRACTS ====================

// Fetch contracts for a room unit
export async function fetchRoomUnitContracts(roomUnitId: string): Promise<ContractWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        room_units:room_unit_id (
          id,
          name,
          rooms:room_id (
            id,
            title,
            address
          )
        ),
        renter:renter_id (
          id,
          name,
          phone
        )
      `)
      .eq('room_unit_id', roomUnitId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchRoomUnitContracts:', error);
    return [];
  }
}

// Fetch all contracts for owner
export async function fetchOwnerContracts(ownerId: string): Promise<ContractWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        room_units:room_unit_id (
          id,
          name,
          rooms!inner (
            id,
            title,
            address,
            owner_id
          )
        ),
        renter:renter_id (
          id,
          name,
          phone
        )
      `)
      .eq('room_units.rooms.owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching owner contracts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchOwnerContracts:', error);
    return [];
  }
}

// Create a new contract
export async function createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Contract | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Update room unit status to rented
    await supabase
      .from('room_units')
      .update({ 
        status: 'rented',
        current_renter_id: contract.renter_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', contract.room_unit_id);

    return { data, error: null };
  } catch (error) {
    console.error('Error in createContract:', error);
    return { data: null, error: 'Có lỗi xảy ra khi tạo hợp đồng' };
  }
}

// Update contract
export async function updateContract(id: string, updates: Partial<Contract>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateContract:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật hợp đồng' };
  }
}

// Terminate contract
export async function terminateContract(id: string): Promise<{ error: string | null }> {
  try {
    // Get contract details
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('room_unit_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Update contract status
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ 
        status: 'terminated',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Update room unit status to available
    await supabase
      .from('room_units')
      .update({ 
        status: 'available',
        current_renter_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', contract.room_unit_id);

    return { error: null };
  } catch (error) {
    console.error('Error in terminateContract:', error);
    return { error: 'Có lỗi xảy ra khi kết thúc hợp đồng' };
  }
}

// ==================== SERVICES ====================

// Fetch services for owner
export async function fetchOwnerServices(ownerId: string): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchOwnerServices:', error);
    return [];
  }
}

// Create a new service
export async function createService(service: Omit<Service, 'id' | 'created_at'>): Promise<{ data: Service | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createService:', error);
    return { data: null, error: 'Có lỗi xảy ra khi tạo dịch vụ' };
  }
}

// Update service
export async function updateService(id: string, updates: Partial<Service>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateService:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật dịch vụ' };
  }
}

// Delete service
export async function deleteService(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteService:', error);
    return { error: 'Có lỗi xảy ra khi xóa dịch vụ' };
  }
}

// ==================== INVOICES ====================

// Fetch invoices for owner
export async function fetchOwnerInvoices(ownerId: string, filters?: {
  status?: string;
  month?: number;
  year?: number;
}): Promise<InvoiceWithDetails[]> {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        room_units:room_unit_id (
          id,
          name,
          rooms!inner (
            id,
            title,
            owner_id
          )
        ),
        contracts:contract_id (
          id,
          rent_amount,
          renter:renter_id (
            id,
            name,
            phone
          )
        ),
        invoice_items (
          *,
          services:service_id (
            id,
            name,
            unit,
            type
          )
        )
      `)
      .eq('room_units.rooms.owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.month) {
      query = query.eq('month', filters.month);
    }
    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchOwnerInvoices:', error);
    return [];
  }
}

// Create invoice with items
export async function createInvoice(
  invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>,
  items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
): Promise<{ data: Invoice | null; error: string | null }> {
  try {
    // Create invoice
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (invoiceError) {
      return { data: null, error: invoiceError.message };
    }

    // Create invoice items
    const itemsWithInvoiceId = items.map(item => ({
      ...item,
      invoice_id: invoiceData.id
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId);

    if (itemsError) {
      // Rollback invoice creation
      await supabase.from('invoices').delete().eq('id', invoiceData.id);
      return { data: null, error: itemsError.message };
    }

    return { data: invoiceData, error: null };
  } catch (error) {
    console.error('Error in createInvoice:', error);
    return { data: null, error: 'Có lỗi xảy ra khi tạo hóa đơn' };
  }
}

// Update invoice status
export async function updateInvoiceStatus(
  id: string,
  status: 'unpaid' | 'paid' | 'overdue',
  paymentDetails?: {
    payment_method?: string;
    payment_proof_url?: string;
  }
): Promise<{ error: string | null }> {
  try {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'paid') {
      updates.paid_at = new Date().toISOString();
      if (paymentDetails?.payment_method) {
        updates.payment_method = paymentDetails.payment_method;
      }
      if (paymentDetails?.payment_proof_url) {
        updates.payment_proof_url = paymentDetails.payment_proof_url;
      }
    }

    const { error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateInvoiceStatus:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật trạng thái hóa đơn' };
  }
}

// ==================== MAINTENANCE REQUESTS ====================

// Fetch maintenance requests for owner
export async function fetchOwnerMaintenanceRequests(
  ownerId: string,
  filters?: {
    status?: string;
    priority?: string;
  }
): Promise<any[]> {
  try {
    let query = supabase
      .from('maintenance_tickets')
      .select(`
        *,
        rooms!inner (
          id,
          title,
          address,
          owner_id
        ),
        renter:tenant_id (
          id,
          name,
          phone
        ),
        assigned:assigned_to (
          id,
          name,
          phone
        )
      `)
      .eq('rooms.owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      const dbStatus = filters.status === 'resolved' ? 'completed' : filters.status;
      query = query.eq('status', dbStatus);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching maintenance requests:', error);
      return [];
    }

    return (data || []).map((row: any) => {
      // Map database completed status back to resolved for frontend compatibility
      const mappedStatus = row.status === 'completed' ? 'resolved' : 
                           row.status === 'assigned' ? 'in_progress' : row.status;
      return {
        ...row,
        status: mappedStatus,
        room_units: {
          id: row.room_id,
          name: row.rooms?.title || 'Tòa nhà',
          rooms: row.rooms
        },
        renter: row.renter
      };
    });
  } catch (error) {
    console.error('Error in fetchOwnerMaintenanceRequests:', error);
    return [];
  }
}

// Update maintenance request status
export async function updateMaintenanceRequestStatus(
  id: string,
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'completed' | 'assigned' | 'cancelled'
): Promise<{ error: string | null }> {
  try {
    const dbStatus = status === 'resolved' ? 'completed' : status;
    const updates: any = {
      status: dbStatus,
      updated_at: new Date().toISOString()
    };

    if (dbStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('maintenance_tickets')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in updateMaintenanceRequestStatus:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật trạng thái yêu cầu' };
  }
}

// ==================== TENANT PROFILES ====================

// Fetch tenant profile
export async function fetchTenantProfile(profileId: string): Promise<TenantProfile | null> {
  try {
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error) {
      console.error('Error fetching tenant profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchTenantProfile:', error);
    return null;
  }
}

// Create or update tenant profile
export async function upsertTenantProfile(profile: Omit<TenantProfile, 'id' | 'created_at' | 'updated_at'>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('tenant_profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in upsertTenantProfile:', error);
    return { error: 'Có lỗi xảy ra khi cập nhật hồ sơ khách thuê' };
  }
}

// ==================== DASHBOARD STATISTICS ====================

export interface DashboardStats {
  totalRoomUnits: number;
  availableRoomUnits: number;
  rentedRoomUnits: number;
  maintenanceRoomUnits: number;
  activeContracts: number;
  expiringContracts: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  monthlyRevenue: number;
  pendingMaintenanceRequests: number;
}

export async function fetchOwnerDashboardStats(ownerId: string): Promise<DashboardStats> {
  try {
    // Fetch room units stats
    const { data: roomUnits } = await supabase
      .from('room_units')
      .select('status, rooms!inner(owner_id)')
      .eq('rooms.owner_id', ownerId);

    const totalRoomUnits = roomUnits?.length || 0;
    const availableRoomUnits = roomUnits?.filter(r => r.status === 'available').length || 0;
    const rentedRoomUnits = roomUnits?.filter(r => r.status === 'rented').length || 0;
    const maintenanceRoomUnits = roomUnits?.filter(r => r.status === 'maintenance').length || 0;

    // Fetch contracts stats
    const { data: contracts } = await supabase
      .from('contracts')
      .select('status, end_date, room_units!inner(rooms!inner(owner_id))')
      .eq('room_units.rooms.owner_id', ownerId);

    const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
    
    // Calculate expiring contracts (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringContracts = contracts?.filter(c => {
      if (c.status !== 'active') return false;
      const endDate = new Date(c.end_date);
      return endDate <= thirtyDaysFromNow && endDate >= new Date();
    }).length || 0;

    // Fetch invoices stats
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data: invoices } = await supabase
      .from('invoices')
      .select('status, total_amount, room_units!inner(rooms!inner(owner_id))')
      .eq('room_units.rooms.owner_id', ownerId);

    const unpaidInvoices = invoices?.filter(i => i.status === 'unpaid').length || 0;
    const overdueInvoices = invoices?.filter(i => i.status === 'overdue').length || 0;

    // Calculate monthly revenue (paid invoices this month)
    const monthlyRevenue = invoices
      ?.filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

    // Fetch maintenance requests stats
    const { data: maintenanceRequests } = await supabase
      .from('maintenance_requests')
      .select('status, room_units!inner(rooms!inner(owner_id))')
      .eq('room_units.rooms.owner_id', ownerId)
      .eq('status', 'pending');

    const pendingMaintenanceRequests = maintenanceRequests?.length || 0;

    return {
      totalRoomUnits,
      availableRoomUnits,
      rentedRoomUnits,
      maintenanceRoomUnits,
      activeContracts,
      expiringContracts,
      unpaidInvoices,
      overdueInvoices,
      monthlyRevenue,
      pendingMaintenanceRequests,
    };
  } catch (error) {
    console.error('Error in fetchOwnerDashboardStats:', error);
    return {
      totalRoomUnits: 0,
      availableRoomUnits: 0,
      rentedRoomUnits: 0,
      maintenanceRoomUnits: 0,
      activeContracts: 0,
      expiringContracts: 0,
      unpaidInvoices: 0,
      overdueInvoices: 0,
      monthlyRevenue: 0,
      pendingMaintenanceRequests: 0,
    };
  }
}


// ==================== TENANTS MANAGEMENT ====================

export interface TenantWithDetails {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  DoB?: string;
  avatar?: string;
  tenant_profile?: TenantProfile;
  current_contract?: {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    room_unit?: {
      id: string;
      name: string;
      room?: {
        id: string;
        title: string;
        address: string;
      };
    };
  };
  has_temporary_residence: boolean;
  stay_status: 'not_rented' | 'renting' | 'moved_out';
}

/**
 * Fetch all tenants for an owner (from tenant_profiles only)
 */
export async function fetchOwnerTenants(ownerId: string): Promise<TenantWithDetails[]> {
  try {
    // Get all tenant profiles first
    const { data: tenantProfiles, error: tenantProfilesError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (tenantProfilesError) {
      console.error('Error fetching tenant profiles:', tenantProfilesError);
      return [];
    }

    if (!tenantProfiles || tenantProfiles.length === 0) {
      return [];
    }

    const profileIds = tenantProfiles.map(tp => tp.profile_id);

    // Get profiles separately
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', profileIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    // Get all contracts for these renters with owner's rooms
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        renter_id,
        start_date,
        end_date,
        status,
        room_unit_id,
        room_units (
          id,
          name,
          room_id,
          rooms (
            id,
            title,
            address,
            owner_id
          )
        )
      `)
      .in('renter_id', profileIds)
      .eq('room_units.rooms.owner_id', ownerId);

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
    }

    // Build tenant list with details
    const tenants: TenantWithDetails[] = tenantProfiles.map(tenantProfile => {
      const profile = profiles?.find(p => p.id === tenantProfile.profile_id);
      
      if (!profile) {
        return null;
      }

      // Find current active contract
      const currentContract = contracts?.find(c => 
        c.renter_id === tenantProfile.profile_id && 
        c.status === 'active'
      );

      // Determine stay status
      let stayStatus: 'not_rented' | 'renting' | 'moved_out' = 'not_rented';
      if (currentContract) {
        stayStatus = 'renting';
      } else {
        const hasAnyContract = contracts?.some(c => c.renter_id === tenantProfile.profile_id);
        if (hasAnyContract) {
          stayStatus = 'moved_out';
        }
      }

      // Check temporary residence from metadata
      const hasTemporaryResidence = tenantProfile.metadata?.has_temporary_residence || false;

      return {
        id: profile.id,
        name: profile.name || 'N/A',
        phone: profile.phone || 'N/A',
        email: tenantProfile.metadata?.email || undefined,
        role: profile.role,
        DoB: profile.dob,
        avatar: profile.avatar,
        tenant_profile: tenantProfile,
        current_contract: currentContract ? {
          id: currentContract.id,
          start_date: currentContract.start_date,
          end_date: currentContract.end_date,
          status: currentContract.status,
          room_unit: {
            id: (currentContract.room_units as any).id,
            name: (currentContract.room_units as any).name,
            room: {
              id: (currentContract.room_units as any).rooms.id,
              title: (currentContract.room_units as any).rooms.title,
              address: (currentContract.room_units as any).rooms.address,
            }
          }
        } : undefined,
        has_temporary_residence: hasTemporaryResidence,
        stay_status: stayStatus,
      };
    }).filter(t => t !== null) as TenantWithDetails[];

    return tenants;
  } catch (error) {
    console.error('Error in fetchOwnerTenants:', error);
    return [];
  }
}

/**
 * Create a new tenant profile
 */
export async function createTenant(data: {
  name: string;
  phone: string;
  email?: string;
  DoB?: string;
  id_card_number?: string;
  hometown?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}): Promise<{ success: boolean; error?: string; tenantId?: string }> {
  try {
    const profileId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

    // First, create a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        dob: data.DoB || null,
        role: 'tenant',
      })
      .select()
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Then create tenant profile if additional info provided
    if (data.id_card_number || data.hometown || data.emergency_contact_name) {
      const { error: tenantProfileError } = await supabase
        .from('tenant_profiles')
        .insert({
          profile_id: profile.id,
          id_card_number: data.id_card_number,
          hometown: data.hometown,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
        });

      if (tenantProfileError) {
        console.error('Error creating tenant profile:', tenantProfileError);
        // Don't fail the whole operation, just log the error
      }
    }

    return { success: true, tenantId: profile.id };
  } catch (error: any) {
    console.error('Error in createTenant:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra khi tạo khách thuê' };
  }
}

/**
 * Update tenant information
 */
export async function updateTenant(
  tenantId: string,
  data: {
    name?: string;
    phone?: string;
    email?: string;
    DoB?: string;
    id_card_number?: string;
    hometown?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update profile
    const profileData: any = {};
    if (data.name) profileData.name = data.name;
    if (data.phone) profileData.phone = data.phone;
    if (data.email !== undefined) profileData.email = data.email;
    if (data.DoB !== undefined) profileData.DoB = data.DoB;

    if (Object.keys(profileData).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', tenantId);

      if (profileError) {
        return { success: false, error: profileError.message };
      }
    }

    // Update tenant profile
    const tenantProfileData: any = {};
    if (data.id_card_number !== undefined) tenantProfileData.id_card_number = data.id_card_number;
    if (data.hometown !== undefined) tenantProfileData.hometown = data.hometown;
    if (data.emergency_contact_name !== undefined) tenantProfileData.emergency_contact_name = data.emergency_contact_name;
    if (data.emergency_contact_phone !== undefined) tenantProfileData.emergency_contact_phone = data.emergency_contact_phone;

    if (Object.keys(tenantProfileData).length > 0) {
      tenantProfileData.updated_at = new Date().toISOString();
      
      const { error: tenantProfileError } = await supabase
        .from('tenant_profiles')
        .upsert({
          profile_id: tenantId,
          ...tenantProfileData,
        });

      if (tenantProfileError) {
        console.error('Error updating tenant profile:', tenantProfileError);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in updateTenant:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra khi cập nhật khách thuê' };
  }
}

/**
 * Delete a tenant (soft delete - only if no active contracts)
 */
export async function deleteTenant(tenantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if tenant has any active contracts
    const { data: activeContracts, error: checkError } = await supabase
      .from('contracts')
      .select('id')
      .eq('renter_id', tenantId)
      .eq('status', 'active');

    if (checkError) {
      return { success: false, error: checkError.message };
    }

    if (activeContracts && activeContracts.length > 0) {
      return { success: false, error: 'Không thể xóa khách thuê đang có hợp đồng hoạt động' };
    }

    // Delete tenant profile first
    await supabase
      .from('tenant_profiles')
      .delete()
      .eq('profile_id', tenantId);

    // Delete profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', tenantId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteTenant:', error);
    return { success: false, error: error.message || 'Có lỗi xảy ra khi xóa khách thuê' };
  }
}

