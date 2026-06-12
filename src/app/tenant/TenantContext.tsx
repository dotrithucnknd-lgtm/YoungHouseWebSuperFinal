"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

interface TenantContextType {
  roomUnit: any;
  contract: any;
  invoices: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roomUnit, setRoomUnit] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchTenantData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Fetch Room Unit associated with this current_renter_id
      let { data: unitData, error: unitError } = await supabase
        .from("room_units")
        .select(`
          *,
          rooms (
            id,
            title,
            address
          )
        `)
        .eq("current_renter_id", user?.id)
        .maybeSingle();

      if (unitError) console.error("Error fetching room unit:", unitError);

      // Fallback: metadata trong tenant_profiles (khi liên kết vừa được tạo)
      if (!unitData) {
        const { data: tenantProfile } = await supabase
          .from("tenant_profiles")
          .select("metadata")
          .eq("profile_id", user?.id)
          .maybeSingle();

        const linkedRoomUnitId = (tenantProfile?.metadata as { room_unit_id?: string } | null)
          ?.room_unit_id;

        if (linkedRoomUnitId) {
          const { data: linkedUnit, error: linkedError } = await supabase
            .from("room_units")
            .select(`
              *,
              rooms (
                id,
                title,
                address
              )
            `)
            .eq("id", linkedRoomUnitId)
            .maybeSingle();

          if (linkedError) {
            console.error("Error fetching linked room unit:", linkedError);
          } else if (linkedUnit) {
            unitData = linkedUnit;
          }
        }
      }
      
      let finalUnit = unitData;
      let finalContract = null;

      // 2. Fetch contract (either linked to this room unit, or renter profile directly)
      if (unitData) {
        setRoomUnit(unitData);
        
        const { data: contractData, error: contractError } = await supabase
          .from("contracts")
          .select("*")
          .eq("room_unit_id", unitData.id)
          .eq("status", "active")
          .maybeSingle();

        if (contractError) console.error("Error fetching contract:", contractError);
        if (contractData) {
          setContract(contractData);
          finalContract = contractData;
        } else {
          setContract(null);
        }
      } else {
        // Fallback: search contract directly for renter_id
        const { data: contractData } = await supabase
          .from("contracts")
          .select(`
            *,
            room_units (
              *,
              rooms (
                id,
                title,
                address
              )
            )
          `)
          .eq("renter_id", user?.id)
          .eq("status", "active")
          .maybeSingle();

        if (contractData) {
          setContract(contractData);
          finalContract = contractData;
          if (contractData.room_units) {
            setRoomUnit(contractData.room_units);
            finalUnit = contractData.room_units;
          }
        } else {
          setRoomUnit(null);
          setContract(null);
        }
      }

      // 3. Fetch Invoices for this Room Unit
      const targetUnitId = finalUnit?.id;
      if (targetUnitId) {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            *,
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
          .eq("room_unit_id", targetUnitId)
          .order("created_at", { ascending: false });

        if (invoicesError) console.error("Error fetching invoices:", invoicesError);
        setInvoices(invoicesData || []);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error in fetchTenantData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchTenantData();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  return (
    <TenantContext.Provider value={{ roomUnit, contract, invoices, loading, refreshData: fetchTenantData }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
