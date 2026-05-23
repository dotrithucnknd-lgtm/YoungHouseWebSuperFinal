import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      phone,
      email,
      DoB,
      gender,
      occupation,
      id_card_number,
      id_card_issue_date,
      id_card_issue_place,
      hometown,
      has_temporary_residence,
      emergency_contact_name,
      emergency_contact_relationship,
      emergency_contact_phone,
    } = body;

    // Validate required fields
    if (!name || !phone || !id_card_number) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: Họ tên, SĐT, CCCD' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Số điện thoại đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    // Create profile with generated UUID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        name,
        phone,
        DoB: DoB || null,
        role: 'renter',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return NextResponse.json(
        { error: 'Không thể tạo profile: ' + profileError.message },
        { status: 500 }
      );
    }

    // Create tenant profile (without image URLs)
    const { error: tenantProfileError } = await supabase
      .from('tenant_profiles')
      .insert({
        profile_id: profile.id,
        id_card_number,
        id_card_issue_date: id_card_issue_date || null,
        id_card_issue_place: id_card_issue_place || null,
        hometown: hometown || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        metadata: {
          email: email || null,
          gender,
          occupation,
          emergency_contact_relationship,
          has_temporary_residence,
        }
      });

    if (tenantProfileError) {
      console.error('Error creating tenant profile:', tenantProfileError);
      // Don't fail the whole operation, just log the error
    }

    return NextResponse.json({
      success: true,
      tenant: profile,
    });
  } catch (error: any) {
    console.error('Error in POST /api/tenants:', error);
    return NextResponse.json(
      { error: error.message || 'Có lỗi xảy ra' },
      { status: 500 }
    );
  }
}

